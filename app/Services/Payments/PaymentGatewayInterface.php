<?php

namespace App\Services\Payments;

use App\Models\Booking;

interface PaymentGatewayInterface
{
    public function initializePayment(Booking $booking): array;
    public function verifyWebhookSignature(string $payload, string $signature): bool;
    public function handleSuccessfulTransaction(array $payload): bool;
    public function initiateHostPayout(string $recipientCode, int $amountKobo): array;
}
