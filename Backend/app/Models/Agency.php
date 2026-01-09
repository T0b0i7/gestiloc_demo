<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'agency_type',
        'company_name',
        'license_number',
        'address',
        'phone',
        'email',
        'is_professional',
        'id_type',
        'id_number',
        'ifu',
        'rccm',
        'vat_number',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'is_professional' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Propriétés gérées par cette agence (via délégation)
     */
    public function managedProperties(): HasMany
    {
        return $this->hasMany(Property::class, 'agency_id');
    }

    /**
     * Délégations reçues des propriétaires
     */
    public function delegations(): HasMany
    {
        return $this->hasMany(PropertyDelegation::class, 'agency_id');
    }

    /**
     * Obtenir le nom d'affichage (priorité: company_name > first_name + last_name)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->company_name 
            ? $this->company_name 
            : trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    /**
     * Scope pour n'obtenir que les agencies pures
     */
    public function scopePureAgencies($query)
    {
        return $query->where('agency_type', 'agency');
    }

    /**
     * Scope pour n'obtenir que les co-owners agences
     */
    public function scopeCoOwnerAgencies($query)
    {
        return $query->where('agency_type', 'co_owner_agency');
    }

    /**
     * Vérifier si c'est une co-owner agence
     */
    public function isCoOwnerAgency(): bool
    {
        return $this->agency_type === 'co_owner_agency';
    }

    /**
     * Vérifier si c'est une agence pure
     */
    public function isPureAgency(): bool
    {
        return $this->agency_type === 'agency';
    }
}
