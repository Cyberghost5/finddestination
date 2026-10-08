<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade');
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->enum('property_type', ['hotel', 'guest_house', 'lodge', 'serviced_apartment', 'boutique', 'resort']);
            $table->text('description');
            $table->text('address');
            $table->string('city', 100);
            $table->string('state', 100);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('contact_phone', 30);
            $table->time('check_in_time')->default('14:00:00');
            $table->time('check_out_time')->default('12:00:00');
            $table->string('neighborhood', 150)->nullable();
            $table->string('category', 100)->nullable();
            $table->enum('verification_tier', ['unverified', 'tier_1_docs', 'tier_2_location', 'tier_3_certified'])->default('unverified');
            $table->json('images')->nullable();
            $table->json('amenities')->nullable();
            $table->enum('verification_status', ['unverified', 'documents_verified', 'location_verified', 'verified'])->default('unverified');
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->index(['state', 'city', 'verification_status', 'is_published'], 'idx_property_search');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
