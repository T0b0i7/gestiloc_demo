<?php
// app/Http/Controllers/Api/Tenant/DossierController.php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\Tenant;
use App\Models\User;
use App\Models\PropertyDelegation;
use App\Mail\DossierSharedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DossierController extends Controller
{
    private function getTenant()
    {
        $user = auth()->user();

        if (!$user || !$user->hasRole('tenant')) {
            return null;
        }

        return $user->tenant;
    }

    /**
     * GET /api/tenant/dossier - Récupérer le dossier du locataire
     */
    public function show(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $dossier = Dossier::where('tenant_id', $tenant->id)->first();

            if (!$dossier) {
                // Créer un dossier vide si inexistant
                $dossier = Dossier::create([
                    'uuid' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'created_by' => auth()->id(),
                    'nom' => $tenant->last_name ?? '',
                    'prenoms' => $tenant->first_name ?? '',
                    'email' => auth()->user()->email,
                    'telephone' => $tenant->phone ?? auth()->user()->phone,
                    'mobile' => $tenant->phone ?? auth()->user()->phone,
                    'status' => 'brouillon',
                ]);
            }

            $dossier->shared_with_users = $dossier->shared_with_users;

            return response()->json([
                'success' => true,
                'data' => $dossier
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur show dossier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement du dossier'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/dossier - Mettre à jour le dossier
     */
    public function update(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $dossier = Dossier::where('tenant_id', $tenant->id)->first();

            if (!$dossier) {
                $dossier = new Dossier();
                $dossier->tenant_id = $tenant->id;
                $dossier->created_by = auth()->id();
                $dossier->uuid = Str::uuid();
            }

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenoms' => 'required|string|max:255',
                'date_naissance' => 'nullable|date',
                'a_propos' => 'nullable|string',
                'email' => 'required|email|max:255',
                'telephone' => 'nullable|string|max:20',
                'mobile' => 'nullable|string|max:20',
                'adresse' => 'nullable|string|max:255',
                'ville' => 'nullable|string|max:100',
                'pays' => 'nullable|string|max:100',
                'region' => 'nullable|string|max:100',
                'type_activite' => 'nullable|string|max:100',
                'profession' => 'nullable|string|max:200',
                'revenus_mensuels' => 'nullable|numeric|min:0',
                'has_garant' => 'boolean',
                'garant_type' => 'nullable|string|max:100',
                'garant_description' => 'nullable|string',
                'documents' => 'nullable|array',
                'documents.*' => 'exists:documents,id',
                'is_shared' => 'boolean',
                'shared_with' => 'nullable|array',
                'shared_with.*' => 'exists:users,id',
                'shared_with_emails' => 'nullable|array',
                'shared_with_emails.*' => 'email',
                'status' => 'sometimes|string|in:brouillon,publie,archive',
            ], [
                'nom.required' => 'Le nom est obligatoire',
                'prenoms.required' => 'Les prénoms sont obligatoires',
                'email.required' => 'L\'email est obligatoire',
                'email.email' => 'L\'email doit être valide',
            ]);

            $oldSharedWith = $dossier->shared_with;
            $dossier->fill($validated);
            $dossier->save();

            // Envoyer les emails si le partage a changé
            if ($dossier->is_shared &&
                (!empty($dossier->shared_with) && $dossier->shared_with != $oldSharedWith)) {
                $this->sendShareEmails($dossier);
            }

            $dossier->shared_with_users = $dossier->shared_with_users;

            return response()->json([
                'success' => true,
                'message' => 'Dossier mis à jour avec succès',
                'data' => $dossier
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour dossier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du dossier'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/dossier/shareable-contacts - Contacts partageables pour le dossier
     */
    public function getShareableContacts(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            // Récupérer tous les biens du locataire
            $properties = $tenant->properties()->get();

            $contacts = [];
            $processedIds = [];

            foreach ($properties as $property) {
                // 1. LE CRÉATEUR DU BIEN
                if ($property->user_id && !in_array($property->user_id, $processedIds)) {
                    $creatorUser = User::with('landlord', 'coOwner')->find($property->user_id);

                    if ($creatorUser) {
                        $creatorName = '';
                        $creatorRole = '';

                        if ($creatorUser->isLandlord() && $creatorUser->landlord) {
                            $creatorName = $creatorUser->landlord->first_name . ' ' . $creatorUser->landlord->last_name;
                            $creatorRole = 'Propriétaire';
                        } elseif ($creatorUser->isCoOwner() && $creatorUser->coOwner) {
                            $creatorName = $creatorUser->coOwner->first_name . ' ' . $creatorUser->coOwner->last_name;
                            $creatorRole = $creatorUser->coOwner->co_owner_type === 'agency' ? 'Agence' : 'Copropriétaire';
                        }

                        if (!empty($creatorName)) {
                            $contacts[] = [
                                'id' => $creatorUser->id,
                                'name' => $creatorName,
                                'email' => $creatorUser->email,
                                'role' => $creatorRole,
                                'type' => 'creator',
                                'property' => $property->name,
                            ];
                            $processedIds[] = $creatorUser->id;
                        }
                    }
                }

                // 2. COPROPRIÉTAIRES
                $delegations = PropertyDelegation::where('property_id', $property->id)
                    ->where('status', 'active')
                    ->with(['coOwner.user'])
                    ->get();

                foreach ($delegations as $delegation) {
                    if ($delegation->coOwner && $delegation->coOwner->user) {
                        $coOwnerUser = $delegation->coOwner->user;

                        if (in_array($coOwnerUser->id, $processedIds)) {
                            continue;
                        }

                        $role = $delegation->co_owner_type === 'agency' ? 'Agence' : 'Copropriétaire';

                        $contacts[] = [
                            'id' => $coOwnerUser->id,
                            'name' => $delegation->coOwner->first_name . ' ' . $delegation->coOwner->last_name,
                            'email' => $coOwnerUser->email,
                            'role' => $role,
                            'type' => 'co_owner',
                            'property' => $property->name,
                        ];

                        $processedIds[] = $coOwnerUser->id;
                    }
                }
            }

            return response()->json($contacts);

        } catch (\Exception $e) {
            Log::error('Erreur getShareableContacts dossier: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * POST /api/tenant/dossier/publish - Publier le dossier
     */
    public function publish(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $dossier = Dossier::where('tenant_id', $tenant->id)->first();

            if (!$dossier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun dossier trouvé'
                ], 404);
            }

            $dossier->update([
                'status' => 'publie',
                'share_url' => Str::random(32),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dossier publié avec succès',
                'data' => [
                    'share_url' => $dossier->shareable_url,
                    'status' => $dossier->status,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur publication dossier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la publication'
            ], 500);
        }
    }

    /**
     * Envoyer les emails de partage
     */
    private function sendShareEmails(Dossier $dossier)
    {
        try {
            $users = User::whereIn('id', $dossier->shared_with ?? [])->get();
            $tenant = auth()->user()->tenant;

            foreach ($users as $user) {
                Mail::to($user->email)->queue(new DossierSharedMail($dossier, $tenant, $user));
            }

            foreach ($dossier->shared_with_emails ?? [] as $email) {
                Mail::to($email)->queue(new DossierSharedMail($dossier, $tenant, null, $email));
            }

            Log::info('Emails de partage dossier envoyés', [
                'dossier_id' => $dossier->id,
                'recipients' => $dossier->shared_with,
                'external_recipients' => $dossier->shared_with_emails
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur envoi emails partage dossier: ' . $e->getMessage());
        }
    }

    /**
     * GET /api/tenant/dossier/preview - Prévisualisation du dossier
     */
    public function preview(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $dossier = Dossier::where('tenant_id', $tenant->id)->first();

            if (!$dossier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun dossier trouvé'
                ], 404);
            }

            // Charger les documents associés
            $documents = [];
            if (!empty($dossier->documents)) {
                $documents = \App\Models\Document::whereIn('id', $dossier->documents)
                    ->get()
                    ->map(function ($doc) {
                        return [
                            'id' => $doc->id,
                            'name' => $doc->name,
                            'type' => $doc->type,
                            'file_url' => $doc->file_url,
                            'icon' => $doc->getFileIcon(),
                        ];
                    });
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'dossier' => $dossier,
                    'documents' => $documents,
                    'share_url' => $dossier->shareable_url,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur preview dossier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la prévisualisation'
            ], 500);
        }
    }
}
