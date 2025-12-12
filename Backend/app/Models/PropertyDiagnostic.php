<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyDiagnostic extends Model
{
    protected $fillable = ['property_id', 'type', 'file_path', 'valid_until', 'meta'];

    protected $casts = [
        'valid_until' => 'date',
        'meta' => 'array',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    // Helper pour savoir si le diagnostic est expiré
    public function getIsValidAttribute()
    {
        return $this->valid_until && $this->valid_until->isFuture();
    }
}
