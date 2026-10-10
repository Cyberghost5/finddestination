<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'business_name',
        'cac_number',
        'tin_number',
        'host_status',
        'rejection_reason',
        'cac_verification_data',
        'cac_verified_at',
        'google_id',
        'avatar',
        'is_active',
        'email_verified_at',
        'phone_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'cac_verified_at' => 'datetime',
            'cac_verification_data' => 'array',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function properties()
    {
        return $this->hasMany(Property::class, 'host_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function guestChatThreads()
    {
        return $this->hasMany(ChatThread::class, 'guest_id');
    }

    public function hostChatThreads()
    {
        return $this->hasMany(ChatThread::class, 'host_id');
    }

    public function agentWallet()
    {
        return $this->hasOne(AgentWallet::class, 'agent_id');
    }

    public function agentInspections()
    {
        return $this->hasMany(AgentInspection::class, 'agent_id');
    }

    public function withdrawalRequests()
    {
        return $this->hasMany(WithdrawalRequest::class, 'agent_id');
    }

    public function getOrCreateAgentWallet(): AgentWallet
    {
        return $this->agentWallet()->firstOrCreate(
            ['agent_id' => $this->id],
            [
                'balance' => 0.00,
                'total_earned' => 0.00,
            ]
        );
    }
}
