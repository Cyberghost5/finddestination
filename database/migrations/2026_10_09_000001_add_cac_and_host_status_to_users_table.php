<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('business_name', 200)->nullable()->after('role');
            $table->string('cac_number', 100)->nullable()->after('business_name');
            $table->string('tin_number', 100)->nullable()->after('cac_number');
            $table->enum('host_status', ['pending_approval', 'approved', 'rejected'])->default('approved')->after('tin_number');
            $table->text('rejection_reason')->nullable()->after('host_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['business_name', 'cac_number', 'tin_number', 'host_status', 'rejection_reason']);
        });
    }
};
