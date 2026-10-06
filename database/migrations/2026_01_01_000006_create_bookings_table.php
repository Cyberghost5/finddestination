<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference', 32)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('room_type_id')->constrained('room_types')->onDelete('cascade');
            $table->unsignedSmallInteger('rooms_count')->default(1);
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->unsignedSmallInteger('total_nights');
            $table->unsignedBigInteger('total_amount_kobo');
            $table->decimal('commission_rate', 5, 2)->default(12.50);
            $table->unsignedBigInteger('platform_commission_kobo');
            $table->unsignedBigInteger('host_payout_kobo');
            $table->enum('booking_status', ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'rejected'])->default('pending');
            $table->timestamp('hold_expires_at')->nullable();
            $table->timestamps();

            $table->index(['room_type_id', 'check_in_date', 'check_out_date', 'booking_status'], 'idx_booking_availability');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
