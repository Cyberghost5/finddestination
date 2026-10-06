<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'user_id',
        'property_id',
        'room_type_id',
        'rooms_count',
        'check_in_date',
        'check_out_date',
        'total_nights',
        'total_amount_kobo',
        'commission_rate',
        'platform_commission_kobo',
        'host_payout_kobo',
        'booking_status',
        'hold_expires_at',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'hold_expires_at' => 'datetime',
        'commission_rate' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }

    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}
