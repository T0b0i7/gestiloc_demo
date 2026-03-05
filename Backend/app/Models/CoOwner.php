<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoOwner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'landlord_id',
        'first_name',
        'last_name',
        'company_name',
        'address_billing',
        'phone',
        'license_number',
        'is_professional',
         'co_owner_type', 
        'ifu',
        'rccm',
        'vat_number',
        'meta',
        'status',
        'joined_at',
        'invitation_id'
    ];

    protected $casts = [
        'is_professional' => 'boolean',
        'meta' => 'array',
        'joined_at' => 'datetime',
    ];

    /**
     * Un co-propriétaire appartient à un utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Les délégations reçues par ce co-propriétaire
     * CORRECTION : Retirer le where sur co_owner_type car il est NULL dans la base
     */
    public function delegations(): HasMany
    {
        return $this->hasMany(PropertyDelegation::class, 'co_owner_id');
    }

    /**
     * Les délégations actives
     */
    public function activeDelegations(): HasMany
    {
        return $this->delegations()->where('status', 'active');
    }

    /**
     * Le landlord qui a invité ce co-propriétaire
     */
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class, 'landlord_id');
    }

    /**
     * L'invitation qui a mené à la création de ce co-propriétaire
     */
    public function invitation(): BelongsTo
    {
        return $this->belongsTo(CoOwnerInvitation::class, 'invitation_id');
    }

    /**
     * Obtenir le nom complet
     */
    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    /**
     * Obtenir le nom d'affichage (company_name ou nom complet)
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->is_professional && $this->company_name) {
            return $this->company_name;
        }

        return $this->full_name;
    }

    /**
     * Vérifier si le co-propriétaire est actif
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
