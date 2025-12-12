<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class PropertyConditionReport extends Model
{
    protected $fillable = [
        'property_id',
        'lease_id',
        'created_by',
        'type',
        'report_date',
        'notes',
        'signature_data',
        'signed_by',
        'signed_at'
    ];

    protected $casts = [
        'report_date' => 'date',
        'signed_at' => 'datetime',
        'signature_data' => 'array'
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PropertyConditionPhoto::class, 'report_id');
    }

    // Scopes
    public function scopeEntry(Builder $query): Builder
    {
        return $query->where('type', 'entry');
    }

    public function scopeExit(Builder $query): Builder
    {
        return $query->where('type', 'exit');
    }

    public function scopeForLease(Builder $query, $leaseId): Builder
    {
        return $query->where('lease_id', $leaseId);
    }

    public function isSigned(): bool
    {
        return $this->signed_at !== null;
    }

    public function sign(string $signatureData, string $signedBy): bool
    {
        return $this->update([
            'signature_data' => $signatureData,
            'signed_by' => $signedBy,
            'signed_at' => now()
        ]);
    }
}
