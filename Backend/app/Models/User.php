<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'email',
        'password',
        'phone',
        // 'role', // mirrored role for quick queries (admin,landlord,tenant)
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password_changed_at' => 'datetime',
    ];

    // One-to-one with Landlord (if user has landlord role)
    public function landlord(): HasOne
    {
        return $this->hasOne(Landlord::class, 'user_id');
    }

    // One-to-one with Tenant (if user has tenant role)
    public function tenant(): HasOne
    {
        return $this->hasOne(Tenant::class, 'user_id');
    }

    // Helper methods for role checking
    public function isLandlord(): bool
    {
        return $this->hasRole('landlord');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isTenant(): bool
    {
        return $this->hasRole('tenant');
    }
}
