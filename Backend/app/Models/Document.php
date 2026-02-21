<?php
// app/Models/Document.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'tenant_id',
        'property_id',
        'lease_id',
        'created_by',
        'name',
        'type',
        'category',
        'bien',
        'description',
        'file_path',
        'file_size',
        'file_type',
        'is_shared',
        'shared_with',
        'shared_with_emails',
        'status',
        'document_date',
        'metadata',
    ];

    protected $casts = [
        'is_shared' => 'boolean',
        'shared_with' => 'array',
        'shared_with_emails' => 'array',
        'metadata' => 'array',
        'document_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($document) {
            if (empty($document->uuid)) {
                $document->uuid = (string) Str::uuid();
            }
        });
    }

    // Relations
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Accesseurs
    public function getFileUrlAttribute()
    {
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            return $bytes . ' bytes';
        } elseif ($bytes == 1) {
            return '1 byte';
        } else {
            return '0 bytes';
        }
    }

    public function getSharedWithUsersAttribute()
    {
        if (empty($this->shared_with)) {
            return [];
        }

        return User::whereIn('id', $this->shared_with)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name ?? $user->email,
                'email' => $user->email,
            ];
        });
    }

    // Helpers
    public function getFileIcon()
    {
        $extension = pathinfo($this->file_path, PATHINFO_EXTENSION);

        $icons = [
            'pdf' => 'file-text',
            'doc' => 'file-text',
            'docx' => 'file-text',
            'xls' => 'file-spreadsheet',
            'xlsx' => 'file-spreadsheet',
            'jpg' => 'image',
            'jpeg' => 'image',
            'png' => 'image',
            'gif' => 'image',
        ];

        return $icons[$extension] ?? 'file';
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('status', 'actif');
    }

    public function scopeArchive($query)
    {
        return $query->where('status', 'archive');
    }

    public function scopeTemplate($query)
    {
        return $query->where('category', 'template');
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
