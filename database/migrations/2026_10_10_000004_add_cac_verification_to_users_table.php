<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('cac_verification_data')->nullable()->after('rejection_reason');
            $table->timestamp('cac_verified_at')->nullable()->after('cac_verification_data');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cac_verification_data', 'cac_verified_at']);
        });
    }
};
