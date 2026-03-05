<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PropertyConditionPhoto extends Model
{
    protected $appends = ['url'];

    protected $fillable = [
        'report_id',
        'path',
        'original_filename',
        'mime_type',
        'size',
        'condition_status',
        'condition_notes',
        'taken_at',
        'caption',
    ];

    public function getUrlAttribute(): ?string
    {
        return $this->path ? Storage::disk('public')->url($this->path) : null;
    }
}
