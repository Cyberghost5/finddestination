<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_blackouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_type_id')->constrained('room_types')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason', 255)->default('Maintenance/Walk-in');
            $table->timestamp('created_at')->nullable();

            $table->index(['room_type_id', 'start_date', 'end_date'], 'idx_blackout_dates');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_blackouts');
    }
};
