<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'host_id',
        'name',
        'slug',
        'property_type',
        'description',
        'address',
        'city',
        'state',
        'latitude',
        'longitude',
        'contact_phone',
        'check_in_time',
        'check_out_time',
        'neighborhood',
        'category',
        'verification_tier',
        'images',
        'amenities',
        'verification_status',
        'is_published',
        'is_open_for_inspection',
        'inspection_fee',
        'inspection_status',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_open_for_inspection' => 'boolean',
        'inspection_fee' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'images' => 'array',
        'amenities' => 'array',
    ];

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function roomTypes()
    {
        return $this->hasMany(RoomType::class);
    }

    public function verifications()
    {
        return $this->hasMany(PropertyVerification::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function chatThreads()
    {
        return $this->hasMany(ChatThread::class, 'property_id');
    }

    public function agentInspections()
    {
        return $this->hasMany(AgentInspection::class);
    }

    public function inspections()
    {
        return $this->hasMany(AgentInspection::class);
    }

    public function activeInspection()
    {
        return $this->hasOne(AgentInspection::class)->latestOfMany();
    }
}
