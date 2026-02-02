<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'status',
        'solvency_score',
        'meta'
    ];

    protected $casts = [
        'meta' => 'array',
        'solvency_score' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function leases(): HasMany
    {
        return $this->hasMany(Lease::class, 'tenant_id');
    }

    /**
     * ✅ NOUVELLE RELATION : Biens attribués via property_user
     */
    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'property_user', 'tenant_id', 'property_id')
                    ->withPivot('id', 'user_id', 'role', 'share_percentage', 'start_date', 'end_date', 'status', 'lease_id', 'landlord_id')
                    ->withTimestamps();
    }

    /**
     * ✅ NOUVELLE RELATION : Assignations property_user
     */
    public function propertyAssignments(): HasMany
    {
        return $this->hasMany(PropertyUser::class, 'tenant_id');
    }

    /**
     * ✅ Récupère uniquement les biens actuellement actifs
     */
    public function activeProperties()
    {
        return $this->properties()
            ->wherePivot('status', 'active')
            ->where(function($query) {
                $query->whereNull('property_user.end_date')
                      ->orWhere('property_user.end_date', '>=', now());
            });
    }

    /**
     * ✅ Récupère les biens passés
     */
    public function pastProperties()
    {
        return $this->properties()
            ->where(function($query) {
                $query->where('property_user.status', 'terminated')
                      ->orWhere(function($q) {
                          $q->where('property_user.status', 'active')
                            ->where('property_user.end_date', '<', now());
                      });
            });
    }

    /**
     * ✅ Vérifie si le locataire est actif sur un bien spécifique
     */
    public function isActiveOnProperty($propertyId): bool
    {
        return $this->properties()
            ->where('properties.id', $propertyId)
            ->wherePivot('status', 'active')
            ->where(function($query) {
                $query->whereNull('property_user.end_date')
                      ->orWhere('property_user.end_date', '>=', now());
            })
            ->exists();
    }

    /**
     * ✅ Récupère tous les biens avec l'historique complet
     */
    public function getAllPropertiesWithHistory()
    {
        return $this->properties()
            ->orderBy('property_user.start_date', 'desc')
            ->get();
    }
}
