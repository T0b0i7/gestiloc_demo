<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Landlord extends Model
{
    use HasFactory;

   protected $fillable = [
    'user_id',
    'owner_type',
    'first_name',
    'last_name',
    'company_name',
    'address_billing',
    'vat_number',
    'meta',
    'fedapay_subaccount_id',
    'fedapay_meta',
];

protected $casts = [
    'meta' => 'array',
    'fedapay_meta' => 'array',
];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'landlord_id');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(TenantInvitation::class, 'landlord_id');
    }

    /**
     * Scope pour n'obtenir que les landlords purs
     */
    public function scopePureLandlords($query)
    {
        return $query->where('owner_type', 'landlord');
    }

    /**
     * Scope pour n'obtenir que les co-owners particuliers
     */
    public function scopeCoOwners($query)
    {
        return $query->where('owner_type', 'co_owner');
    }

    /**
     * Vérifier si c'est un co-owner particulier
     */
    public function isCoOwner(): bool
    {
        return $this->owner_type === 'co_owner';
    }

    /**
     * Vérifier si c'est un landlord pur
     */
    public function isPureLandlord(): bool
    {
        return $this->owner_type === 'landlord';
    }
}
