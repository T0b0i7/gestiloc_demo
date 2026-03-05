<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentLog extends Model
{
    protected $fillable = [
        'payment_id',
        'invoice_id',
        'lease_id',
        'tenant_id',
        'log_type',
        'gateway',
        'transaction_id',
        'reference',
        'amount',
        'currency',
        'status',
        'response_code',
        'response_message',
        'gateway_response',
        'ip_address',
        'user_agent',
        'payment_method',
        'metadata',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Paiement associé
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Facture associée
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Bail associé
     */
    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    /**
     * Locataire associé
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope pour filtrer par type de log
     */
    public function scopeByLogType($query, $logType)
    {
        return $query->where('log_type', $logType);
    }

    /**
     * Scope pour filtrer par statut
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope pour filtrer par gateway
     */
    public function scopeByGateway($query, $gateway)
    {
        return $query->where('gateway', $gateway);
    }

    /**
     * Scope pour les logs récents
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Scope pour les échecs
     */
    public function scopeFailures($query)
    {
        return $query->whereIn('status', ['failed', 'cancelled']);
    }

    /**
     * Scope pour les succès
     */
    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Créer un log de paiement
     */
    public static function log(array $data): self
    {
        return static::create([
            'payment_id' => $data['payment_id'] ?? null,
            'invoice_id' => $data['invoice_id'] ?? null,
            'lease_id' => $data['lease_id'] ?? null,
            'tenant_id' => $data['tenant_id'] ?? null,
            'log_type' => $data['log_type'],
            'gateway' => $data['gateway'],
            'transaction_id' => $data['transaction_id'] ?? null,
            'reference' => $data['reference'] ?? null,
            'amount' => $data['amount'] ?? 0,
            'currency' => $data['currency'] ?? 'XOF',
            'status' => $data['status'],
            'response_code' => $data['response_code'] ?? null,
            'response_message' => $data['response_message'] ?? null,
            'gateway_response' => $data['gateway_response'] ?? null,
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
            'payment_method' => $data['payment_method'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'processed_at' => $data['processed_at'] ?? now(),
        ]);
    }

    /**
     * Obtenir l'icône pour le type de log
     */
    public function getIconAttribute(): string
    {
        return match($this->log_type) {
            'attempt' => '🔄',
            'callback' => '📞',
            'webhook' => '🔗',
            'failure' => '❌',
            'success' => '✅',
            'refund' => '💰',
            'chargeback' => '⚠️',
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
            'cancelled' => 'orange',
            'pending' => 'yellow',
            'processing' => 'blue',
            default => 'gray',
        };
    }

    /**
     * Vérifier si c'est un échec
     */
    public function isFailure(): bool
    {
        return in_array($this->status, ['failed', 'cancelled']);
    }

    /**
     * Vérifier si c'est un succès
     */
    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }
}
