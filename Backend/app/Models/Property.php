<?php

namespace App\Models;

use App\Models\Tenant;
use App\Models\Landlord;
use App\Models\PropertyDelegation;
use App\Models\User;
use App\Models\Lease;
use App\Models\PropertyConditionReport;
use App\Models\PropertyUser;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'landlord_id', 'user_id', 'type', 'name', 'description', 'reference_code',
        'address', 'district', 'city', 'state', 'zip_code', 'latitude', 'longitude',
        'surface', 'room_count', 'bedroom_count', 'bathroom_count',
        'rent_amount', 'charges_amount', 'status', 'amenities', 'photos', 'meta'
    ];

    protected $casts = [
        'amenities' => 'array',
        'photos' => 'array',
        'meta' => 'array',
        'surface' => 'decimal:2',
        'rent_amount' => 'decimal:2',
        'charges_amount' => 'decimal:2',
    ];

    // Génération automatique de l'UUID et du reference_code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();

            if (empty($model->reference_code)) {
                $model->reference_code = 'PR-' . strtoupper(Str::random(6));
            }
        });
    }

    // ========== RELATIONS ==========

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class);
    }

    public function leases(): HasMany
    {
        return $this->hasMany(Lease::class);
    }

    /**
     * ✅ NOUVELLE RELATION : Locataires via property_user
     */
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'property_user', 'property_id', 'tenant_id')
                    ->withPivot('id', 'user_id', 'role', 'share_percentage', 'start_date', 'end_date', 'status', 'lease_id', 'landlord_id')
                    ->withTimestamps();
    }

    /**
     * ✅ NOUVELLE RELATION : Assignations property_user
     */
    public function propertyAssignments(): HasMany
    {
        return $this->hasMany(PropertyUser::class, 'property_id');
    }

    /**
     * ✅ Locataires actuellement actifs sur le bien
     */
    public function currentTenants(): BelongsToMany
    {
        return $this->tenants()
            ->wherePivot('status', 'active')
            ->where(function($query) {
                $query->whereNull('property_user.end_date')
                      ->orWhere('property_user.end_date', '>=', now());
            });
    }

    /**
     * ✅ Anciens locataires du bien
     */
    public function pastTenants(): BelongsToMany
    {
        return $this->tenants()
            ->where(function($query) {
                $query->where('property_user.status', 'terminated')
                      ->orWhere(function($q) {
                          $q->where('property_user.status', 'active')
                            ->where('property_user.end_date', '<', now());
                      });
            });
    }

    /**
     * ✅ Vérifie si le bien est actuellement occupé
     */
    public function isCurrentlyOccupied(): bool
    {
        return $this->currentTenants()->exists();
    }

    /**
     * ✅ Récupère l'historique complet d'occupation
     */
    public function getOccupancyHistory()
    {
        return $this->tenants()
            ->orderBy('property_user.start_date', 'desc')
            ->get();
    }

    /**
     * États des lieux du bien.
     */
    public function conditionReports(): HasMany
    {
        return $this->hasMany(PropertyConditionReport::class);
    }

    /**
     * Copropriétaire gestionnaire du bien (via délégation - relation polymorphe)
     */
    public function managingCoOwner(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Délégations de gestion pour ce bien
     */
    public function delegations(): HasMany
    {
        return $this->hasMany(PropertyDelegation::class);
    }

    // ========== SCOPES ==========

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeInCity($query, $city)
    {
        return $query->where('city', $city);
    }

    /**
     * ✅ NOUVEAU SCOPE : Biens avec locataires actifs
     */
    public function scopeOccupied($query)
    {
        return $query->whereHas('currentTenants');
    }

    /**
     * ✅ NOUVEAU SCOPE : Biens disponibles (sans locataires actifs)
     */
    public function scopeVacant($query)
    {
        return $query->whereDoesntHave('currentTenants');
    }

    /**
     * ✅ NOUVEAU SCOPE : Biens d'un locataire spécifique
     */
    public function scopeOfTenant($query, $tenantId)
    {
        return $query->whereHas('tenants', function($q) use ($tenantId) {
            $q->where('tenants.id', $tenantId);
        });
    }


    
}
