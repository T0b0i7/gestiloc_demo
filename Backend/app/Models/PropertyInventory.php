<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyInventory extends Model
{
    protected $fillable = [
        'lease_id', 'type', 'date',
        'report_pdf_path', 'is_signed', 'signatures', 'general_comments'
    ];

    protected $casts = [
        'date' => 'date',
        'is_signed' => 'boolean',
        'signatures' => 'array', // Stocke les métadonnées de signature (IP, date, hash)
    ];

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function items()
    {
        return $this->hasMany(InventoryItem::class, 'inventory_id');
    }
}
