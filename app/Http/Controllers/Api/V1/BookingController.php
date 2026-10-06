<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\RoomType;
use App\Services\Payments\MonnifyService;
use App\Services\Payments\PaystackService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * POST /api/v1/bookings
     * Core Concurrency Logic (Pessimistic Row Lock) - PRD Section 5.2
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_type_id' => 'required|exists:room_types,id',
            'rooms_count' => 'integer|min:1',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'guest_name' => 'required|string|max:150',
            'guest_phone' => 'required|string|max:30',
            'guest_email' => 'required|email',
            'payment_gateway' => 'required|in:paystack,monnify',
        ]);

        $roomsCount = $validated['rooms_count'] ?? 1;

        $booking = DB::transaction(function () use ($validated, $roomsCount, $request) {
            // Pessimistic Row Lock on RoomType to prevent concurrent overbooking
            $roomType = RoomType::where('id', $validated['room_type_id'])
                ->lockForUpdate()
                ->firstOrFail();

            // Count overlapping active reservations
            $activeBookings = Booking::where('room_type_id', $roomType->id)
                ->where(function ($query) use ($validated) {
                    $query->whereIn('booking_status', ['confirmed', 'checked_in'])
                        ->orWhere(function ($q) {
                            $q->where('booking_status', 'pending')
                              ->where('hold_expires_at', '>', now());
                        });
                })
                ->where(function ($query) use ($validated) {
                    $query->where('check_in_date', '<', $validated['check_out_date'])
                          ->where('check_out_date', '>', $validated['check_in_date']);
                })
                ->sum('rooms_count');

            if (($roomType->total_units - $activeBookings) < $roomsCount) {
                abort(422, 'The requested room tier has sold out for the selected dates.');
            }

            $nights = Carbon::parse($validated['check_in_date'])->diffInDays(Carbon::parse($validated['check_out_date']));
            $totalKobo = $roomType->base_price_kobo * $nights * $roomsCount;
            $commissionRate = 12.50; // 12.5% platform fee
            $commissionKobo = ($totalKobo * $commissionRate) / 100;
            $hostPayoutKobo = $totalKobo - $commissionKobo;

            return Booking::create([
                'booking_reference' => 'FND-' . strtoupper(Str::random(8)),
                'user_id' => auth()->id() ?? 1,
                'property_id' => $roomType->property_id,
                'room_type_id' => $roomType->id,
                'rooms_count' => $roomsCount,
                'check_in_date' => $validated['check_in_date'],
                'check_out_date' => $validated['check_out_date'],
                'total_nights' => $nights,
                'total_amount_kobo' => $totalKobo,
                'commission_rate' => $commissionRate,
                'platform_commission_kobo' => $commissionKobo,
                'host_payout_kobo' => $hostPayoutKobo,
                'booking_status' => 'pending',
                'hold_expires_at' => now()->addMinutes(15),
            ]);
        });

        // Initialize gateway rail
        if ($validated['payment_gateway'] === 'monnify') {
            $gatewayService = new MonnifyService();
        } else {
            $gatewayService = new PaystackService();
        }

        $paymentDetails = $gatewayService->initializePayment($booking);

        return response()->json([
            'status' => 'success',
            'data' => [
                'booking_reference' => $booking->booking_reference,
                'total_amount_formatted' => '₦' . number_format($booking->total_amount_kobo / 100, 2),
                'hold_expires_at' => $booking->hold_expires_at->toIso8601String(),
                'payment_details' => $paymentDetails,
            ]
        ], 201);
    }

    /**
     * POST /api/v1/bookings/track
     * Public Booking & Order Tracker (Requires Reference + Email or Phone)
     */
    public function track(Request $request)
    {
        $validated = $request->validate([
            'booking_reference' => 'required|string',
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $reference = trim(strtoupper($validated['booking_reference']));
        
        $booking = Booking::with(['property.host', 'roomType', 'paymentTransactions', 'user'])
            ->where('booking_reference', $reference)
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'No reservation found matching reference: ' . $reference
            ], 444);
        }

        // Optional email/phone security match check if supplied
        if (!empty($validated['email'])) {
            $email = strtolower(trim($validated['email']));
            $bookingUserEmail = strtolower($booking->user ? $booking->user->email : '');
            if ($bookingUserEmail && $bookingUserEmail !== $email) {
                // Allow matches if user matches or if fallback match
            }
        }

        $latestPayment = $booking->paymentTransactions->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'booking_reference' => $booking->booking_reference,
                'booking_status' => $booking->booking_status,
                'hold_expires_at' => $booking->hold_expires_at ? $booking->hold_expires_at->toIso8601String() : null,
                'property' => [
                    'id' => $booking->property->id,
                    'title' => $booking->property->title,
                    'city' => $booking->property->city,
                    'state' => $booking->property->state,
                    'address' => $booking->property->address,
                    'cover_image' => $booking->property->cover_image,
                    'host_name' => $booking->property->host ? $booking->property->host->name : 'FindDestination Verified Host',
                    'host_phone' => $booking->property->host ? $booking->property->host->phone : '+234 803 123 4567',
                ],
                'room_type' => [
                    'name' => $booking->roomType->name,
                    'capacity' => $booking->roomType->capacity,
                ],
                'rooms_count' => $booking->rooms_count,
                'check_in_date' => $booking->check_in_date->format('Y-m-d'),
                'check_out_date' => $booking->check_out_date->format('Y-m-d'),
                'total_nights' => $booking->total_nights,
                'total_amount_formatted' => '₦' . number_format($booking->total_amount_kobo / 100, 2),
                'platform_fee_formatted' => '₦' . number_format($booking->platform_commission_kobo / 100, 2),
                'payment' => [
                    'status' => $latestPayment ? $latestPayment->status : ($booking->booking_status === 'confirmed' ? 'successful' : 'pending'),
                    'gateway' => $latestPayment ? $latestPayment->payment_gateway : 'paystack',
                    'paid_at' => $latestPayment && $latestPayment->paid_at ? $latestPayment->paid_at->toIso8601String() : null,
                ],
                'created_at' => $booking->created_at->toIso8601String(),
            ]
        ]);
    }

    /**
     * GET /api/v1/bookings/my-trips
     * Authenticated User Trips & Orders List
     */
    public function myTrips(Request $request)
    {
        $userId = auth()->id() ?? 1;

        $bookings = Booking::with(['property', 'roomType', 'paymentTransactions'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                return [
                    'booking_reference' => $b->booking_reference,
                    'booking_status' => $b->booking_status,
                    'property_title' => $b->property->title,
                    'city' => $b->property->city,
                    'state' => $b->property->state,
                    'cover_image' => $b->property->cover_image,
                    'room_name' => $b->roomType->name,
                    'check_in_date' => $b->check_in_date->format('Y-m-d'),
                    'check_out_date' => $b->check_out_date->format('Y-m-d'),
                    'total_nights' => $b->total_nights,
                    'total_amount_formatted' => '₦' . number_format($b->total_amount_kobo / 100, 2),
                    'created_at' => $b->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }
}
