<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'property_id',
        'user_id',
        'rating',
        'cleanliness_rating',
        'security_rating',
        'power_water_rating',
        'comment',
        'host_reply',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
