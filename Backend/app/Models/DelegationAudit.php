<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DelegationAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'delegation_id',
        'auditable_type',
        'auditable_id',
        'action', // created, updated, revoked, expired, permission_changed
        'old_values',
        'new_values',
        'reason',
        'performed_by_type', // user, landlord, co_owner, agency
        'performed_by_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * La délégation concernée
     */
    public function delegation(): BelongsTo
    {
        return $this->belongsTo(PropertyDelegation::class);
    }

    /**
     * L'entité auditée (polymorphe)
     */
    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * L'utilisateur qui a effectué l'action (polymorphe)
     */
    public function performedBy(): MorphTo
    {
        return $this->morphTo('performed_by', 'performed_by_type', 'performed_by_id');
    }

    /**
     * Scope pour les actions de création
     */
    public function scopeCreated($query)
    {
        return $query->where('action', 'created');
    }

    /**
     * Scope pour les actions de révocation
     */
    public function scopeRevoked($query)
    {
        return $query->where('action', 'revoked');
    }

    /**
     * Scope pour les modifications de permissions
     */
    public function scopePermissionChanged($query)
    {
        return $query->where('action', 'permission_changed');
    }

    /**
     * Créer une entrée d'audit pour une délégation
     */
    public static function createAudit(
        PropertyDelegation $delegation,
        string $action,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $reason = null,
        ?Model $performedBy = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return static::create([
            'delegation_id' => $delegation->id,
            'auditable_type' => get_class($delegation->coOwner),
            'auditable_id' => $delegation->co_owner_id,
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'reason' => $reason,
            'performed_by_type' => $performedBy ? get_class($performedBy) : null,
            'performed_by_id' => $performedBy?->id,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Obtenir la description de l'action
     */
    public function getActionDescriptionAttribute(): string
    {
        return match($this->action) {
            'created' => 'Délégation créée',
            'updated' => 'Délégation modifiée',
            'revoked' => 'Délégation révoquée',
            'expired' => 'Délégation expirée',
            'permission_changed' => 'Permissions modifiées',
            default => 'Action inconnue',
        };
    }
}
