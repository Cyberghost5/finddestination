<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'name',
        'base_price_kobo',
        'total_units',
        'max_occupancy',
        'bed_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function blackouts()
    {
        return $this->hasMany(RoomBlackout::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
