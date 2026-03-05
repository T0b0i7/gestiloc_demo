<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PropertyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'reported_by',
        'report_type',
        'description',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    // Relationships
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeDismissed($query)
    {
        return $query->where('status', 'dismissed');
    }

    // Helper methods
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isUnderReview(): bool
    {
        return $this->status === 'under_review';
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    public function isDismissed(): bool
    {
        return $this->status === 'dismissed';
    }

    public function markAsUnderReview(User $reviewer): void
    {
        $this->update([
            'status' => 'under_review',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);
    }

    public function markAsResolved(User $reviewer, string $adminNotes = null): void
    {
        $this->update([
            'status' => 'resolved',
            'admin_notes' => $adminNotes,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);
    }

    public function markAsDismissed(User $reviewer, string $adminNotes = null): void
    {
        $this->update([
            'status' => 'dismissed',
            'admin_notes' => $adminNotes,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);
    }

    public function getReportTypeLabelAttribute(): string
    {
        return match($this->report_type) {
            'inappropriate_content' => 'Contenu inapproprié',
            'fake_listing' => 'Fausse annonce',
            'incorrect_info' => 'Informations incorrectes',
            'safety_issue' => 'Problème de sécurité',
            'other' => 'Autre',
            default => $this->report_type,
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'En attente',
            'under_review' => 'En cours de révision',
            'resolved' => 'Résolu',
            'dismissed' => 'Rejeté',
            default => $this->status,
        };
    }
}
