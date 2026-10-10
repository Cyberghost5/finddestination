<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Chat Threads (Conversations between Guest & Host, or User & Support)
        Schema::create('chat_threads', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['booking', 'support'])->default('booking');
            
            // For Booking chats: strictly bound to confirmed reservation and property
            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();
                
            $table->foreignId('property_id')
                ->nullable()
                ->constrained('properties')
                ->nullOnDelete();

            // The guest / user participating in this thread
            $table->foreignId('guest_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // The property owner (null for general Support threads)
            $table->foreignId('host_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Assigned Admin (for support tickets)
            $table->foreignId('admin_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            // Indexes for high performance querying
            $table->index(['guest_id', 'type']);
            $table->index(['host_id', 'type']);
            $table->index('booking_id');
            $table->index('last_message_at');
        });

        // 2. Chat Messages
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_thread_id')
                ->constrained('chat_threads')
                ->cascadeOnDelete();

            $table->foreignId('sender_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('sender_role', 30)->default('guest'); // guest, host, admin, support, agent
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['chat_thread_id', 'created_at']);
            $table->index(['chat_thread_id', 'is_read']);
            $table->index('sender_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_threads');
    }
};
