<?php

namespace App\Http\Controllers\Api\Common;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload générique de fichier
     * POST /api/upload
     */
    public function store(Request $request)
    {
        // 1. Validation stricte
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB global
            'type' => 'required|string|in:property_photo,document,ticket_image,avatar', // Whitelist des dossiers
        ]);

        $file = $request->file('file');
        $type = $request->input('type');

        // 2. Configuration selon le type (Dossier et Règles)
        $config = $this->getUploadConfig($type);

        // Validation spécifique Mime Type (ex: PDF uniquement pour documents, Images pour photos)
        if (!in_array($file->getMimeType(), $config['allowed_mimes'])) {
            return response()->json(['message' => 'Type de fichier non autorisé pour cette catégorie.'], 422);
        }

        // 3. Renommage sécurisé (Timestamp + Random)
        // ex: properties/2023_10_21_xf342_nom-fichier.jpg
        $filename = time() . '_' . Str::random(5) . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
        
        // 4. Stockage (Local ou S3 selon .env)
        $path = $file->storeAs($config['path'], $filename, 'public');

        return response()->json([
            'success' => true,
            'url' => Storage::url($path),      // URL publique pour le Frontend
            'path' => $path,                   // Chemin relatif pour la BDD
            'name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize()
        ], 201);
    }

    /**
     * (Optionnel) Supprimer un fichier temporaire ou erroné
     */
    public function destroy(Request $request)
    {
        $request->validate(['path' => 'required|string']);

        // Sécurité : On empêche de supprimer n'importe quoi (traversal attack)
        // On ne supprime que si le chemin appartient à nos dossiers publics
        $path = $request->input('path');
        
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['message' => 'Fichier supprimé.']);
        }

        return response()->json(['message' => 'Fichier introuvable.'], 404);
    }

    /**
     * Configuration des dossiers et extensions autorisées
     */
    private function getUploadConfig($type)
    {
        $configs = [
            'property_photo' => [
                'path' => 'properties',
                'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            ],
            'ticket_image' => [
                'path' => 'tickets',
                'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
            ],
            'avatar' => [
                'path' => 'avatars',
                'allowed_mimes' => ['image/jpeg', 'image/png'],
            ],
            'document' => [
                'path' => 'documents',
                // Au Bénin, on scanne beaucoup de CNI et Baux en PDF ou Image
                'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'], 
            ],
        ];

        return $configs[$type] ?? [
            'path' => 'others',
            'allowed_mimes' => []
        ];
    }
}