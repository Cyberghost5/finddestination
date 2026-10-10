<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    /**
     * Helper to resolve authenticated user from Sanctum or fallback
     */
    private function resolveUser(Request $request): ?User
    {
        $user = $request->user('sanctum');

        if (!$user && $request->header('X-User-Id')) {
            $user = User::find($request->header('X-User-Id'));
        }

        // Fallback for local testing if no auth header passed
        if (!$user && app()->environment('local')) {
            $user = User::first();
        }

        return $user;
    }

    /**
     * GET /api/v1/chats
     * List all chat threads accessible to the user with strict access control
     */
    public function index(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated. Please log in to view messages.'
            ], 401);
        }

        // Ensure default Support thread exists for this user
        ChatThread::findOrCreateSupportThread($user);

        $query = ChatThread::with(['guest', 'host', 'property', 'booking', 'latestMessage']);

        if ($user->role === 'admin') {
            // Admin can see all support threads from any user + booking threads
            $threads = $query->orderBy('last_message_at', 'desc')->get();
        } elseif ($user->role === 'host') {
            // Host can ONLY see:
            // 1. Guests who booked their apartments (host_id == user->id)
            // 2. Their own Support thread (type == 'support' && guest_id == user->id)
            $threads = $query->where(function ($q) use ($user) {
                $q->where('host_id', $user->id)
                  ->orWhere(function ($sub) use ($user) {
                      $sub->where('type', 'support')
                          ->where('guest_id', $user->id);
                  });
            })->orderBy('last_message_at', 'desc')->get();
        } else {
            // Guest can ONLY see:
            // 1. Booking threads where they are the guest (guest_id == user->id)
            // 2. Their own Support thread (type == 'support' && guest_id == user->id)
            $threads = $query->where('guest_id', $user->id)
                ->orderBy('last_message_at', 'desc')
                ->get();
        }

        $formatted = $threads->map(function ($thread) use ($user) {
            $latest = $thread->latestMessage;
            $unreadCount = $thread->unreadCountForUser($user->id);

            // Determine other party details based on who is viewing
            if ($thread->type === 'support') {
                if ($user->role === 'admin') {
                    $otherParty = [
                        'name' => $thread->guest ? ($thread->guest->name . ' (' . ucfirst($thread->guest->role) . ')') : 'User',
                        'role' => ucfirst($thread->guest->role ?? 'User'),
                        'email' => $thread->guest ? $thread->guest->email : null,
                        'phone' => $thread->guest ? $thread->guest->phone : null,
                        'avatar' => $thread->guest ? $thread->guest->avatar : null,
                        'badge' => 'User Inbound',
                    ];
                } else {
                    $otherParty = [
                        'name' => 'FindDestination Support Desk',
                        'role' => '24/7 Escrow Support & Care',
                        'email' => 'support@finddestination.com.ng',
                        'phone' => '+234 800 FINDDEST',
                        'avatar' => null,
                        'badge' => 'Official Support',
                    ];
                }
            } elseif ($user->role === 'host') {
                $otherParty = [
                    'name' => $thread->guest ? $thread->guest->name : 'Confirmed Guest',
                    'role' => 'Guest / Traveler',
                    'email' => $thread->guest ? $thread->guest->email : null,
                    'phone' => $thread->guest ? $thread->guest->phone : null,
                    'avatar' => $thread->guest ? $thread->guest->avatar : null,
                    'badge' => 'Confirmed Guest',
                ];
            } else {
                $otherParty = [
                    'name' => $thread->host ? $thread->host->name : 'Property Host',
                    'role' => 'Property Owner / Host',
                    'email' => $thread->host ? $thread->host->email : null,
                    'phone' => $thread->host ? $thread->host->phone : null,
                    'avatar' => $thread->host ? $thread->host->avatar : null,
                    'badge' => 'Verified Host',
                ];
            }

            return [
                'id' => $thread->id,
                'type' => $thread->type,
                'title' => $thread->title,
                'other_party' => $otherParty,
                'property' => $thread->property ? [
                    'id' => $thread->property->id,
                    'name' => $thread->property->title ?? $thread->property->name,
                    'city' => $thread->property->city,
                    'state' => $thread->property->state,
                    'cover_image' => is_array($thread->property->images) 
                        ? ($thread->property->images[0] ?? '/logo.jpeg') 
                        : ($thread->property->cover_image ?? '/logo.jpeg'),
                ] : null,
                'booking' => $thread->booking ? [
                    'reference' => $thread->booking->booking_reference,
                    'check_in' => $thread->booking->check_in_date ? $thread->booking->check_in_date->format('M d, Y') : null,
                    'check_out' => $thread->booking->check_out_date ? $thread->booking->check_out_date->format('M d, Y') : null,
                    'status' => $thread->booking->booking_status,
                ] : null,
                'latest_message' => $latest ? [
                    'id' => $latest->id,
                    'text' => $latest->message,
                    'sender_role' => $latest->sender_role,
                    'is_me' => $latest->sender_id === $user->id,
                    'time' => $latest->created_at->diffForHumans(null, true, true),
                ] : null,
                'unread_count' => $unreadCount,
                'last_message_at' => $thread->last_message_at ? $thread->last_message_at->toIso8601String() : $thread->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
            'current_user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * GET /api/v1/chats/{threadId}/messages
     * Fetch message history and mark unread messages as read
     */
    public function getMessages(Request $request, $threadId)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        $thread = ChatThread::with(['guest', 'host', 'property', 'booking'])->findOrFail($threadId);

        // Strict Authorization Check
        $isParticipant = ($thread->guest_id === $user->id) || ($thread->host_id === $user->id);
        $isAdmin = ($user->role === 'admin');

        if (!$isParticipant && !$isAdmin) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not authorized to view this conversation.'
            ], 403);
        }

        // Mark incoming unread messages as read
        $thread->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = $thread->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($m) use ($user) {
                return [
                    'id' => $m->id,
                    'sender_id' => $m->sender_id,
                    'sender_name' => $m->sender ? $m->sender->name : 'Participant',
                    'sender_role' => $m->sender_role,
                    'is_me' => $m->sender_id === $user->id,
                    'text' => $m->message,
                    'is_read' => $m->is_read,
                    'time' => $m->created_at->format('g:i A'),
                    'date' => $m->created_at->format('M d, Y'),
                    'created_at' => $m->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'thread_id' => $thread->id,
                'thread_type' => $thread->type,
                'title' => $thread->title,
                'messages' => $messages,
            ]
        ]);
    }

    /**
     * POST /api/v1/chats/{threadId}/messages
     * Send a new message with strict participant authorization
     */
    public function sendMessage(Request $request, $threadId)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:3000',
        ]);

        $thread = ChatThread::findOrFail($threadId);

        // Strict Authorization Check
        $isGuest = ($thread->guest_id === $user->id);
        $isHost = ($thread->host_id === $user->id);
        $isAdmin = ($user->role === 'admin');

        if (!$isGuest && !$isHost && !$isAdmin) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not authorized to post messages in this conversation.'
            ], 403);
        }

        // Determine sender role
        if ($isAdmin) {
            $senderRole = 'admin';
        } elseif ($isHost) {
            $senderRole = 'host';
        } else {
            $senderRole = 'guest';
        }

        $message = ChatMessage::create([
            'chat_thread_id' => $thread->id,
            'sender_id' => $user->id,
            'sender_role' => $senderRole,
            'message' => trim($validated['message']),
            'is_read' => false,
        ]);

        $thread->update([
            'last_message_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_name' => $user->name,
                'sender_role' => $senderRole,
                'is_me' => true,
                'text' => $message->message,
                'is_read' => false,
                'time' => $message->created_at->format('g:i A'),
                'date' => $message->created_at->format('M d, Y'),
                'created_at' => $message->created_at->toIso8601String(),
            ]
        ], 201);
    }

    /**
     * POST /api/v1/chats/start-booking-chat
     * Open or initiate chat thread for a confirmed booking
     */
    public function startBookingChat(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'booking_reference' => 'required|string',
        ]);

        $reference = trim(strtoupper($validated['booking_reference']));
        $booking = Booking::with(['property.host', 'user'])
            ->where('booking_reference', $reference)
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reservation reference not found.'
            ], 404);
        }

        // Must be confirmed
        if (!in_array($booking->booking_status, ['confirmed', 'checked_in', 'completed'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Chat with host becomes available once booking payment is confirmed.'
            ], 403);
        }

        // Strict Authorization: User must be either the booking guest, property host, or admin
        $isBookingGuest = ($booking->user_id === $user->id) || ($booking->user && strtolower($booking->user->email) === strtolower($user->email));
        $isPropertyHost = ($booking->property && $booking->property->host_id === $user->id);
        $isAdmin = ($user->role === 'admin');

        if (!$isBookingGuest && !$isPropertyHost && !$isAdmin) {
            return response()->json([
                'status' => 'error',
                'message' => 'You can only message the host of your own confirmed reservation.'
            ], 403);
        }

        $thread = ChatThread::findOrCreateBookingThread($booking);

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation opened successfully.',
            'data' => [
                'thread_id' => $thread->id,
                'type' => $thread->type,
                'title' => $thread->title,
            ]
        ]);
    }

    /**
     * POST /api/v1/chats/support
     * Open or initiate the universal FindDestination Support thread
     */
    public function supportChat(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        $thread = ChatThread::findOrCreateSupportThread($user);

        return response()->json([
            'status' => 'success',
            'data' => [
                'thread_id' => $thread->id,
                'type' => 'support',
                'title' => 'FindDestination Support Desk',
            ]
        ]);
    }
}
