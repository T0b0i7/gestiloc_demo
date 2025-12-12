<?php

namespace App\Http\Controllers\Api\Common;

use App\Http\Controllers\Controller;
use App\Http\Requests\Common\UpdatePasswordRequest; // À créer
use App\Http\Requests\Common\UpdateProfileRequest;  // À créer
use App\Http\Resources\UserResource; // À créer
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Récupérer les infos de l'utilisateur connecté
     */
    public function show()
    {
        $user = auth()->user();

        // On charge la relation en fonction du rôle pour renvoyer un profil complet
        if ($user->landlord) {
            $user->load('landlord');
        } elseif ($user->tenant) {
            $user->load('tenant');
        }

        return new UserResource($user);
    }

    /**
     * Mettre à jour les informations générales
     */
    public function update(UpdateProfileRequest $request)
    {
        $user = auth()->user();
        $data = $request->validated();

        // 1. Mise à jour de la table 'users' (Email, Tel)
        $user->update([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? $user->phone,
        ]);

        // 2. Mise à jour de la table spécifique (landlords ou tenants)
        // On sépare le Nom/Prénom car ils sont stockés dans les tables enfants
        if ($user->landlord) {
            $user->landlord->update([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'address_billing' => $data['address'] ?? $user->landlord->address_billing,
                // Au Bénin, l'IFU est important pour les bailleurs
                'vat_number' => $data['ifu_number'] ?? $user->landlord->vat_number, 
            ]);
        } elseif ($user->tenant) {
            $user->tenant->update([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
            ]);
        }

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => new UserResource($user->refresh())
        ]);
    }

    /**
     * Changer le mot de passe
     */
    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = auth()->user();

        // Vérification de l'ancien mot de passe
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
                'errors' => ['current_password' => ['Mot de passe incorrect']]
            ], 422);
        }

        // Mise à jour
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    /**
     * Mettre à jour la photo de profil (Avatar)
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        $user = auth()->user();

        // Supprimer l'ancien avatar s'il existe et n'est pas l'avatar par défaut
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Upload du nouveau
        $path = $request->file('avatar')->store('avatars', 'public');

        // Note: Assurez-vous d'avoir ajouté une colonne 'avatar_path' à la table users
        // Sinon stockez-le dans les tables landlords/tenants via 'meta'
        $user->forceFill(['avatar_path' => $path])->save(); 

        return response()->json([
            'message' => 'Photo de profil mise à jour.',
            'avatar_url' => Storage::url($path)
        ]);
    }
}