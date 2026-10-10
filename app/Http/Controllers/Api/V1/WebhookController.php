<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Mail\BookingConfirmationMail;
use App\Services\Payments\MonnifyService;
use App\Services\Payments\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class WebhookController extends Controller
{
    /**
     * POST /api/v1/payments/webhooks/paystack
     */
    public function handlePaystack(Request $request)
    {
        $signature = $request->header('X-Paystack-Signature');
        $rawPayload = $request->getContent();

        $service = new PaystackService();
        if (!$signature || !$service->verifyWebhookSignature($rawPayload, $signature)) {
            Log::warning('Paystack webhook signature verification failed.');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        if ($event === 'charge.success') {
            $data = $request->input('data');
            $reference = $data['reference'] ?? null;

            if ($reference) {
                // Remove 'PST-' prefix if exists
                $cleanRef = str_replace('PST-', '', $reference);
                $booking = Booking::where('booking_reference', $cleanRef)->first();

                if ($booking) {
                    $booking->update([
                        'booking_status' => 'confirmed',
                        'hold_expires_at' => null,
                    ]);

                    PaymentTransaction::where('booking_id', $booking->id)->update([
                        'status' => 'successful',
                        'raw_webhook_payload' => $data,
                        'paid_at' => now(),
                    ]);

                    $this->dispatchBookingConfirmationEmail($booking);
                }
            }
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * POST /api/v1/payments/webhooks/monnify
     */
    public function handleMonnify(Request $request)
    {
        $signature = $request->header('monnify-signature');
        $rawPayload = $request->getContent();

        $service = new MonnifyService();
        if (!$signature || !$service->verifyWebhookSignature($rawPayload, $signature)) {
            Log::warning('Monnify webhook signature verification failed.');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 401);
        }

        $eventType = $request->input('eventType');
        if ($eventType === 'SUCCESSFUL_TRANSACTION') {
            $eventData = $request->input('eventData');
            $transactionReference = $eventData['paymentReference'] ?? null;

            if ($transactionReference) {
                $cleanRef = str_replace('MNF-', '', $transactionReference);
                $booking = Booking::where('booking_reference', $cleanRef)->first();

                if ($booking) {
                    $booking->update([
                        'booking_status' => 'confirmed',
                        'hold_expires_at' => null,
                    ]);

                    PaymentTransaction::where('booking_id', $booking->id)->update([
                        'status' => 'successful',
                        'raw_webhook_payload' => $eventData,
                        'paid_at' => now(),
                    ]);

                    $this->dispatchBookingConfirmationEmail($booking);
                }
            }
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Safe asynchronous email dispatch for booking confirmation & escrow certificate
     */
    private function dispatchBookingConfirmationEmail(Booking $booking)
    {
        try {
            $booking->load(['property', 'roomType', 'user']);
            $userEmail = $booking->user ? $booking->user->email : null;
            if ($userEmail) {
                Mail::to($userEmail)->send(new BookingConfirmationMail([
                    'reference' => $booking->booking_reference,
                    'guestName' => $booking->user->name ?? 'Valued Guest',
                    'propertyName' => $booking->property->title ?? 'FindDestination Verified Stay',
                    'propertyAddress' => ($booking->property->address ?? '') . ', ' . ($booking->property->city ?? '') . ', ' . ($booking->property->state ?? ''),
                    'roomName' => $booking->roomType->name ?? 'Executive Suite',
                    'checkInDate' => $booking->check_in_date->format('M d, Y'),
                    'checkOutDate' => $booking->check_out_date->format('M d, Y'),
                    'nights' => $booking->total_nights,
                    'totalAmount' => '₦' . number_format($booking->total_amount_kobo / 100, 2),
                ]));
            }
        } catch (\Throwable $e) {
            Log::error('SMTP Webhook Booking Confirmation Email Failed: ' . $e->getMessage());
        }
    }
}
