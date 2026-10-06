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
        'verification_status',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
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
}
