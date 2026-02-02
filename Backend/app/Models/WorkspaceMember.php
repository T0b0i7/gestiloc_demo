<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkspaceMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id','user_id','role','permissions','status','joined_at'
    ];

    protected $casts = [
        'permissions' => 'array',
        'joined_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($q)
    {
        return $q->where('status', 'active');
    }

    public function effectivePermissions(): array
    {
        if (is_array($this->permissions)) return $this->permissions;

        return $this->role === 'manager' ? ['*'] : ['view'];
    }

    public function isReadOnlyOwner(): bool
    {
        return $this->role === 'owner' && !in_array('*', $this->effectivePermissions(), true);
    }
}
