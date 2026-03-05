<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PropertyUser extends Model
{
    use HasFactory;

    protected $table = 'property_user';

    protected $fillable = [
        'property_id',
        'user_id',
        'tenant_id',
        'lease_id',
        'landlord_id',
        'role',
        'share_percentage',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'share_percentage' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Relation vers le bien
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Relation vers l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation vers le locataire
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    /**
     * Relation vers le bail
     */
    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    /**
     * Relation vers le propriétaire
     */
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class);
    }

    /**
     * Vérifie si c'est une attribution active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' &&
               (!$this->end_date || $this->end_date >= now());
    }

    /**
     * Vérifie si c'est une attribution terminée
     */
    public function isTerminated(): bool
    {
        return $this->status === 'terminated' ||
               ($this->status === 'active' && $this->end_date && $this->end_date < now());
    }

    /**
     * Termine l'attribution
     */
    public function terminate($endDate = null): bool
    {
        return $this->update([
            'end_date' => $endDate ?? now(),
            'status' => 'terminated',
        ]);
    }

    /**
     * Active l'attribution
     */
    public function activate($startDate = null): bool
    {
        return $this->update([
            'start_date' => $startDate ?? now(),
            'status' => 'active',
        ]);
    }

    /**
     * Calcule la durée d'attribution en jours
     */
    public function getDurationDays(): ?int
    {
        if (!$this->start_date) {
            return null;
        }

        $endDate = $this->end_date ?? now();
        return $this->start_date->diffInDays($endDate);
    }

    /**
     * Vérifie si l'attribution est en cours à une date donnée
     */
    public function isActiveAtDate($date): bool
    {
        return $this->status === 'active' &&
               $this->start_date <= $date &&
               (!$this->end_date || $this->end_date >= $date);
    }


    /**
     * ✅ NOUVELLE : Attribuer un bien à un locataire (méthode statique)
     */
    public static function assignPropertyToTenant(
        $propertyId,
        $userId,
        $tenantId = null,
        $leaseId = null,
        $role = 'tenant',
        $sharePercentage = null,
        $startDate = null,
        $endDate = null
    ): self {
        // Vérifier les conflits
        $conflict = self::where('property_id', $propertyId)
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->where(function($query) use ($endDate) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->first();

        if ($conflict) {
            throw new \Exception('Ce locataire est déjà attribué à ce bien');
        }

        return self::create([
            'property_id' => $propertyId,
            'user_id' => $userId,
            'tenant_id' => $tenantId,
            'lease_id' => $leaseId,
            'role' => $role,
            'share_percentage' => $sharePercentage,
            'start_date' => $startDate ?? now(),
            'end_date' => $endDate,
            'status' => 'active',
        ]);
    }

    /**
     * ✅ NOUVELLE : Terminer une attribution
     */
    public static function terminateAssignment($propertyId, $userId, $endDate = null): bool
    {
        $assignment = self::where('property_id', $propertyId)
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->first();

        if (!$assignment) {
            return false;
        }

        return $assignment->update([
            'end_date' => $endDate ?? now(),
            'status' => 'terminated',
        ]);
    }

    /**
     * ✅ NOUVELLE : Récupérer les biens d'un locataire
     */
    public static function getPropertiesForTenant($userId, $onlyActive = true)
    {
        $query = self::where('user_id', $userId)
            ->with(['property'])
            ->orderBy('start_date', 'desc');

        if ($onlyActive) {
            $query->where('status', 'active')
                  ->where(function($q) {
                      $q->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                  });
        }

        return $query->get();
    }

    /**
     * ✅ NOUVELLE : Récupérer l'historique d'un bien
     */
    public static function getPropertyHistory($propertyId)
    {
        return self::where('property_id', $propertyId)
            ->with(['user', 'tenant', 'lease'])
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * ✅ NOUVELLE : Statistiques d'occupation
     */
    public static function getOccupationStats($propertyId): array
    {
        $totalAssignments = self::where('property_id', $propertyId)->count();

        $activeAssignments = self::where('property_id', $propertyId)
            ->where('status', 'active')
            ->where(function($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            })
            ->count();

        $pastAssignments = self::where('property_id', $propertyId)
            ->where(function($query) {
                $query->where('status', 'terminated')
                      ->orWhere(function($q) {
                          $q->where('status', 'active')
                            ->where('end_date', '<', now());
                      });
            })
            ->count();

        // Calculer la durée moyenne d'occupation
        $assignmentsWithEndDate = self::where('property_id', $propertyId)
            ->whereNotNull('end_date')
            ->where('status', 'terminated')
            ->get();

        $averageDuration = 0;
        if ($assignmentsWithEndDate->isNotEmpty()) {
            $totalDays = 0;
            foreach ($assignmentsWithEndDate as $assignment) {
                $totalDays += $assignment->start_date->diffInDays($assignment->end_date);
            }
            $averageDuration = round($totalDays / $assignmentsWithEndDate->count());
        }

        return [
            'total_assignments' => $totalAssignments,
            'active_tenants' => $activeAssignments,
            'past_tenants' => $pastAssignments,
            'occupancy_rate' => $totalAssignments > 0 ?
                round(($activeAssignments / $totalAssignments) * 100, 2) : 0,
            'average_duration_days' => $averageDuration,
        ];
    }
}
