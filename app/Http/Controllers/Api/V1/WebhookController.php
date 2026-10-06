<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Services\Payments\MonnifyService;
use App\Services\Payments\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
                }
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}
