<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id',
        'lease_id',
        'tenant_id',
        'landlord_user_id',
        'provider',
        'status',
        'amount_total',
        'fee_amount',
        'amount_net',
        'currency',
        'fedapay_transaction_id',
        'fedapay_reference',
        'checkout_token',
        'checkout_url',
        'provider_payload',
        'paid_at',
    ];

    protected $casts = [
        'provider_payload' => 'array',
        'paid_at' => 'datetime',
        'amount_total' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'amount_net' => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function landlordUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_user_id');
    }
}
