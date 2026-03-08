<?php

namespace App\Http\Controllers\Api\Landlord;

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
     * GET /api/landlord/settings - Récupérer les paramètres
     */
    public function index()
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            // Valeurs par défaut des notifications pour landlord
            $defaultNotifications = [
                'payment_received' => true,
                'payment_reminder' => true,
                'lease_expiry' => true,
                'maintenance_request' => true,
                'monthly_report' => false,
                'email_notifications' => true,
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
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
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
            Log::error('Erreur chargement paramètres landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du chargement des paramètres'
            ], 500);
        }
    }

    /**
     * PUT /api/landlord/settings/password - Changer le mot de passe
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

            Log::info('Mot de passe changé - Landlord', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Mot de passe changé avec succès'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur changement mot de passe landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du changement de mot de passe'
            ], 500);
        }
    }

    /**
     * PUT /api/landlord/settings/preferences - Mettre à jour les préférences
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
            Log::error('Erreur mise à jour préférences landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * PUT /api/landlord/settings/notifications - Mettre à jour les notifications
     */
    public function updateNotifications(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'payment_received' => 'sometimes|boolean',
                'payment_reminder' => 'sometimes|boolean',
                'lease_expiry' => 'sometimes|boolean',
                'maintenance_request' => 'sometimes|boolean',
                'monthly_report' => 'sometimes|boolean',
                'email_notifications' => 'sometimes|boolean',
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
            Log::error('Erreur mise à jour notifications landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * PUT /api/landlord/settings/privacy - Mettre à jour la confidentialité
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
            Log::error('Erreur mise à jour confidentialité landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * POST /api/landlord/settings/2fa/enable - Activer 2FA
     */
    public function enableTwoFactor(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            // Générer un secret
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
            Log::error('Erreur activation FA landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de l\'activation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/landlord/settings/2fa/disable - Désactiver 2FA
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
            Log::error('Erreur désactivation FA landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la désactivation'
            ], 500);
        }
    }

    /**
     * GET /api/landlord/settings/download-data - Télécharger les données
     */
    public function downloadData(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            // Récupérer toutes les données du landlord
            $data = [
                'user' => [
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'status' => $user->status,
                ],
                'landlord' => $user->landlord ? [
                    'nom' => $user->landlord->company_name ?? $user->landlord->first_name . ' ' . $user->landlord->last_name,
                    'adresse' => $user->landlord->address ?? '',
                    'telephone' => $user->landlord->phone ?? $user->phone,
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
                    'total_biens' => $user->landlord ? $user->landlord->properties()->count() : 0,
                ],
            ];

            return response()->json($data);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement données landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du téléchargement des données'
            ], 500);
        }
    }

    /**
     * DELETE /api/landlord/settings/account - Supprimer le compte
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

            Log::info('Compte landlord supprimé', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Compte supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression compte landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression du compte'
            ], 500);
        }
    }

    /**
     * PUT /api/landlord/settings/profile - Mettre à jour le profil
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
            ]);

            $user->update($validated);
            $user->save();

            return response()->json([
                'message' => 'Profil mis à jour',
                'user' => [
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour profil landlord: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du profil'
            ], 500);
        }
    }
}
