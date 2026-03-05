<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id', 'payment_method', 'transaction_reference',
        'amount', 'payment_date', 'notes', 'recorded_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    // Mettre à jour la facture parente après création d'une transaction
    protected static function booted()
    {
        static::created(function ($transaction) {
            $invoice = $transaction->invoice;
            $invoice->amount_paid += $transaction->amount;

            if ($invoice->amount_paid >= $invoice->amount_total) {
                $invoice->status = 'paid';
            } elseif ($invoice->amount_paid > 0) {
                $invoice->status = 'partial';
            }

            $invoice->save();
        });
    }
}
