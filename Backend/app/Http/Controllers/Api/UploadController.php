<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        // Validation : 1 image obligatoire
        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'], // 5 Mo
        ]);

        if (! $request->hasFile('file')) {
            return response()->json([
                'message' => 'Aucun fichier reçu.',
            ], 422);
        }

        $file = $request->file('file');

        // Stockage dans storage/app/public/properties
        $path = $file->store('properties', 'public');

        // URL publique (via storage:link)
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'path' => $path,
            'url'  => $url,
        ], 201);
    }
}
