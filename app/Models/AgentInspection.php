<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentInspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'agent_id',
        'status',
        'inspection_fee',
        'applied_at',
        'approved_at',
        'submitted_at',
        'verified_at',
        'gps_latitude',
        'gps_longitude',
        'photos',
        'video_url',
        'amenities_check',
        'report_notes',
        'admin_review_notes',
    ];

    protected $casts = [
        'photos' => 'array',
        'amenities_check' => 'array',
        'applied_at' => 'datetime',
        'approved_at' => 'datetime',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'inspection_fee' => 'decimal:2',
        'gps_latitude' => 'decimal:8',
        'gps_longitude' => 'decimal:8',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }
}
