<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'gateway',
        'transaction_reference',
        'gateway_reference',
        'amount_paid_kobo',
        'payment_channel',
        'virtual_account_number',
        'virtual_bank_name',
        'status',
        'raw_webhook_payload',
        'paid_at',
    ];

    protected $casts = [
        'raw_webhook_payload' => 'array',
        'paid_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
