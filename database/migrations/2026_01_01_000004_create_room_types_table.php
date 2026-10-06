<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->string('name', 150);
            $table->unsignedBigInteger('base_price_kobo'); // Currency in Kobo (NGN * 100)
            $table->unsignedSmallInteger('total_units')->default(1);
            $table->unsignedSmallInteger('max_occupancy')->default(2);
            $table->string('bed_type', 100)->default('Standard Double');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['property_id', 'base_price_kobo', 'is_active'], 'idx_room_pricing');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
