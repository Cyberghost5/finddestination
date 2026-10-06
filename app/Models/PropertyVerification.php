<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'agent_id',
        'cac_registration_number',
        'cac_document_url',
        'tax_number',
        'verified_latitude',
        'verified_longitude',
        'field_audit_notes',
        'verification_tier',
        'status',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'verified_latitude' => 'decimal:8',
        'verified_longitude' => 'decimal:8',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
