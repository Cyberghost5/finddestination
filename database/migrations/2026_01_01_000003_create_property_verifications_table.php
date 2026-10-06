<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('cac_registration_number', 100)->nullable();
            $table->string('cac_document_url', 255)->nullable();
            $table->string('tax_number', 100)->nullable();
            $table->decimal('verified_latitude', 10, 8)->nullable();
            $table->decimal('verified_longitude', 11, 8)->nullable();
            $table->text('field_audit_notes')->nullable();
            $table->enum('verification_tier', ['tier_1_docs', 'tier_2_location', 'tier_3_certified']);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_verifications');
    }
};
