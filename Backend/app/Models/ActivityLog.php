<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'actor_id',
        'actor_role',
        'action',
        'description',
        'target_type',
        'target_id',
        'status',
        'ip_address',
        'user_agent',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
    ];

    public $timestamps = false; // Seulement created_at

    /**
     * Acteur qui a effectué l'action
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Cible polymorphe de l'action
     */
    public function target(): MorphTo
    {
        return $this->morphTo('target');
    }

    /**
     * Scope pour filtrer par acteur
     */
    public function scopeByActor($query, $actorId)
    {
        return $query->where('actor_id', $actorId);
    }

    /**
     * Scope pour filtrer par action
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope pour filtrer par statut
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope pour les actions récentes
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Créer un log d'activité
     */
    public static function log(array $data): self
    {
        return static::create([
            'actor_id' => $data['actor_id'],
            'actor_role' => $data['actor_role'],
            'action' => $data['action'],
            'description' => $data['description'] ?? null,
            'target_type' => $data['target_type'] ?? null,
            'target_id' => $data['target_id'] ?? null,
            'status' => $data['status'] ?? 'success',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'meta' => $data['meta'] ?? null,
        ]);
    }

    /**
     * Obtenir l'icône pour l'action
     */
    public function getIconAttribute(): string
    {
        return match($this->action) {
            'login' => '🔐',
            'create' => '➕',
            'update' => '✏️',
            'delete' => '🗑️',
            'generate_pdf' => '📄',
            'payment_attempt' => '💳',
            'payment_success' => '✅',
            'payment_failed' => '❌',
            'impersonate' => '👤',
            default => '📝',
        };
    }

    /**
     * Obtenir la couleur pour le statut
     */
    public function getColorAttribute(): string
    {
        return match($this->status) {
            'success' => 'green',
            'failed' => 'red',
            'pending' => 'yellow',
            'warning' => 'orange',
            default => 'gray',
        };
    }
}
