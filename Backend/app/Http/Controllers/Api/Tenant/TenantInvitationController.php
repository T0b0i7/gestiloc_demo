<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Mail\LandlordInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TenantInvitationController extends Controller
{
    /**
     * Envoyer une invitation au propriétaire
     */
    public function inviteLandlord(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'name' => 'required|string|max:255',
                'message' => 'required|string'
            ]);

            $user = auth()->user();

            if (!$user || !$user->hasRole('tenant')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            // Récupérer les infos du locataire depuis la table tenants
            $tenant = $user->tenant;

            // Créer un tableau avec les infos du locataire
            $tenantInfo = [
                'first_name' => $tenant->first_name ?? $user->first_name ?? 'Locataire',
                'last_name' => $tenant->last_name ?? $user->last_name ?? '',
                'email' => $user->email,
                'phone' => $tenant->phone ?? $user->phone ?? null,
            ];

            Log::info('Tentative d\'envoi d\'invitation', [
                'tenant_id' => $user->id,
                'tenant_name' => $tenantInfo['first_name'] . ' ' . $tenantInfo['last_name'],
                'landlord_email' => $request->email,
                'landlord_name' => $request->name
            ]);

            // Envoyer l'email avec les infos du locataire
            Mail::to($request->email)->send(new LandlordInvitation(
                $request->name,
                $request->message,
                $tenantInfo
            ));

            Log::info('Invitation envoyée avec succès', [
                'tenant_id' => $user->id,
                'landlord_email' => $request->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invitation envoyée avec succès'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur envoi invitation propriétaire', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'tenant_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'invitation: ' . $e->getMessage()
            ], 500);
        }
    }
}
