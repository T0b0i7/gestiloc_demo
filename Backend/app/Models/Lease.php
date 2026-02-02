<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Invoice;
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
        'status', 'contract_file_path', 'terms', 'meta', 'termination_reason' // Ajouté 'meta' ici
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'terms' => 'array',
        'meta' => 'array', // AJOUTÉ ICI - Très important !
        'tacit_renewal' => 'boolean',
        'rent_amount' => 'decimal:2',
        'charges_amount' => 'decimal:2',
        'guarantee_amount' => 'decimal:2',
        'prepaid_rent_months' => 'integer',
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

    public function propertyAssignments(): HasMany
    {
        return $this->hasMany(PropertyAssignment::class);
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

    /**
     * Relation avec les factures du bail
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

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

    /**
     * Accesseur pour meta avec gestion automatique du JSON
     */
    public function getMetaAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }

        return $value ?? [];
    }

    /**
     * Mutateur pour meta avec conversion automatique en JSON
     */
    public function setMetaAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['meta'] = json_encode($value);
        } else {
            $this->attributes['meta'] = $value;
        }
    }

    /**
     * Ajouter un document à l'historique
     */
    public function addDocumentToMeta(array $documentData): void
    {
        $meta = $this->meta;
        $documents = $meta['documents'] ?? [];

        $documents[] = $documentData;
        $meta['documents'] = $documents;

        $this->meta = $meta;
        $this->save();
    }

    /**
     * Récupérer les documents de l'historique
     */
    public function getDocumentsFromMeta(): array
    {
        return $this->meta['documents'] ?? [];
    }

    /**
     * Supprimer un document de l'historique
     */
    public function removeDocumentFromMeta(string $documentId): bool
    {
        $meta = $this->meta;
        $documents = $meta['documents'] ?? [];

        $newDocuments = array_filter($documents, function($doc) use ($documentId) {
            return ($doc['id'] ?? '') != $documentId;
        });

        $meta['documents'] = array_values($newDocuments);
        $this->meta = $meta;

        return $this->save();
    }
}
