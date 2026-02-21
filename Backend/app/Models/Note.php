<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Note extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'tenant_id',
        'property_id',
        'lease_id',
        'created_by',
        'title',
        'content',
        'is_shared',
        'shared_with',
        'files',
        'meta',
    ];

    protected $casts = [
        'is_shared' => 'boolean',
        'shared_with' => 'array',
        'files' => 'array',
        'meta' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    // Relations
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scope
    public function scopeOfTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeShared($query)
    {
        return $query->where('is_shared', true);
    }

    // Helpers
    public function getFileUrlsAttribute()
    {
        if (!$this->files) {
            return [];
        }

        return array_map(function ($file) {
            return asset('storage/' . $file);
        }, $this->files);
    }

    public function getSharedWithUsersAttribute()
    {
        if (!$this->shared_with) {
            return [];
        }

        $users = User::whereIn('id', $this->shared_with)->get();
        return $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'role' => $user->roles->pluck('name')->first(),
            ];
        });
    }
}
