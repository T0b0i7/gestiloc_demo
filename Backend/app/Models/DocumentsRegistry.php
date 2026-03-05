<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentsRegistry extends Model
{
    protected $fillable = [
        'document_type',
        'template_name',
        'template_version',
        'generated_by',
        'target_type',
        'target_id',
        'title',
        'reference',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'mime_type',
        'status',
        'visibility',
        'expires_at',
        'metadata',
        'tags',
        'access_permissions',
        'share_token',
        'share_expires_at',
        'last_accessed_at',
        'download_count',
        'access_log',
    ];

    protected $casts = [
        'metadata' => 'array',
        'tags' => 'array',
        'access_permissions' => 'array',
        'access_log' => 'array',
        'expires_at' => 'datetime',
        'share_expires_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'download_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Utilisateur qui a généré le document
     */
    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Cible polymorphe du document
     */
    public function target(): MorphTo
    {
        return $this->morphTo('target');
    }

    /**
     * Scope pour filtrer par type de document
     */
    public function scopeByType($query, $type)
    {
        return $query->where('document_type', $type);
    }

    /**
     * Scope pour filtrer par statut
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope pour filtrer par visibilité
     */
    public function scopeByVisibility($query, $visibility)
    {
        return $query->where('visibility', $visibility);
    }

    /**
     * Scope pour les documents récents
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope pour les documents expirés
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    /**
     * Scope pour les documents partagés
     */
    public function scopeShared($query)
    {
        return $query->whereNotNull('share_token')
                    ->where(function ($q) {
                        $q->whereNull('share_expires_at')
                          ->orWhere('share_expires_at', '>', now());
                    });
    }

    /**
     * Enregistrer un nouveau document
     */
    public static function register(array $data): self
    {
        // Générer une référence unique
        $reference = $data['reference'] ?? static::generateReference($data['document_type']);
        
        return static::create([
            'document_type' => $data['document_type'],
            'template_name' => $data['template_name'] ?? null,
            'template_version' => $data['template_version'] ?? null,
            'generated_by' => $data['generated_by'] ?? auth()->id(),
            'target_type' => $data['target_type'],
            'target_id' => $data['target_id'],
            'title' => $data['title'],
            'reference' => $reference,
            'description' => $data['description'] ?? null,
            'file_path' => $data['file_path'],
            'file_name' => $data['file_name'],
            'file_type' => $data['file_type'],
            'file_size' => $data['file_size'],
            'mime_type' => $data['mime_type'] ?? null,
            'status' => $data['status'] ?? 'generated',
            'visibility' => $data['visibility'] ?? 'private',
            'expires_at' => $data['expires_at'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'tags' => $data['tags'] ?? null,
            'access_permissions' => $data['access_permissions'] ?? null,
        ]);
    }

    /**
     * Générer une référence unique
     */
    public static function generateReference(string $type): string
    {
        $prefix = match($type) {
            'lease_contract' => 'LC',
            'rent_receipt' => 'RR',
            'notice' => 'NT',
            'invoice' => 'INV',
            'payment_confirmation' => 'PC',
            default => 'DOC',
        };
        
        return $prefix . '-' . date('Y') . '-' . str_pad(static::count() + 1, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Générer un token de partage
     */
    public function generateShareToken(int $expiresInHours = 24): string
    {
        $token = bin2hex(random_bytes(16));
        
        $this->update([
            'share_token' => $token,
            'share_expires_at' => now()->addHours($expiresInHours),
        ]);
        
        return $token;
    }

    /**
     * Révoquer le partage
     */
    public function revokeShare(): void
    {
        $this->update([
            'share_token' => null,
            'share_expires_at' => null,
        ]);
    }

    /**
     * Enregistrer un accès/téléchargement
     */
    public function recordAccess(string $action = 'download', array $context = []): void
    {
        $accessLog = $this->access_log ?? [];
        $accessLog[] = [
            'action' => $action,
            'timestamp' => now()->toISOString(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'user_id' => auth()->id(),
            'context' => $context,
        ];
        
        $this->update([
            'access_log' => $accessLog,
            'last_accessed_at' => now(),
            'download_count' => $action === 'download' ? $this->download_count + 1 : $this->download_count,
        ]);
    }

    /**
     * Vérifier si le document est accessible
     */
    public function isAccessible(?User $user = null): bool
    {
        // Vérifier l'expiration
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        
        // Le générateur a toujours accès
        if ($user && $user->id === $this->generated_by) {
            return true;
        }
        
        // Vérifier les permissions
        if ($this->visibility === 'public') {
            return true;
        }
        
        if ($this->visibility === 'private' && $user) {
            return $this->checkUserPermissions($user);
        }
        
        return false;
    }

    /**
     * Vérifier les permissions utilisateur
     */
    private function checkUserPermissions(User $user): bool
    {
        if (!$this->access_permissions) {
            return false;
        }
        
        $permissions = $this->access_permissions;
        
        // Vérifier par rôle
        if (isset($permissions['roles']) && in_array($user->getRoleAttribute(), $permissions['roles'])) {
            return true;
        }
        
        // Vérifier par ID
        if (isset($permissions['users']) && in_array($user->id, $permissions['users'])) {
            return true;
        }
        
        return false;
    }

    /**
     * Obtenir l'icône pour le type de document
     */
    public function getIconAttribute(): string
    {
        return match($this->document_type) {
            'lease_contract' => '📄',
            'rent_receipt' => '🧾',
            'notice' => '📋',
            'invoice' => '📃',
            'payment_confirmation' => '✅',
            'property_document' => '🏠',
            default => '📄',
        };
    }

    /**
     * Obtenir la couleur pour le statut
     */
    public function getColorAttribute(): string
    {
        return match($this->status) {
            'generated' => 'blue',
            'signed' => 'green',
            'archived' => 'gray',
            'deleted' => 'red',
            default => 'gray',
        };
    }

    /**
     * Obtenir la taille formatée
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
