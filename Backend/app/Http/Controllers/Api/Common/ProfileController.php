<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\CoOwner;
use App\Models\User;

class CoOwnerMeController extends Controller
{
    /**
     * Récupérer le profil du co-owner connecté
     */
    public function getProfile()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $coOwner = CoOwner::where('user_id', $user->id)->first();

            if (!$coOwner) {
                return response()->json([
                    'message' => 'Profil co-owner non trouvé'
                ], 404);
            }

            // Calculer les statistiques (ajuster selon vos relations)
            $delegatedPropertiesCount = $coOwner->delegations()->count() ?? 0;
            $activeLeasesCount = 0; // À remplir selon vos relations
            $totalRentCollected = 0; // À remplir selon vos relations

            return response()->json([
                'id' => $coOwner->id,
                'user_id' => $coOwner->user_id,
                'first_name' => $coOwner->first_name,
                'last_name' => $coOwner->last_name,
                'email' => $user->email,
                'phone' => $coOwner->phone ?? $user->phone,
                'company_name' => $coOwner->company_name,
                'address' => $coOwner->address,
                'address_billing' => $coOwner->address_billing,
                'date_of_birth' => $coOwner->date_of_birth,
                'id_number' => $coOwner->id_number,
                'license_number' => $coOwner->license_number,
                'is_professional' => (bool) $coOwner->is_professional,
                'co_owner_type' => $coOwner->co_owner_type ?? 'co_owner',
                'ifu' => $coOwner->ifu,
                'rccm' => $coOwner->rccm,
                'vat_number' => $coOwner->vat_number,
                'status' => $coOwner->status,
                'joined_at' => $coOwner->joined_at,
                'created_at' => $coOwner->created_at,
                'updated_at' => $coOwner->updated_at,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'email_verified_at' => $user->email_verified_at,
                    'last_login_at' => $user->last_login_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ],
                'statistics' => [
                    'delegated_properties_count' => $delegatedPropertiesCount,
                    'active_leases_count' => $activeLeasesCount,
                    'total_rent_collected' => $totalRentCollected,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getProfile: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil du co-owner
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $coOwner = CoOwner::where('user_id', $user->id)->first();

            if (!$coOwner) {
                return response()->json([
                    'message' => 'Profil co-owner non trouvé'
                ], 404);
            }

            // Déterminer si c'est une agence ou un professionnel
            $isAgency = $coOwner->co_owner_type === 'agency';
            $isProfessional = (bool) $coOwner->is_professional;

            // Règles de validation de base (toujours modifiables)
            $validationRules = [
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'email' => 'nullable|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'date_of_birth' => 'nullable|date',
                'id_number' => 'nullable|string|max:50',
            ];

            // Les champs professionnels sont modifiables UNIQUEMENT pour les agences/professionnels
            if ($isAgency || $isProfessional) {
                $validationRules['company_name'] = 'nullable|string|max:255';
                $validationRules['address_billing'] = 'nullable|string';
                $validationRules['license_number'] = 'nullable|string|max:100';
                $validationRules['ifu'] = 'nullable|string|max:100';
                $validationRules['rccm'] = 'nullable|string|max:100';
                $validationRules['vat_number'] = 'nullable|string|max:100';
            }

            $validator = Validator::make($request->all(), $validationRules);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mise à jour de la table users
            $userData = [];
            if ($request->has('email') && !empty($request->email)) {
                $userData['email'] = $request->email;
            }
            if ($request->has('phone') && !empty($request->phone)) {
                $userData['phone'] = $request->phone;
            }

            if (!empty($userData)) {
                $user->update($userData);
            }

            // Mise à jour de la table co_owners
            $coOwnerData = [];

            // Champs personnels (toujours modifiables pour tous)
            if ($request->has('first_name')) {
                $coOwnerData['first_name'] = $request->first_name;
            }
            if ($request->has('last_name')) {
                $coOwnerData['last_name'] = $request->last_name;
            }
            if ($request->has('address')) {
                $coOwnerData['address'] = $request->address;
            }
            if ($request->has('date_of_birth')) {
                $coOwnerData['date_of_birth'] = $request->date_of_birth;
            }
            if ($request->has('id_number')) {
                $coOwnerData['id_number'] = $request->id_number;
            }

            // Champs professionnels (seulement pour les agences/professionnels)
            if ($isAgency || $isProfessional) {
                if ($request->has('company_name')) {
                    $coOwnerData['company_name'] = $request->company_name;
                }
                if ($request->has('address_billing')) {
                    $coOwnerData['address_billing'] = $request->address_billing;
                }
                if ($request->has('license_number')) {
                    $coOwnerData['license_number'] = $request->license_number;
                }
                if ($request->has('ifu')) {
                    $coOwnerData['ifu'] = $request->ifu;
                }
                if ($request->has('rccm')) {
                    $coOwnerData['rccm'] = $request->rccm;
                }
                if ($request->has('vat_number')) {
                    $coOwnerData['vat_number'] = $request->vat_number;
                }
            }

            // Mettre à jour le numéro de téléphone dans co_owners s'il est fourni
            if ($request->has('phone') && !empty($request->phone)) {
                $coOwnerData['phone'] = $request->phone;
            }

            // Filtrer les valeurs nulles
            $coOwnerData = array_filter($coOwnerData, function($value) {
                return $value !== null;
            });

            if (!empty($coOwnerData)) {
                $coOwner->update($coOwnerData);
            }

            // Rafraîchir les relations
            $coOwner->refresh();
            $user->refresh();

            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'profile' => [
                    'id' => $coOwner->id,
                    'user_id' => $coOwner->user_id,
                    'first_name' => $coOwner->first_name,
                    'last_name' => $coOwner->last_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company_name' => $coOwner->company_name,
                    'address' => $coOwner->address,
                    'address_billing' => $coOwner->address_billing,
                    'date_of_birth' => $coOwner->date_of_birth,
                    'id_number' => $coOwner->id_number,
                    'license_number' => $coOwner->license_number,
                    'is_professional' => (bool) $coOwner->is_professional,
                    'co_owner_type' => $coOwner->co_owner_type ?? 'co_owner',
                    'ifu' => $coOwner->ifu,
                    'rccm' => $coOwner->rccm,
                    'vat_number' => $coOwner->vat_number,
                    'status' => $coOwner->status,
                    'joined_at' => $coOwner->joined_at,
                    'created_at' => $coOwner->created_at,
                    'updated_at' => $coOwner->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur updateProfile: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ... autres méthodes existantes
}
