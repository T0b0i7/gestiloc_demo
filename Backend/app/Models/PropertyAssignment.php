<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyAssignment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lease_id',
        'property_id',
        'tenant_id',
        'assignment_date',
        'end_date',
        'notes',
        'status'
    ];

    protected $casts = [
        'assignment_date' => 'date',
        'end_date' => 'date',
    ];

    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
