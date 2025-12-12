<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Utility extends Model
{
    protected $fillable = ['property_id', 'type', 'meter_number', 'contract_number'];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
