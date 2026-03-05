<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyEquipment extends Model
{
    protected $table = 'property_equipments'; // Préciser la table car le nom est composé

    protected $fillable = [
        'property_id', 'name', 'brand',
        'installation_date', 'value', 'condition'
    ];

    protected $casts = [
        'installation_date' => 'date',
        'value' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
