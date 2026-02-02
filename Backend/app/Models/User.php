<?php

namespace App\Models;

use App\Models\Landlord;
use App\Models\Agency;
use App\Models\Tenant;
use App\Models\PropertyUser;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'email',
        'password',
        'phone',
        'last_activity_at',
        'status',
        'suspension_reason',
        'suspended_at',
        'suspended_by',
        'deactivation_reason',
        'deactivated_at',
        'deactivated_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'suspended_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];

    public function landlord(): HasOne
    {
        return $this->hasOne(Landlord::class, 'user_id');
    }

    public function coOwner(): HasOne
    {
        return $this->hasOne(CoOwner::class, 'user_id');
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, 'agency_id');
    }

    // One-to-one with Tenant (if user has tenant role)
    public function tenant(): HasOne
    {
        return $this->hasOne(Tenant::class, 'user_id');
    }

    /**
     * ✅ NOUVELLE RELATION : Assignations property_user
     */
    public function propertyAssignments(): HasMany
    {
        return $this->hasMany(PropertyUser::class, 'user_id');
    }

    /**
     * ✅ NOUVELLE RELATION : Biens attribués via property_user
     */
    public function assignedProperties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'property_user', 'user_id', 'property_id')
                    ->withPivot('id', 'tenant_id', 'role', 'share_percentage', 'start_date', 'end_date', 'status', 'lease_id', 'landlord_id')
                    ->withTimestamps();
    }

    /**
     * ✅ Biens actuellement actifs de l'utilisateur
     */
    public function activeProperties()
    {
        return $this->assignedProperties()
            ->wherePivot('status', 'active')
            ->where(function($query) {
                $query->whereNull('property_user.end_date')
                      ->orWhere('property_user.end_date', '>=', now());
            });
    }

    /**
     * ✅ Biens passés de l'utilisateur
     */
    public function pastProperties()
    {
        return $this->assignedProperties()
            ->where(function($query) {
                $query->where('property_user.status', 'terminated')
                      ->orWhere(function($q) {
                          $q->where('property_user.status', 'active')
                            ->where('property_user.end_date', '<', now());
                      });
            });
    }

    /**
     * ✅ Vérifie si l'utilisateur est actif sur un bien spécifique
     */
    public function isActiveOnProperty($propertyId): bool
    {
        return $this->assignedProperties()
            ->where('properties.id', $propertyId)
            ->wherePivot('status', 'active')
            ->where(function($query) {
                $query->whereNull('property_user.end_date')
                      ->orWhere('property_user.end_date', '>=', now());
            })
            ->exists();
    }

    /**
     * ✅ Récupère le rôle sur un bien spécifique
     */
    public function getRoleOnProperty($propertyId): ?string
    {
        $assignment = $this->propertyAssignments()
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->where(function($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->first();

        return $assignment ? $assignment->role : null;
    }

    // Helper methods for role checking
    public function isLandlord(): bool
    {
        return $this->hasRole('landlord');
    }

    public function isCoOwner(): bool
    {
        return $this->hasRole('co_owner');
    }

    public function isTenant(): bool
    {
        return $this->hasRole('tenant');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * ✅ Vérifie si l'utilisateur est en ligne (activité récente)
     */
    public function isOnline(): bool
    {
        return $this->last_activity_at &&
               $this->last_activity_at->gt(now()->subMinutes(5));
    }

    /**
     * ✅ Vérifie si le compte est actif
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * ✅ Vérifie si le compte est suspendu
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * ✅ Vérifie si le compte est désactivé
     */
    public function isDeactivated(): bool
    {
        return $this->status === 'deactivated';
    }

    /**
     * ✅ Met à jour la dernière activité
     */
    public function updateLastActivity(): void
    {
        $this->last_activity_at = now();
        $this->save();
    }
}
