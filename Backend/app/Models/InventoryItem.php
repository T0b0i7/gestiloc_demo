<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'inventory_id', 'room_name', 'element_name',
        'state', 'observation', 'quantity', 'photos'
    ];

    protected $casts = [
        'photos' => 'array', // URLs des photos des dégâts
        'quantity' => 'integer',
    ];

    public function inventory()
    {
        return $this->belongsTo(PropertyInventory::class, 'inventory_id');
    }
}
