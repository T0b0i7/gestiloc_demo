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
        'email',
        'phone',
        'birth_date',
        'birth_place',
        'marital_status',
        'profession',
        'employer',
        'annual_income',
        'monthly_income',
        'contract_type',
        'address',
        'zip_code',
        'city',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_email',
        'notes',
        'status',
        'tenant_type',
        'guarantor_name',
        'guarantor_phone',
        'guarantor_email',
        'guarantor_profession',
        'guarantor_income',
        'guarantor_monthly_income',
        'guarantor_address',
        'guarantor_birth_date',
        'guarantor_birth_place',
        'document_type',
        'document_path',
        'meta',
        'solvency_score',
    ];

    protected $casts = [
        'meta' => 'array',
        'solvency_score' => 'decimal:2',
        'birth_date' => 'date',
        'guarantor_birth_date' => 'date',
        'annual_income' => 'decimal:2',
        'monthly_income' => 'decimal:2',
        'guarantor_income' => 'decimal:2',
        'guarantor_monthly_income' => 'decimal:2',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relation avec les baux
     */
    public function leases(): HasMany
    {
        return $this->hasMany(Lease::class, 'tenant_id');
    }

    /**
     * ✅ RELATION AVEC LES NOTES (AJOUTÉE)
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'tenant_id');
    }

    /**
     * ✅ RELATION : Biens attribués via property_user
     */
    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'property_user', 'tenant_id', 'property_id')
                    ->withPivot('id', 'user_id', 'role', 'share_percentage', 'start_date', 'end_date', 'status', 'lease_id', 'landlord_id')
                    ->withTimestamps();
    }

    /**
     * ✅ RELATION : Assignations property_user
     */
    public function propertyAssignments(): HasMany
    {
        return $this->hasMany(PropertyUser::class, 'tenant_id');
    }

    /**
     * ✅ RELATION : Paiements
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'tenant_id');
    }

    /**
     * ✅ RELATION : Quittances
     */
    public function rentReceipts(): HasMany
    {
        return $this->hasMany(RentReceipt::class, 'tenant_id');
    }

    /**
     * ✅ RELATION : Incidents/Maintenance
     */
    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(MaintenanceRequest::class, 'tenant_id');
    }

    /**
     * ✅ RELATION : Préavis
     */
    public function notices(): HasMany
    {
        return $this->hasMany(Notice::class, 'tenant_id');
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

    /**
     * ✅ Récupère le bail actif
     */
    public function activeLease()
    {
        return $this->leases()
            ->where('status', 'active')
            ->where(function($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->first();
    }

    /**
     * ✅ Obtenir le nom complet
     */
    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    /**
     * ✅ Vérifier si le compte est actif
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * ✅ Vérifier si c'est un candidat
     */
    public function isCandidate(): bool
    {
        return $this->status === 'candidate';
    }

    /**
     * ✅ Obtenir le score de solvabilité formaté
     */
    public function getFormattedSolvencyScoreAttribute(): string
    {
        if (!$this->solvency_score) return 'Non évalué';

        if ($this->solvency_score >= 800) return 'Excellent';
        if ($this->solvency_score >= 700) return 'Très bon';
        if ($this->solvency_score >= 600) return 'Bon';
        if ($this->solvency_score >= 500) return 'Moyen';
        return 'Faible';
    }

    /**
     * ✅ Scope pour les locataires actifs
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * ✅ Scope pour les candidats
     */
    public function scopeCandidate($query)
    {
        return $query->where('status', 'candidate');
    }

    /**
     * ✅ Scope pour les locataires inactifs
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * ✅ Scope par propriétaire
     */
    public function scopeOfLandlord($query, $landlordId)
    {
        return $query->where('meta->landlord_id', $landlordId);
    }

    /**
     * ✅ Scope par recherche
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('first_name', 'LIKE', "%{$search}%")
              ->orWhere('last_name', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%")
              ->orWhere('phone', 'LIKE', "%{$search}%")
              ->orWhereHas('user', function($subQuery) use ($search) {
                  $subQuery->where('email', 'LIKE', "%{$search}%")
                           ->orWhere('phone', 'LIKE', "%{$search}%");
              });
        });
    }
}
