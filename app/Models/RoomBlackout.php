<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomBlackout extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'room_type_id',
        'start_date',
        'end_date',
        'reason',
        'created_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
    ];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }
}
