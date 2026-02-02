<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyLandlord extends Model
{
    protected $table = 'property_landlord';

    protected $fillable = [
        'property_id',
        'landlord_id',
        'role',
        'share_percentage',
    ];

    protected $casts = [
        'share_percentage' => 'decimal:2',
    ];

    /**
     * Relation vers le bien
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Relation vers le propriétaire
     */
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class);
    }

    /**
     * Relation vers l'utilisateur (via landlord)
     */
    public function user()
    {
        return $this->landlord->user ?? null;
    }

    /**
     * Vérifie si c'est le propriétaire principal
     */
    public function isMainOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Vérifie si c'est un co-propriétaire
     */
    public function isCoOwner(): bool
    {
        return $this->role === 'co-owner';
    }

    /**
     * Récupère tous les propriétaires d'un bien
     */
    public static function getOwnersForProperty($propertyId)
    {
        return self::where('property_id', $propertyId)
            ->with(['landlord.user:id,first_name,last_name,email,phone'])
            ->get();
    }

    /**
     * Récupère tous les biens d'un propriétaire
     */
    public static function getPropertiesForLandlord($landlordId)
    {
        return self::where('landlord_id', $landlordId)
            ->with(['property'])
            ->get();
    }

    /**
     * Ajoute un propriétaire à un bien
     */
    public static function addOwnerToProperty($propertyId, $landlordId, $role = 'co-owner', $sharePercentage = null): self
    {
        // Vérifier si la relation existe déjà
        $existing = self::where('property_id', $propertyId)
            ->where('landlord_id', $landlordId)
            ->first();

        if ($existing) {
            return $existing;
        }

        return self::create([
            'property_id' => $propertyId,
            'landlord_id' => $landlordId,
            'role' => $role,
            'share_percentage' => $sharePercentage,
        ]);
    }

    /**
     * Retire un propriétaire d'un bien
     */
    public static function removeOwnerFromProperty($propertyId, $landlordId): bool
    {
        return self::where('property_id', $propertyId)
            ->where('landlord_id', $landlordId)
            ->delete();
    }

    /**
     * Met à jour la part d'un propriétaire
     */
    public static function updateSharePercentage($propertyId, $landlordId, $sharePercentage): bool
    {
        return self::where('property_id', $propertyId)
            ->where('landlord_id', $landlordId)
            ->update(['share_percentage' => $sharePercentage]);
    }

    /**
     * Récupère l'historique des changements de propriété
     */
    public static function getPropertyHistory($propertyId)
    {
        return \DB::table('property_landlord_audit')
            ->where('property_id', $propertyId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
