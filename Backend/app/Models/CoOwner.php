<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CoOwner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'company_name',
        'address_billing',
        'phone',
        'license_number',
        'is_professional',
        'ifu',
        'rccm',
        'vat_number',
        'meta',
        'status', // active, inactive, suspended
        'joined_at',
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
     */
    public function delegations(): HasMany
    {
        return $this->hasMany(PropertyDelegation::class, 'co_owner_id')
            ->where('co_owner_type', 'App\\Models\\CoOwner');
    }

    /**
     * Les délégations actives
     */
    public function activeDelegations(): HasMany
    {
        return $this->delegations()->where('status', 'active');
    }

    /**
     * Les invitations envoyées par ce co-propriétaire
     */
    public function sentInvitations(): HasMany
    {
        return $this->hasMany(CoOwnerInvitation::class, 'invited_by_id')
            ->where('invited_by_type', 'co_owner');
    }

    /**
     * L'invitation qui a mené à la création de ce co-propriétaire
     */
    public function invitation(): BelongsTo
    {
        return $this->belongsTo(CoOwnerInvitation::class, 'invitation_id');
    }

    /**
     * Le landlord qui a invité ce co-propriétaire
     */
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class, 'landlord_id');
    }

    /**
     * Les audits de délégation pour ce co-propriétaire
     */
    public function delegationAudits(): MorphMany
    {
        return $this->morphMany(DelegationAudit::class, 'auditable');
    }

    /**
     * Scope pour les co-propriétaires actifs
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope pour les co-propriétaires professionnels
     */
    public function scopeProfessional($query)
    {
        return $query->where('is_professional', true);
    }

    /**
     * Scope pour les co-propriétaires particuliers
     */
    public function scopeIndividual($query)
    {
        return $query->where('is_professional', false);
    }

    /**
     * Vérifier si le co-propriétaire peut gérer une propriété
     */
    public function canManageProperty(int $propertyId): bool
    {
        return $this->activeDelegations()
            ->where('property_id', $propertyId)
            ->whereHas('permissions', function ($query) {
                $query->where('permission', 'manage_property');
            })
            ->exists();
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

    /**
     * Compter les propriétés déléguées actives
     */
    public function getActiveDelegationsCountAttribute(): int
    {
        return $this->activeDelegations()->count();
    }
}
