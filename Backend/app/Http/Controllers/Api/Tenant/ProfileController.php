<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Lease;
use App\Models\Payment;
use App\Models\RentReceipt;
use App\Models\MaintenanceRequest;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Récupérer les informations du profil du locataire connecté
     */
    public function show(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Récupérer le profil tenant associé à l'utilisateur
            $tenant = Tenant::where('user_id', $user->id)->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil locataire non trouvé'
                ], 404);
            }

            // Formater les dates pour les inputs date (YYYY-MM-DD)
            $birthDate = $tenant->birth_date ? date('Y-m-d', strtotime($tenant->birth_date)) : null;
            $guarantorBirthDate = $tenant->guarantor_birth_date ? date('Y-m-d', strtotime($tenant->guarantor_birth_date)) : null;

            // Récupérer les statistiques
            $stats = $this->getTenantStats($tenant, $user);

            // Construire la réponse avec toutes les informations
            $profileData = [
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'created_at' => $user->created_at ? date('Y-m-d', strtotime($user->created_at)) : null,
                    'email_verified_at' => $user->email_verified_at ? date('Y-m-d', strtotime($user->email_verified_at)) : null,
                    'last_login_at' => $user->last_login_at ? date('Y-m-d', strtotime($user->last_login_at)) : null,
                    'language' => $user->language ?? 'fr',
                    'timezone' => $user->timezone ?? 'Africa/Porto-Novo',
                    'date_format' => $user->date_format ?? 'd/m/Y',
                    'currency' => 'XOF',
                    'dark_mode' => $user->dark_mode ?? false,
                    'two_factor_enabled' => $user->two_factor_enabled ?? false,
                    'notification_settings' => $user->notification_settings ?? $this->getDefaultNotificationSettings(),
                ],
                'tenant' => [
                    'id' => $tenant->id,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name,
                    'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                    'email' => $tenant->email ?? $user->email,
                    'phone' => $tenant->phone ?? $user->phone,
                    'birth_date' => $birthDate,
                    'birth_place' => $tenant->birth_place,
                    'marital_status' => $tenant->marital_status,
                    'profession' => $tenant->profession,
                    'employer' => $tenant->employer,
                    'annual_income' => $tenant->annual_income,
                    'monthly_income' => $tenant->monthly_income,
                    'contract_type' => $tenant->contract_type,
                    'tenant_type' => $tenant->tenant_type,
                    'status' => $tenant->status,
                    'created_at' => $tenant->created_at ? date('Y-m-d', strtotime($tenant->created_at)) : null,
                    'updated_at' => $tenant->updated_at ? date('Y-m-d', strtotime($tenant->updated_at)) : null,
                    'employer_address' => $tenant->employer_address ?? null,
                ],
                'address' => [
                    'street' => $tenant->address,
                    'complement' => $tenant->address_complement ?? null,
                    'zip_code' => $tenant->zip_code,
                    'city' => $tenant->city,
                    'country' => $tenant->country ?? 'Bénin',
                ],
                'emergency_contact' => [
                    'full_name' => $tenant->emergency_contact_name,
                    'relationship' => $tenant->meta['emergency_relationship'] ?? null,
                    'phone' => $tenant->emergency_contact_phone,
                    'email' => $tenant->emergency_contact_email,
                ],
                'guarantor' => [
                    'name' => $tenant->guarantor_name,
                    'phone' => $tenant->guarantor_phone,
                    'email' => $tenant->guarantor_email,
                    'profession' => $tenant->guarantor_profession,
                    'income' => $tenant->guarantor_income,
                    'monthly_income' => $tenant->guarantor_monthly_income,
                    'address' => $tenant->guarantor_address,
                    'birth_date' => $guarantorBirthDate,
                    'birth_place' => $tenant->guarantor_birth_place,
                ],
                'stats' => $stats,
                'solvency' => [
                    'score' => $tenant->solvency_score,
                    'formatted_score' => $this->getFormattedSolvencyScore($tenant->solvency_score),
                ],
                'meta' => $tenant->meta,
            ];

            return response()->json([
                'success' => true,
                'data' => $profileData
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du profil', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil'
            ], 500);
        }
    }

    /**
     * Mettre à jour les informations personnelles
     */
    public function updatePersonal(Request $request)
    {
        try {
            $user = Auth::user();
            $tenant = Tenant::where('user_id', $user->id)->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil locataire non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'first_name' => 'required|string|max:100',
                'last_name' => 'required|string|max:100',
                'phone' => 'nullable|string|max:20',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string|max:200',
                'marital_status' => 'nullable|string|in:single,married,divorced,widowed,pacsed',
            ], [
                'first_name.required' => 'Le prénom est obligatoire',
                'first_name.max' => 'Le prénom ne doit pas dépasser 100 caractères',
                'last_name.required' => 'Le nom est obligatoire',
                'last_name.max' => 'Le nom ne doit pas dépasser 100 caractères',
                'phone.max' => 'Le téléphone ne doit pas dépasser 20 caractères',
                'birth_date.date' => 'La date de naissance doit être une date valide',
                'birth_place.max' => 'Le lieu de naissance ne doit pas dépasser 200 caractères',
                'marital_status.in' => 'La situation familiale sélectionnée n\'est pas valide',
            ]);

            // Mettre à jour le tenant (sans le champ phone qui n'existe pas dans tenants)
            $tenantData = [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'birth_date' => $validated['birth_date'] ?? $tenant->birth_date,
                'birth_place' => $validated['birth_place'] ?? $tenant->birth_place,
                'marital_status' => $validated['marital_status'] ?? $tenant->marital_status,
            ];

            $tenant->update($tenantData);

            // Mettre à jour le user pour le téléphone (qui est dans users)
            if ($request->has('phone')) {
                $user->update(['phone' => $validated['phone']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Informations personnelles mises à jour avec succès',
                'data' => $tenant
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur updatePersonal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour l'adresse
     */
    public function updateAddress(Request $request)
    {
        try {
            $tenant = Tenant::where('user_id', Auth::id())->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil locataire non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'street' => 'nullable|string|max:255',
                'complement' => 'nullable|string|max:255',
                'zip_code' => 'nullable|string|max:10',
                'city' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
            ], [
                'street.max' => 'L\'adresse ne doit pas dépasser 255 caractères',
                'complement.max' => 'Le complément ne doit pas dépasser 255 caractères',
                'zip_code.max' => 'Le code postal ne doit pas dépasser 10 caractères',
                'city.max' => 'La ville ne doit pas dépasser 100 caractères',
                'country.max' => 'Le pays ne doit pas dépasser 100 caractères',
            ]);

            $updateData = [
                'address' => $validated['street'] ?? $tenant->address,
                'address_complement' => $validated['complement'] ?? $tenant->address_complement,
                'zip_code' => $validated['zip_code'] ?? $tenant->zip_code,
                'city' => $validated['city'] ?? $tenant->city,
                'country' => $validated['country'] ?? $tenant->country,
            ];

            $tenant->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Adresse mise à jour avec succès',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Mettre à jour les informations professionnelles
     */
    public function updateProfessional(Request $request)
    {
        try {
            $tenant = Tenant::where('user_id', Auth::id())->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil locataire non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'profession' => 'nullable|string|max:200',
                'employer' => 'nullable|string|max:200',
                'employer_address' => 'nullable|string|max:255',
                'contract_type' => 'nullable|string|in:cdi,cdd,interim,freelance,retired,unemployed,student',
                'annual_income' => 'nullable|numeric|min:0',
                'monthly_income' => 'nullable|numeric|min:0',
            ], [
                'profession.max' => 'La profession ne doit pas dépasser 200 caractères',
                'employer.max' => 'L\'employeur ne doit pas dépasser 200 caractères',
                'employer_address.max' => 'L\'adresse de l\'employeur ne doit pas dépasser 255 caractères',
                'contract_type.in' => 'Le type de contrat sélectionné n\'est pas valide',
                'annual_income.min' => 'Le revenu annuel ne peut pas être négatif',
                'annual_income.numeric' => 'Le revenu annuel doit être un nombre',
                'monthly_income.min' => 'Le revenu mensuel ne peut pas être négatif',
                'monthly_income.numeric' => 'Le revenu mensuel doit être un nombre',
            ]);

            $tenant->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Informations professionnelles mises à jour avec succès',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Mettre à jour le contact d'urgence
     */
    public function updateEmergency(Request $request)
    {
        try {
            $tenant = Tenant::where('user_id', Auth::id())->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil locataire non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'full_name' => 'nullable|string|max:200',
                'relationship' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:200',
            ], [
                'full_name.max' => 'Le nom ne doit pas dépasser 200 caractères',
                'relationship.max' => 'Le lien de parenté ne doit pas dépasser 100 caractères',
                'phone.max' => 'Le téléphone ne doit pas dépasser 20 caractères',
                'email.email' => 'L\'email doit être une adresse email valide',
                'email.max' => 'L\'email ne doit pas dépasser 200 caractères',
            ]);

            $updateData = [
                'emergency_contact_name' => $validated['full_name'] ?? $tenant->emergency_contact_name,
                'emergency_contact_phone' => $validated['phone'] ?? $tenant->emergency_contact_phone,
                'emergency_contact_email' => $validated['email'] ?? $tenant->emergency_contact_email,
            ];

            // Stocker la relation dans meta si nécessaire
            if ($request->has('relationship')) {
                $meta = $tenant->meta ?? [];
                $meta['emergency_relationship'] = $validated['relationship'];
                $updateData['meta'] = $meta;
            }

            $tenant->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Contact d\'urgence mis à jour avec succès',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Mettre à jour le garant
     */
    public function updateGuarantor(Request $request)
    {
        try {
            $tenant = Tenant::where('user_id', Auth::id())->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil locataire non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'nullable|string|max:200',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:200',
                'profession' => 'nullable|string|max:200',
                'income' => 'nullable|numeric|min:0',
                'monthly_income' => 'nullable|numeric|min:0',
                'address' => 'nullable|string|max:255',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string|max:200',
            ], [
                'name.max' => 'Le nom ne doit pas dépasser 200 caractères',
                'phone.max' => 'Le téléphone ne doit pas dépasser 20 caractères',
                'email.email' => 'L\'email doit être une adresse email valide',
                'email.max' => 'L\'email ne doit pas dépasser 200 caractères',
                'profession.max' => 'La profession ne doit pas dépasser 200 caractères',
                'income.min' => 'Le revenu ne peut pas être négatif',
                'income.numeric' => 'Le revenu doit être un nombre',
                'monthly_income.min' => 'Le revenu mensuel ne peut pas être négatif',
                'monthly_income.numeric' => 'Le revenu mensuel doit être un nombre',
                'address.max' => 'L\'adresse ne doit pas dépasser 255 caractères',
                'birth_date.date' => 'La date de naissance doit être une date valide',
                'birth_place.max' => 'Le lieu de naissance ne doit pas dépasser 200 caractères',
            ]);

            $updateData = [
                'guarantor_name' => $validated['name'] ?? $tenant->guarantor_name,
                'guarantor_phone' => $validated['phone'] ?? $tenant->guarantor_phone,
                'guarantor_email' => $validated['email'] ?? $tenant->guarantor_email,
                'guarantor_profession' => $validated['profession'] ?? $tenant->guarantor_profession,
                'guarantor_income' => $validated['income'] ?? $tenant->guarantor_income,
                'guarantor_monthly_income' => $validated['monthly_income'] ?? $tenant->guarantor_monthly_income,
                'guarantor_address' => $validated['address'] ?? $tenant->guarantor_address,
                'guarantor_birth_date' => $validated['birth_date'] ?? $tenant->guarantor_birth_date,
                'guarantor_birth_place' => $validated['birth_place'] ?? $tenant->guarantor_birth_place,
            ];

            $tenant->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Informations du garant mises à jour avec succès',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques du locataire
     */
    private function getTenantStats($tenant, $user)
    {
        try {
            // Récupérer les baux actifs
            $activeLeases = Lease::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->count();

            // Récupérer les paiements approuvés (payés)
            $paidPayments = Payment::where('tenant_id', $tenant->id)
                ->where('status', 'approved')
                ->count();

            // Montant total payé
            $totalPaidAmount = Payment::where('tenant_id', $tenant->id)
                ->where('status', 'approved')
                ->sum('amount_total');

            // Récupérer les quittances
            $totalReceipts = RentReceipt::where('tenant_id', $tenant->id)->count();

            // Récupérer les notes/messages
            $messages = Note::where('tenant_id', $tenant->id)->count();

            // Première activité
            $firstLease = Lease::where('tenant_id', $tenant->id)
                ->orderBy('start_date', 'asc')
                ->first();

            return [
                'rents_paid' => $paidPayments,
                'total_payments' => $paidPayments,
                'total_paid_amount' => $totalPaidAmount,
                'documents' => $totalReceipts,
                'messages' => $messages,
                'active_leases' => $activeLeases,
                'total_leases' => Lease::where('tenant_id', $tenant->id)->count(),
                'maintenance_requests' => MaintenanceRequest::where('tenant_id', $tenant->id)->count(),
                'open_maintenance_requests' => MaintenanceRequest::where('tenant_id', $tenant->id)
                    ->whereIn('status', ['open', 'in_progress'])
                    ->count(),
                'member_since' => $firstLease ? date('Y', strtotime($firstLease->start_date)) : date('Y', strtotime($user->created_at)),
                'member_date' => $firstLease ? date('Y-m-d', strtotime($firstLease->start_date)) : date('Y-m-d', strtotime($user->created_at)),
                'verified' => $user->email_verified_at !== null,
                'is_active' => $tenant->status === 'active',
                'is_candidate' => $tenant->status === 'candidate',
            ];

        } catch (\Exception $e) {
            Log::error('Erreur stats: ' . $e->getMessage());
            return [
                'rents_paid' => 0,
                'total_payments' => 0,
                'total_paid_amount' => 0,
                'documents' => 0,
                'messages' => 0,
                'active_leases' => 0,
                'total_leases' => 0,
                'maintenance_requests' => 0,
                'open_maintenance_requests' => 0,
                'member_since' => date('Y', strtotime($user->created_at)),
                'member_date' => date('Y-m-d', strtotime($user->created_at)),
                'verified' => $user->email_verified_at !== null,
                'is_active' => false,
                'is_candidate' => false,
            ];
        }
    }

    private function getDefaultNotificationSettings()
    {
        return [
            'email_notifications' => true,
            'sms_notifications' => false,
            'push_notifications' => true,
            'payment_reminders' => true,
            'maintenance_updates' => true,
            'lease_expiry_reminders' => true,
        ];
    }

    private function getFormattedSolvencyScore($score)
    {
        if (!$score) return 'Non évalué';
        if ($score >= 800) return 'Excellent';
        if ($score >= 700) return 'Très bon';
        if ($score >= 600) return 'Bon';
        if ($score >= 500) return 'Moyen';
        return 'Faible';
    }
}
