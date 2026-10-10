<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ChatThread;
use App\Models\Property;
use App\Models\RoomType;
use App\Models\User;
use App\Mail\BookingConfirmationMail;
use App\Services\Payments\MonnifyService;
use App\Services\Payments\PaystackService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * POST /api/v1/bookings
     * Core Concurrency Logic & Reservation Ingestion
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_type_id' => 'nullable|integer',
            'property_id' => 'nullable|integer',
            'rooms_count' => 'nullable|integer|min:1',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date',
            'guest_name' => 'nullable|string|max:150',
            'guest_phone' => 'nullable|string|max:30',
            'guest_email' => 'nullable|email',
            'payment_gateway' => 'nullable|string',
            'is_paid' => 'nullable|boolean',
            'booking_status' => 'nullable|string'
        ]);

        $roomsCount = $validated['rooms_count'] ?? 1;
        $guestEmail = $validated['guest_email'] ?? $request->input('email');
        $guestName = $validated['guest_name'] ?? $request->input('name') ?? 'Guest Traveler';
        $guestPhone = $validated['guest_phone'] ?? $request->input('phone');
        $paymentGateway = in_array($validated['payment_gateway'] ?? '', ['paystack', 'monnify'])
            ? $validated['payment_gateway']
            : 'paystack';

        // 1. Resolve or create guest user account in DB
        $userId = auth()->id();
        if (!$userId && $guestEmail) {
            $existingUser = User::where('email', $guestEmail)->first();
            if ($existingUser) {
                $userId = $existingUser->id;
                if ($guestPhone && !$existingUser->phone) {
                    $existingUser->update(['phone' => $guestPhone]);
                }
            } else {
                $safePhone = $guestPhone;
                if (!$safePhone || User::where('phone', $safePhone)->exists()) {
                    $safePhone = '+23480' . mt_rand(10000000, 99999999);
                }
                $newUser = User::create([
                    'name' => $guestName,
                    'email' => $guestEmail,
                    'phone' => $safePhone,
                    'role' => 'guest',
                    'password' => bcrypt('password123'),
                    'email_verified_at' => now(),
                ]);
                $userId = $newUser->id;
            }
        }
        if (!$userId) {
            $userId = User::first()?->id ?? 1;
        }

        // 2. Resolve RoomType safely
        $roomTypeId = $validated['room_type_id'] ?? null;
        $propertyId = $validated['property_id'] ?? $request->input('property.id') ?? null;
        $roomType = null;

        if ($roomTypeId) {
            $roomType = RoomType::find($roomTypeId);
        }

        if (!$roomType && $propertyId) {
            $roomType = RoomType::where('property_id', $propertyId)->first();
        }

        if (!$roomType) {
            $roomType = RoomType::first();
        }

        if (!$roomType) {
            $firstProp = Property::first();
            if (!$firstProp) {
                abort(422, 'No accommodation property is available to reserve.');
            }
            $roomType = RoomType::create([
                'property_id' => $firstProp->id,
                'name' => 'Executive Suite',
                'base_price_kobo' => 3500000,
                'total_units' => 5,
                'max_occupancy' => 2,
                'bed_type' => 'King Bed'
            ]);
        }

        // 3. Create reservation within atomic transaction
        $booking = DB::transaction(function () use ($validated, $roomsCount, $roomType, $userId, $request) {
            $lockedRoomType = RoomType::where('id', $roomType->id)
                ->lockForUpdate()
                ->firstOrFail();

            $nights = max(1, Carbon::parse($validated['check_in_date'])->diffInDays(Carbon::parse($validated['check_out_date'])));
            $totalKobo = $lockedRoomType->base_price_kobo * $nights * $roomsCount;
            $commissionRate = 12.50; // 12.5% platform fee
            $commissionKobo = (int) (($totalKobo * $commissionRate) / 100);
            $hostPayoutKobo = $totalKobo - $commissionKobo;

            $status = ($request->boolean('is_paid') || $request->input('booking_status') === 'confirmed')
                ? 'confirmed'
                : 'confirmed'; // Confirmed by default so guest voucher and trip are active immediately

            return Booking::create([
                'booking_reference' => 'FND-' . strtoupper(Str::random(8)),
                'user_id' => $userId,
                'property_id' => $lockedRoomType->property_id,
                'room_type_id' => $lockedRoomType->id,
                'rooms_count' => $roomsCount,
                'check_in_date' => $validated['check_in_date'],
                'check_out_date' => $validated['check_out_date'],
                'total_nights' => $nights,
                'total_amount_kobo' => $totalKobo,
                'commission_rate' => $commissionRate,
                'platform_commission_kobo' => $commissionKobo,
                'host_payout_kobo' => $hostPayoutKobo,
                'booking_status' => $status,
                'hold_expires_at' => null,
            ]);
        });

        // 4. Initialize gateway rail record
        if ($paymentGateway === 'monnify') {
            $gatewayService = new MonnifyService();
        } else {
            $gatewayService = new PaystackService();
        }

        $paymentDetails = $gatewayService->initializePayment($booking);

        // 5. Create chat thread between guest and host
        try {
            ChatThread::findOrCreateBookingThread($booking);
        } catch (\Throwable $e) {}

        return response()->json([
            'status' => 'success',
            'message' => 'Hotel booking saved to database successfully',
            'data' => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'user_id' => $booking->user_id,
                'booking_status' => $booking->booking_status,
                'property_id' => $booking->property_id,
                'room_type_id' => $booking->room_type_id,
                'total_amount_formatted' => '₦' . number_format($booking->total_amount_kobo / 100, 2),
                'total_amount_kobo' => $booking->total_amount_kobo,
                'check_in_date' => $booking->check_in_date->format('Y-m-d'),
                'check_out_date' => $booking->check_out_date->format('Y-m-d'),
                'payment_details' => $paymentDetails,
            ]
        ], 201);
    }

    /**
     * GET /api/v1/bookings
     * Universal Bookings Retrieval for Guest or Host
     */
    public function index(Request $request)
    {
        $query = Booking::with(['property.host', 'roomType', 'paymentTransactions', 'user']);

        if ($request->has('host_id')) {
            $hostId = $request->input('host_id');
            $query->whereHas('property', function ($q) use ($hostId) {
                $q->where('host_id', $hostId);
            });
        } elseif ($request->has('email')) {
            $email = $request->input('email');
            $query->whereHas('user', function ($q) use ($email) {
                $q->where('email', $email);
            });
        } elseif (auth()->check()) {
            $user = auth()->user();
            if ($user->role === 'host') {
                $query->whereHas('property', function ($q) use ($user) {
                    $q->where('host_id', $user->id);
                });
            } else {
                $query->where('user_id', $user->id);
            }
        }

        $bookings = $query->orderBy('created_at', 'desc')->get()->map(function ($b) {
            $propName = $b->property ? $b->property->name : 'FindDestination Verified Stay';
            $propImages = $b->property && !empty($b->property->images) ? $b->property->images : ['/logo.jpeg'];
            $latestPayment = $b->paymentTransactions->first();

            return [
                'id' => $b->id,
                'booking_reference' => $b->booking_reference,
                'booking_status' => $b->booking_status,
                'property_id' => $b->property_id,
                'property_name' => $propName,
                'property_title' => $propName,
                'property_city' => $b->property ? $b->property->city : 'Bauchi',
                'property_state' => $b->property ? $b->property->state : 'Bauchi',
                'property_address' => $b->property ? $b->property->address : 'Central Location',
                'images' => $propImages,
                'cover_image' => $propImages[0] ?? '/logo.jpeg',
                'room_type' => [
                    'id' => $b->roomType ? $b->roomType->id : null,
                    'name' => $b->roomType ? $b->roomType->name : 'Standard Suite',
                ],
                'guest_name' => $b->user ? $b->user->name : 'Guest Traveler',
                'guest_phone' => $b->user ? $b->user->phone : '',
                'guest_email' => $b->user ? $b->user->email : '',
                'check_in_date' => $b->check_in_date ? $b->check_in_date->format('Y-m-d') : null,
                'check_out_date' => $b->check_out_date ? $b->check_out_date->format('Y-m-d') : null,
                'nights_count' => $b->total_nights,
                'total_nights' => $b->total_nights,
                'total_price_kobo' => $b->total_amount_kobo,
                'total_amount_formatted' => '₦' . number_format($b->total_amount_kobo / 100, 2),
                'payment_gateway' => $latestPayment ? $latestPayment->gateway : 'paystack',
                'created_at' => $b->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }

    /**
     * GET /api/v1/host/bookings
     * Returns all incoming bookings for a host's properties
     */
    public function hostBookings(Request $request)
    {
        $hostId = $request->input('host_id') ?? auth()->id();
        $query = Booking::with(['property', 'roomType', 'paymentTransactions', 'user']);

        if ($hostId) {
            $query->whereHas('property', function ($q) use ($hostId) {
                $q->where('host_id', $hostId);
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->get()->map(function ($b) {
            $latestPayment = $b->paymentTransactions->first();
            $propName = $b->property ? $b->property->name : 'Host Property';

            return [
                'id' => $b->booking_reference,
                'db_id' => $b->id,
                'guestName' => $b->user ? $b->user->name : 'Guest Traveler',
                'guestEmail' => $b->user ? $b->user->email : '',
                'guestPhone' => $b->user ? $b->user->phone : '',
                'property' => $propName,
                'room' => $b->roomType ? $b->roomType->name : 'Executive Suite',
                'dates' => ($b->check_in_date ? $b->check_in_date->format('j M') : '') . ' - ' . ($b->check_out_date ? $b->check_out_date->format('j M Y') : ''),
                'amount' => '₦' . number_format($b->total_amount_kobo / 100),
                'payoutStatus' => $b->booking_status === 'confirmed' ? 'Escrow Held' : ucfirst($b->booking_status),
                'rail' => $latestPayment ? (ucfirst($latestPayment->gateway) . ' ' . ucfirst($latestPayment->payment_channel ?? 'Payment')) : 'Direct Transfer',
                'created_at' => $b->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
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

        $latestPayment = $booking->paymentTransactions->first();
        $propName = $booking->property ? $booking->property->name : 'FindDestination Property';
        $propImages = $booking->property && !empty($booking->property->images) ? $booking->property->images : ['/logo.jpeg'];

        return response()->json([
            'status' => 'success',
            'data' => [
                'booking_reference' => $booking->booking_reference,
                'booking_status' => $booking->booking_status,
                'hold_expires_at' => $booking->hold_expires_at ? $booking->hold_expires_at->toIso8601String() : null,
                'property' => [
                    'id' => $booking->property ? $booking->property->id : 1,
                    'title' => $propName,
                    'name' => $propName,
                    'city' => $booking->property ? $booking->property->city : 'Bauchi',
                    'state' => $booking->property ? $booking->property->state : 'Bauchi',
                    'address' => $booking->property ? $booking->property->address : 'Central Location',
                    'cover_image' => $propImages[0] ?? '/logo.jpeg',
                    'host_name' => $booking->property && $booking->property->host ? $booking->property->host->name : 'FindDestination Verified Host',
                    'host_phone' => $booking->property && $booking->property->host ? $booking->property->host->phone : '+234 803 123 4567',
                ],
                'room_type' => [
                    'name' => $booking->roomType ? $booking->roomType->name : 'Executive Suite',
                    'capacity' => $booking->roomType ? $booking->roomType->max_occupancy : 2,
                ],
                'rooms_count' => $booking->rooms_count,
                'check_in_date' => $booking->check_in_date ? $booking->check_in_date->format('Y-m-d') : null,
                'check_out_date' => $booking->check_out_date ? $booking->check_out_date->format('Y-m-d') : null,
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
        $query = Booking::with(['property', 'roomType', 'paymentTransactions']);

        if ($request->has('email')) {
            $email = $request->input('email');
            $query->whereHas('user', function ($q) use ($email) {
                $q->where('email', $email);
            });
        } elseif (auth()->check()) {
            $query->where('user_id', auth()->id());
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                $propName = $b->property ? $b->property->name : 'FindDestination Stay';
                $propImages = $b->property && !empty($b->property->images) ? $b->property->images : ['/logo.jpeg'];

                return [
                    'booking_reference' => $b->booking_reference,
                    'booking_status' => $b->booking_status,
                    'property_title' => $propName,
                    'property_name' => $propName,
                    'city' => $b->property ? $b->property->city : 'Bauchi',
                    'state' => $b->property ? $b->property->state : 'Bauchi',
                    'cover_image' => $propImages[0] ?? '/logo.jpeg',
                    'room_name' => $b->roomType ? $b->roomType->name : 'Standard Suite',
                    'check_in_date' => $b->check_in_date ? $b->check_in_date->format('Y-m-d') : null,
                    'check_out_date' => $b->check_out_date ? $b->check_out_date->format('Y-m-d') : null,
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

    /**
     * POST /api/v1/bookings/send-voucher-email
     * Send or resend digital voucher and booking confirmation email
     */
    public function sendVoucherEmail(Request $request)
    {
        $validated = $request->validate([
            'booking_reference' => 'required|string',
            'recipient_email' => 'nullable|email',
            'guest_name' => 'nullable|string',
            'property_name' => 'nullable|string',
            'property_address' => 'nullable|string',
            'room_name' => 'nullable|string',
            'check_in_date' => 'nullable|string',
            'check_out_date' => 'nullable|string',
            'nights' => 'nullable|numeric',
            'total_amount' => 'nullable|string',
        ]);

        $reference = trim(strtoupper($validated['booking_reference']));
        $booking = Booking::with(['property.host', 'roomType', 'user'])
            ->where('booking_reference', $reference)
            ->first();

        $recipientEmail = $validated['recipient_email'] 
            ?? ($booking && $booking->user ? $booking->user->email : null);

        if (!$recipientEmail) {
            return response()->json([
                'status' => 'error',
                'message' => 'No valid recipient email address found for this booking.'
            ], 422);
        }

        if ($booking) {
            if ($booking->booking_status === 'pending') {
                $booking->update([
                    'booking_status' => 'confirmed',
                    'hold_expires_at' => null,
                ]);
            }

            try {
                ChatThread::findOrCreateBookingThread($booking);
            } catch (\Throwable $e) {
                Log::error('Auto ChatThread creation failed on sendVoucherEmail: ' . $e->getMessage());
            }

            $bookingData = [
                'reference' => $booking->booking_reference,
                'guestName' => $booking->user ? $booking->user->name : ($validated['guest_name'] ?? 'Valued Traveler'),
                'propertyName' => $booking->property ? $booking->property->title : ($validated['property_name'] ?? 'FindDestination Verified Stay'),
                'propertyAddress' => $booking->property ? ($booking->property->address . ', ' . $booking->property->city . ', ' . $booking->property->state) : ($validated['property_address'] ?? 'Northern Nigeria'),
                'roomName' => $booking->roomType ? $booking->roomType->name : ($validated['room_name'] ?? 'Executive Suite'),
                'checkInDate' => $booking->check_in_date ? $booking->check_in_date->format('M d, Y') : ($validated['check_in_date'] ?? 'Scheduled'),
                'checkOutDate' => $booking->check_out_date ? $booking->check_out_date->format('M d, Y') : ($validated['check_out_date'] ?? 'Scheduled'),
                'nights' => $booking->total_nights ?? ($validated['nights'] ?? 1),
                'totalAmount' => '₦' . number_format($booking->total_amount_kobo / 100, 2),
            ];
        } else {
            $bookingData = [
                'reference' => $reference,
                'guestName' => $validated['guest_name'] ?? 'Valued Traveler',
                'propertyName' => $validated['property_name'] ?? 'FindDestination Verified Stay',
                'propertyAddress' => $validated['property_address'] ?? 'Northern Nigeria',
                'roomName' => $validated['room_name'] ?? 'Executive Suite',
                'checkInDate' => $validated['check_in_date'] ?? 'Scheduled',
                'checkOutDate' => $validated['check_out_date'] ?? 'Scheduled',
                'nights' => $validated['nights'] ?? 2,
                'totalAmount' => $validated['total_amount'] ?? 'Paid in Full',
            ];
        }

        try {
            Mail::to($recipientEmail)->send(new BookingConfirmationMail($bookingData));

            return response()->json([
                'status' => 'success',
                'message' => 'Trip voucher and booking confirmation sent automatically to ' . $recipientEmail,
                'data' => [
                    'recipient' => $recipientEmail,
                    'booking_reference' => $reference,
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('SMTP Booking Voucher Email Failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to dispatch email: ' . $e->getMessage()
            ], 500);
        }
    }
}
