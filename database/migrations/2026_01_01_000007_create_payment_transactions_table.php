<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->enum('gateway', ['paystack', 'monnify']);
            $table->string('transaction_reference', 150)->unique();
            $table->string('gateway_reference', 150)->nullable();
            $table->unsignedBigInteger('amount_paid_kobo');
            $table->string('payment_channel', 50)->nullable(); // 'card', 'bank_transfer', 'ussd'
            $table->string('virtual_account_number', 30)->nullable();
            $table->string('virtual_bank_name', 100)->nullable();
            $table->enum('status', ['initiated', 'successful', 'failed', 'refunded'])->default('initiated');
            $table->json('raw_webhook_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
