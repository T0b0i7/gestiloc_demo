<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class SettingsController extends Controller
{
    private function getUser()
    {
        $user = auth()->user();

        if (!$user) {
            return null;
        }

        return $user;
    }

    /**
     * GET /api/tenant/settings - Récupérer les paramètres
     */
    public function index()
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            // Valeurs par défaut des notifications
            $defaultNotifications = [
                'owner_messages' => true,
                'payment_reminders' => true,
                'receipts_available' => true,
                'interventions' => true,
                'browser_notifications' => false,
            ];

            // Fusionner avec les paramètres existants
            $notificationSettings = array_merge(
                $defaultNotifications,
                $user->notification_settings ?? []
            );

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'created_at' => $user->created_at,
                ],
                'security' => [
                    'two_factor_enabled' => (bool) $user->two_factor_enabled,
                    'last_password_change' => $user->last_password_change,
                    'last_login_at' => $user->last_login_at,
                    'last_login_ip' => $user->last_login_ip,
                ],
                'preferences' => [
                    'language' => $user->language ?? 'fr',
                    'timezone' => $user->timezone ?? 'Europe/Paris',
                    'date_format' => $user->date_format ?? 'd/m/Y',
                    'currency' => $user->currency ?? 'FCFA',
                    'dark_mode' => (bool) $user->dark_mode,
                ],
                'notifications' => $notificationSettings,
                'privacy' => [
                    'data_sharing' => (bool) $user->data_sharing,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur chargement paramètres: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du chargement des paramètres'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/settings/password - Changer le mot de passe
     */
    public function updatePassword(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => ['required', 'string', 'min:8'],
                'confirm_password' => 'required|string|same:new_password',
            ]);

            // Vérifier le mot de passe actuel
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Le mot de passe actuel est incorrect'
                ], 422);
            }

            // Mettre à jour le mot de passe
            $user->password = Hash::make($validated['new_password']);
            $user->last_password_change = now();
            $user->save();

            Log::info('Mot de passe changé', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Mot de passe changé avec succès'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur changement mot de passe: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du changement de mot de passe'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/settings/preferences - Mettre à jour les préférences
     */
    public function updatePreferences(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'language' => 'sometimes|in:fr,en,es,de,it',
                'timezone' => 'sometimes|timezone',
                'date_format' => 'sometimes|in:d/m/Y,m/d/Y,Y-m-d',
                'currency' => 'sometimes|in:FCFA,USD,GBP,CHF',
                'dark_mode' => 'sometimes|boolean',
            ]);

            foreach ($validated as $key => $value) {
                $user->$key = $value;
            }
            $user->save();

            return response()->json([
                'message' => 'Préférences mises à jour',
                'preferences' => [
                    'language' => $user->language,
                    'timezone' => $user->timezone,
                    'date_format' => $user->date_format,
                    'currency' => $user->currency,
                    'dark_mode' => (bool) $user->dark_mode,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour préférences: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/settings/notifications - Mettre à jour les notifications
     */
    public function updateNotifications(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'owner_messages' => 'sometimes|boolean',
                'payment_reminders' => 'sometimes|boolean',
                'receipts_available' => 'sometimes|boolean',
                'interventions' => 'sometimes|boolean',
                'browser_notifications' => 'sometimes|boolean',
            ]);

            $currentSettings = $user->notification_settings ?? [];
            $newSettings = array_merge($currentSettings, $validated);

            $user->notification_settings = $newSettings;
            $user->save();

            return response()->json([
                'message' => 'Paramètres de notification mis à jour',
                'notifications' => $newSettings
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour notifications: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/settings/privacy - Mettre à jour la confidentialité
     */
    public function updatePrivacy(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'data_sharing' => 'sometimes|boolean',
            ]);

            if (isset($validated['data_sharing'])) {
                $user->data_sharing = $validated['data_sharing'];
                $user->save();
            }

            return response()->json([
                'message' => 'Paramètres de confidentialité mis à jour',
                'privacy' => [
                    'data_sharing' => (bool) $user->data_sharing,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour confidentialité: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * POST /api/tenant/settings/2fa/enable - Activer 2FA
     */
    public function enableTwoFactor(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            // Générer un secret plus court pour éviter les problèmes de taille
            $secret = Str::random(20);

            // Générer des codes de récupération (8 codes de 8 caractères)
            $recoveryCodes = [];
            for ($i = 0; $i < 8; $i++) {
                $recoveryCodes[] = Str::upper(Str::random(8));
            }

            $user->two_factor_enabled = true;
            $user->two_factor_secret = encrypt($secret);
            $user->two_factor_recovery_codes = encrypt(json_encode($recoveryCodes));
            $user->save();

            return response()->json([
                'message' => 'Authentification à deux facteurs activée',
                'secret' => $secret,
                'recovery_codes' => $recoveryCodes,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur activation 2FA: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de l\'activation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/tenant/settings/2fa/disable - Désactiver 2FA
     */
    public function disableTwoFactor(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $user->two_factor_enabled = false;
            $user->two_factor_secret = null;
            $user->two_factor_recovery_codes = null;
            $user->save();

            return response()->json([
                'message' => 'Authentification à deux facteurs désactivée'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur désactivation 2FA: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la désactivation'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/settings/download-data - Télécharger les données
     */
    public function downloadData(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            // Récupérer toutes les données de l'utilisateur
            $data = [
                'user' => [

                    'email' => $user->email,
                    'phone' => $user->phone,

                    'status' => $user->status,
                ],
                'tenant' => $user->tenant ? [
                    'nom' => $user->tenant->first_name . ' ' . $user->tenant->last_name,
                    'email' => $user->email,
                    'telephone' => $user->tenant->emergency_contact_phone ?? $user->phone,
                    'adresse' => $user->tenant->address . ', ' . $user->tenant->city . ' ' . $user->tenant->zip_code,

                ] : null,
                'preferences' => [
                    'langue' => $user->language === 'fr' ? 'Français' : ($user->language === 'en' ? 'Anglais' : $user->language),
                    'fuseau_horaire' => $user->timezone,
                    'format_date' => $user->date_format === 'd/m/Y' ? 'JJ/MM/AAAA' : ($user->date_format === 'm/d/Y' ? 'MM/JJ/AAAA' : 'AAAA-MM-JJ'),
                    'devise' => $user->currency,
                    'mode_sombre' => $user->dark_mode ? 'Activé' : 'Désactivé',
                ],
                'securite' => [
                    '2fa_active' => $user->two_factor_enabled ? 'Oui' : 'Non',
                    'dernier_changement_mdp' => $user->last_password_change ? $user->last_password_change->format('d/m/Y H:i:s') : 'Jamais',
                    'derniere_connexion' => $user->last_login_at ? $user->last_login_at->format('d/m/Y H:i:s') : 'Jamais',
                    'derniere_ip' => $user->last_login_ip ?? 'Inconnue',
                ],
                'statistiques' => [
                    'membre_depuis' => $user->created_at->diffForHumans(),
                    'total_notes' => $user->tenant ? $user->tenant->notes()->count() : 0,
                ],
            ];

            return response()->json($data);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement données: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du téléchargement des données'
            ], 500);
        }
    }

    /**
     * DELETE /api/tenant/settings/account - Supprimer le compte
     */
    public function deleteAccount(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            // Marquer le compte comme supprimé (soft delete)
            $user->delete();

            Log::info('Compte supprimé', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Compte supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression compte: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression du compte'
            ], 500);
        }
    }
}
