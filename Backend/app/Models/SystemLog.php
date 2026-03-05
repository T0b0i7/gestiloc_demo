<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemLog extends Model
{
    protected $fillable = [
        'level',
        'channel',
        'message',
        'environment',
        'context',
        'source_file',
        'line_number',
        'user_id',
        'request_id',
        'ip_address',
        'user_agent',
        'request_method',
        'request_url',
        'exception_class',
        'stack_trace',
        'context_data',
        'request_data',
        'session_data',
        'memory_usage',
        'execution_time',
        'resolved',
        'resolution_notes',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'context_data' => 'array',
        'request_data' => 'array',
        'session_data' => 'array',
        'memory_usage' => 'integer',
        'execution_time' => 'float',
        'resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Utilisateur associé
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Admin qui a résolu le problème
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope pour filtrer par niveau
     */
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope pour filtrer par canal
     */
    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope pour les erreurs critiques
     */
    public function scopeCritical($query)
    {
        return $query->whereIn('level', ['emergency', 'alert', 'critical', 'error']);
    }

    /**
     * Scope pour les non résolus
     */
    public function scopeUnresolved($query)
    {
        return $query->where('resolved', false);
    }

    /**
     * Scope pour les résolus
     */
    public function scopeResolved($query)
    {
        return $query->where('resolved', true);
    }

    /**
     * Scope pour les logs récents
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Créer un log système
     */
    public static function log(array $data): self
    {
        return static::create([
            'level' => $data['level'],
            'channel' => $data['channel'] ?? 'system',
            'message' => $data['message'],
            'environment' => $data['environment'] ?? config('app.env'),
            'context' => $data['context'] ?? null,
            'source_file' => $data['source_file'] ?? null,
            'line_number' => $data['line_number'] ?? null,
            'user_id' => $data['user_id'] ?? auth()->id(),
            'request_id' => $data['request_id'] ?? request()?->header('X-Request-ID'),
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
            'request_method' => $data['request_method'] ?? request()->method(),
            'request_url' => $data['request_url'] ?? request()->fullUrl(),
            'exception_class' => $data['exception_class'] ?? null,
            'stack_trace' => $data['stack_trace'] ?? null,
            'context_data' => $data['context_data'] ?? null,
            'request_data' => $data['request_data'] ?? null,
            'session_data' => $data['session_data'] ?? null,
            'memory_usage' => $data['memory_usage'] ?? memory_get_usage(),
            'execution_time' => $data['execution_time'] ?? microtime(true) - LARAVEL_START,
        ]);
    }

    /**
     * Logger une exception
     */
    public static function logException(\Throwable $exception, array $context = []): self
    {
        return static::log([
            'level' => 'error',
            'channel' => $context['channel'] ?? 'app',
            'message' => $exception->getMessage(),
            'exception_class' => get_class($exception),
            'stack_trace' => $exception->getTraceAsString(),
            'source_file' => $exception->getFile(),
            'line_number' => $exception->getLine(),
            'context_data' => $context,
        ]);
    }

    /**
     * Marquer comme résolu
     */
    public function markAsResolved(string $notes = null): bool
    {
        return $this->update([
            'resolved' => true,
            'resolution_notes' => $notes,
            'resolved_at' => now(),
            'resolved_by' => auth()->id(),
        ]);
    }

    /**
     * Obtenir l'icône pour le niveau
     */
    public function getIconAttribute(): string
    {
        return match($this->level) {
            'emergency' => '🚨',
            'alert' => '⚠️',
            'critical' => '🔥',
            'error' => '❌',
            'warning' => '⚡',
            'notice' => 'ℹ️',
            'info' => '📢',
            'debug' => '🐛',
            default => '📝',
        };
    }

    /**
     * Obtenir la couleur pour le niveau
     */
    public function getColorAttribute(): string
    {
        return match($this->level) {
            'emergency', 'alert', 'critical' => 'red',
            'error' => 'orange',
            'warning' => 'yellow',
            'notice', 'info' => 'blue',
            'debug' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Obtenir la priorité
     */
    public function getPriorityAttribute(): int
    {
        return match($this->level) {
            'emergency' => 8,
            'alert' => 7,
            'critical' => 6,
            'error' => 5,
            'warning' => 4,
            'notice' => 3,
            'info' => 2,
            'debug' => 1,
            default => 0,
        };
    }
}
