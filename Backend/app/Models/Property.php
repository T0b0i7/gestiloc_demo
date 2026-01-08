<?php

namespace App\Models;

use App\Models\Tenant;
use App\Models\Landlord;
use App\Models\PropertyDelegation;
use App\Models\User;
use App\Models\Lease;
use App\Models\PropertyConditionReport;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphTo;
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
     * Tous les locataires passés/présents du bien, via les baux.
     */
    public function tenants(): HasManyThrough
    {
        return $this->hasManyThrough(
            Tenant::class,  // modèle final
            Lease::class,   // modèle intermédiaire
            'property_id',  // clé étrangère sur leases
            'id',           // clé primaire sur tenants
            'id',           // clé locale sur properties
            'tenant_id'     // clé locale sur leases
        );
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
}
