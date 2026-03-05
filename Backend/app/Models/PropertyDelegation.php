<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyDelegation extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'landlord_id',
        'co_owner_id',
        'co_owner_type', // 'co_owner' ou 'agency'
        'status',
        'delegated_at',
        'revoked_at',
        'expires_at',
        'notes',
        'permissions',
        'delegation_type',
    ];

    protected $casts = [
        'delegated_at' => 'datetime',
        'revoked_at' => 'datetime',
        'expires_at' => 'datetime',
        'permissions' => 'array',
    ];

    /**
     * Une délégation appartient à une propriété
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Le propriétaire qui délègue
     */
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class);
    }

    /**
     * RELATION SIMPLE : Un co-owner (pas de morphTo)
     */
    public function coOwner(): BelongsTo
    {
        return $this->belongsTo(CoOwner::class, 'co_owner_id');
    }

    /**
     * Vérifier si la délégation est active
     */
    public function isActive(): bool
    {
        return $this->status === 'active'
            && (!$this->expires_at || $this->expires_at->isFuture());
    }

    /**
     * Vérifier si une permission spécifique est accordée
     */
    public function hasPermission(string $permission): bool
    {
        return $this->isActive()
            && in_array($permission, $this->permissions ?? []);
    }
}
