<?php
// app/Models/Dossier.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Dossier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'tenant_id',
        'created_by',
        'nom',
        'prenoms',
        'date_naissance',
        'a_propos',
        'email',
        'telephone',
        'mobile',
        'adresse',
        'ville',
        'pays',
        'region',
        'type_activite',
        'profession',
        'revenus_mensuels',
        'has_garant',
        'garant_type',
        'garant_description',
        'documents',
        'is_shared',
        'shared_with',
        'shared_with_emails',
        'share_url',
        'status',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'has_garant' => 'boolean',
        'is_shared' => 'boolean',
        'documents' => 'array',
        'shared_with' => 'array',
        'shared_with_emails' => 'array',
        'revenus_mensuels' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($dossier) {
            if (empty($dossier->uuid)) {
                $dossier->uuid = (string) Str::uuid();
            }
            if (empty($dossier->share_url)) {
                $dossier->share_url = Str::random(32);
            }
        });
    }

    // Relations
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getSharedWithUsersAttribute()
    {
        if (empty($this->shared_with)) {
            return [];
        }

        return User::whereIn('id', $this->shared_with)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name ?? $user->email,
                'email' => $user->email,
            ];
        });
    }

    public function getFullNameAttribute()
    {
        return trim($this->prenoms . ' ' . $this->nom);
    }

    public function getShareableUrlAttribute()
    {
        return url('/dossier-partage/' . $this->share_url);
    }

    // Scopes
    public function scopeBrouillon($query)
    {
        return $query->where('status', 'brouillon');
    }

    public function scopePublie($query)
    {
        return $query->where('status', 'publie');
    }

    public function scopeArchive($query)
    {
        return $query->where('status', 'archive');
    }
}
