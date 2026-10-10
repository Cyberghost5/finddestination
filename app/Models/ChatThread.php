<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'booking_id',
        'property_id',
        'guest_id',
        'host_id',
        'admin_id',
        'title',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function guest()
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'chat_thread_id')->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(ChatMessage::class, 'chat_thread_id')->latestOfMany();
    }

    /**
     * Unread message count for a given user in this thread
     */
    public function unreadCountForUser(int $userId): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Find or create the authoritative chat thread for a confirmed booking
     */
    public static function findOrCreateBookingThread(Booking $booking): self
    {
        $thread = self::where('booking_id', $booking->id)->first();

        if ($thread) {
            return $thread;
        }

        $property = $booking->property;
        $hostId = $property ? $property->host_id : 1;

        $thread = self::create([
            'type' => 'booking',
            'booking_id' => $booking->id,
            'property_id' => $booking->property_id,
            'guest_id' => $booking->user_id,
            'host_id' => $hostId,
            'title' => 'Stay: ' . ($property ? $property->title : 'Verified Stay') . ' (' . $booking->booking_reference . ')',
            'last_message_at' => now(),
        ]);

        // Seed initial system greeting
        ChatMessage::create([
            'chat_thread_id' => $thread->id,
            'sender_id' => $hostId,
            'sender_role' => 'host',
            'message' => 'Sannu da zuwa! Your reservation (' . $booking->booking_reference . ') has been confirmed. Looking forward to hosting you!',
            'is_read' => false,
        ]);

        return $thread;
    }

    /**
     * Find or create the default FindDestination Support thread for a user
     */
    public static function findOrCreateSupportThread(User $user): self
    {
        $thread = self::where('type', 'support')
            ->where('guest_id', $user->id)
            ->first();

        if ($thread) {
            return $thread;
        }

        // Find an admin user id if available, or fallback to 1
        $admin = User::where('role', 'admin')->first();
        $adminId = $admin ? $admin->id : 1;

        $thread = self::create([
            'type' => 'support',
            'booking_id' => null,
            'property_id' => null,
            'guest_id' => $user->id,
            'host_id' => null,
            'admin_id' => $adminId,
            'title' => 'FindDestination Support Desk',
            'last_message_at' => now(),
        ]);

        // Seed initial welcome greeting from Support
        ChatMessage::create([
            'chat_thread_id' => $thread->id,
            'sender_id' => $adminId,
            'sender_role' => 'admin',
            'message' => 'Welcome to FindDestination Support! All bookings are secured with our 24-hour escrow protection. How can our team assist you today?',
            'is_read' => false,
        ]);

        return $thread;
    }
}
