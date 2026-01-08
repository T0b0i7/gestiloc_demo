<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CoOwnerInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'invited_by_type',
        'invited_by_id',
        'target_type',
        'landlord_id',
        'co_owner_user_id',
        'email',
        'name',
        'token',
        'expires_at',
        'used',
        'accepted_at',
        'meta',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'used' => 'boolean',
        'meta' => 'array',
    ];

    public static function makeToken(): string
    {
        return hash('sha256', Str::random(60) . microtime(true));
    }

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(Landlord::class, 'landlord_id');
    }

    public function coOwnerUser()
    {
        return $this->belongsTo(User::class, 'co_owner_user_id');
    }

    /**
     * Relation polymorphe : qui a envoyé l'invitation
     */
    public function invitedBy(): MorphTo
    {
        return $this->morphTo('invited_by', 'invited_by_type', 'invited_by_id');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return $this->used || $this->accepted_at !== null;
    }

    public function isValid(): bool
    {
        return !$this->isUsed() && !$this->isExpired();
    }
}
