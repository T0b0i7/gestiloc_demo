<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'lease_id', 'creator_user_id', 'subject', 'description',
        'priority', 'status', 'assigned_vendor_id'
    ];

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_user_id');
    }

    // Scope pour les tickets urgents
    public function scopeUrgent($query)
    {
        return $query->whereIn('priority', ['high', 'emergency']);
    }
}
