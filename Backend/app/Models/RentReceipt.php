<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'lease_id',
        'property_id',
        'landlord_id',
        'tenant_id',

        'type',
        'paid_month',
        'issued_date',
        'amount_paid',

        'month',
        'year',
        'reference',
        'status',
        'notes',

        'pdf_path',
    ];

    protected $casts = [
        'month'       => 'integer',
        'year'        => 'integer',
        'issued_date' => 'date',
        'amount_paid' => 'decimal:2',
    ];

    public function lease(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Lease::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Property::class);
    }

    // landlord_id => users.id
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'landlord_id');
    }

    // tenant_id => tenants.id ✅
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Tenant::class, 'tenant_id');
    }
}
