<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Lease extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'property_id', 'tenant_id', 'lease_number', 'type',
        'start_date', 'end_date', 'tacit_renewal',
        'rent_amount', 'charges_amount', 'guarantee_amount', 'prepaid_rent_months',
        'billing_day', 'payment_frequency', 'penalty_rate',
        'status', 'contract_file_path', 'terms', 'termination_reason'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'terms' => 'array',
        'tacit_renewal' => 'boolean',
        'rent_amount' => 'decimal:2',
        'charges_amount' => 'decimal:2',
        'guarantee_amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
            if (empty($model->lease_number)) {
                // Format : BAIL-{ANNEE}-{RANDOM}
                $model->lease_number = 'BAIL-' . date('Y') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    // Relations
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
    
    public function conditionReports(): HasMany
    {
        return $this->hasMany(PropertyConditionReport::class);
    }
    
    public function entryConditionReport()
    {
        return $this->hasOne(PropertyConditionReport::class)
            ->where('type', 'entry');
    }
    
    public function exitConditionReport()
    {
        return $this->hasOne(PropertyConditionReport::class)
            ->where('type', 'exit');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Si vous implémentez les factures plus tard
    // public function invoices(): HasMany { return $this->hasMany(Invoice::class); }

    // Accesseur : Calcul du total mensuel (Loyer + Charges)
    public function getTotalRentAttribute()
    {
        return $this->rent_amount + $this->charges_amount;
    }

    // Helper : Est-ce que le bail est actif aujourd'hui ?
    public function getIsActiveAttribute()
    {
        $now = Carbon::now();
        return $this->status === 'active'
            && $this->start_date <= $now
            && ($this->end_date === null || $this->end_date >= $now);
    }
}
