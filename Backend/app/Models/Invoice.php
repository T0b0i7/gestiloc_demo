<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'lease_id', 'invoice_number', 'type',
        'due_date', 'period_start', 'period_end',
        'amount_total', 'amount_paid', 'status',
        'pdf_path', 'sent_at'
    ];

    protected $casts = [
        'due_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'sent_at' => 'datetime',
        'amount_total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->invoice_number)) {
                $model->invoice_number = 'FACT-' . strtoupper(Str::random(8));
            }
        });
    }

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Calculer le reste à payer
    public function getBalanceDueAttribute()
    {
        return max(0, $this->amount_total - $this->amount_paid);
    }
}
