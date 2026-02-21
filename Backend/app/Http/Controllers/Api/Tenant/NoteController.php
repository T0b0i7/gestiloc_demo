<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Property;
use App\Models\Lease;
use App\Models\User;
use App\Models\PropertyDelegation;
use App\Mail\NoteSharedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NoteController extends Controller
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
     * GET /api/tenant/notes - Liste des notes
     */
    public function index(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $query = Note::where('tenant_id', $tenant->id)
                ->with(['property', 'lease']);

            // Filtres
            if ($request->has('property_id')) {
                $query->where('property_id', $request->property_id);
            }

            if ($request->has('shared')) {
                $query->where('is_shared', $request->shared === 'true');
            }

            // Recherche
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }

            $notes = $query->orderBy('created_at', 'desc')->get();

            // Ajouter les URLs des fichiers et les infos de partage
            $notes->each(function ($note) {
                $note->file_urls = $note->file_urls;
                $note->shared_with_users = $note->shared_with_users;
            });

            return response()->json($notes);

        } catch (\Exception $e) {
            Log::error('Erreur index notes: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du chargement des notes'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/notes/{id} - Détail d'une note
     */
    public function show($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $note = Note::where('tenant_id', $tenant->id)
                ->with(['property', 'lease'])
                ->findOrFail($id);

            $note->file_urls = $note->file_urls;
            $note->shared_with_users = $note->shared_with_users;

            return response()->json($note);

        } catch (\Exception $e) {
            Log::error('Erreur show note: ' . $e->getMessage());
            return response()->json([
                'message' => 'Note non trouvée'
            ], 404);
        }
    }

/**
 * GET /api/tenant/shareable-contacts - Liste des contacts partageables
 * (uniquement ceux qui ont un lien actif avec le bien)
 */
public function getShareableContacts(Request $request)
{
    try {
        $tenant = $this->getTenant();

        if (!$tenant) {
            return response()->json(['message' => 'Accès réservé aux locataires'], 403);
        }

        $propertyId = $request->property_id;

        if (!$propertyId) {
            return response()->json([]);
        }

        // Récupérer la propriété
        $property = Property::find($propertyId);

        if (!$property) {
            return response()->json([]);
        }

        // Récupérer le bail actif du locataire pour ce bien
        $activeLease = Lease::where('tenant_id', $tenant->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$activeLease) {
            return response()->json([]);
        }

        $contacts = [];
        $processedIds = [];

        // ============================================
        // 1. LE CRÉATEUR DU BIEN (user_id dans properties)
        // ============================================
        if ($property->user_id) {
            $creatorUser = User::with('landlord', 'coOwner')->find($property->user_id);

            if ($creatorUser) {
                $creatorName = '';
                $creatorRole = '';

                if ($creatorUser->isLandlord() && $creatorUser->landlord) {
                    $creatorName = $creatorUser->landlord->first_name . ' ' . $creatorUser->landlord->last_name;
                    $creatorRole = 'Propriétaire (créateur)';
                } elseif ($creatorUser->isCoOwner() && $creatorUser->coOwner) {
                    $creatorName = $creatorUser->coOwner->first_name . ' ' . $creatorUser->coOwner->last_name;
                    $creatorRole = $creatorUser->coOwner->co_owner_type === 'agency' ? 'Agence (créateur)' : 'Copropriétaire (créateur)';
                }

                if (!empty($creatorName)) {
                    $contacts[] = [
                        'id' => $creatorUser->id,
                        'name' => $creatorName,
                        'email' => $creatorUser->email,
                        'role' => $creatorRole,
                        'type' => 'creator',
                    ];
                    $processedIds[] = $creatorUser->id;
                }
            }
        }

        // ============================================
        // 2. COPROPRIÉTAIRES (délégations actives)
        // MAINTENANT on filtre pour n'avoir QUE les co_owners
        // ============================================
        $delegations = PropertyDelegation::where('property_id', $propertyId)
            ->where('status', 'active')
            ->with(['coOwner.user'])
            ->get();

        foreach ($delegations as $delegation) {
            if ($delegation->coOwner && $delegation->coOwner->user) {
                $coOwnerUser = $delegation->coOwner->user;

                // Éviter les doublons
                if (in_array($coOwnerUser->id, $processedIds)) {
                    continue;
                }

                // Vérifier que c'est bien un co_owner (pas le landlord)
                if ($coOwnerUser->id != $property->landlord_id) {
                    $role = $delegation->co_owner_type === 'agency' ? 'Agence' : 'Copropriétaire';

                    $contacts[] = [
                        'id' => $coOwnerUser->id,
                        'name' => $delegation->coOwner->first_name . ' ' . $delegation->coOwner->last_name,
                        'email' => $coOwnerUser->email,
                        'role' => $role,
                        'type' => 'co_owner',
                    ];

                    $processedIds[] = $coOwnerUser->id;
                }
            }
        }

        // ============================================
        // 3. LE PROPRIÉTAIRE FONCIER (landlord_id du bien)
        // MAIS SEULEMENT s'il a une délégation active où il est co_owner
        // ============================================
        if ($property->landlord_id && !in_array($property->landlord_id, $processedIds)) {
            // Vérifier si ce propriétaire a une délégation active EN TANT QUE co_owner
            $hasActiveDelegationAsCoOwner = PropertyDelegation::where('property_id', $propertyId)
                ->where('status', 'active')
                ->whereHas('coOwner', function($q) use ($property) {
                    $q->where('user_id', $property->landlord_id);
                })
                ->exists();

            // Si c'est le créateur, on l'a déjà ajouté plus haut
            // Si c'est le propriétaire foncier mais qu'il n'est pas co_owner actif, on ne l'ajoute PAS
            if ($hasActiveDelegationAsCoOwner) {
                $landlordUser = User::with('landlord')->find($property->landlord_id);

                if ($landlordUser && $landlordUser->landlord) {
                    $contacts[] = [
                        'id' => $landlordUser->id,
                        'name' => $landlordUser->landlord->first_name . ' ' . $landlordUser->landlord->last_name,
                        'email' => $landlordUser->email,
                        'role' => 'Propriétaire',
                        'type' => 'landlord',
                    ];
                    $processedIds[] = $landlordUser->id;
                }
            }
        }

        return response()->json($contacts);

    } catch (\Exception $e) {
        Log::error('Erreur getShareableContacts: ' . $e->getMessage());
        return response()->json([], 500);
    }
}

    /**
     * POST /api/tenant/notes - Créer une note
     */
    public function store(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            // Validation avec conversion du champ is_shared
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'nullable|string',
                'property_id' => 'nullable|exists:properties,id',
                'lease_id' => 'nullable|exists:leases,id',
                'is_shared' => 'required|boolean',
                'shared_with' => 'nullable|array',
                'shared_with.*' => 'exists:users,id',
                'files' => 'nullable|array',
                'files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif|max:15360', // 15MB max
            ]);

            // Upload des fichiers
            $uploadedFiles = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('notes/' . $tenant->id, 'public');
                    $uploadedFiles[] = $path;
                }
            }

            $note = Note::create([
                'uuid' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'property_id' => $validated['property_id'] ?? null,
                'lease_id' => $validated['lease_id'] ?? null,
                'created_by' => auth()->id(),
                'title' => $validated['title'],
                'content' => $validated['content'] ?? null,
                'is_shared' => $validated['is_shared'],
                'shared_with' => $validated['shared_with'] ?? [],
                'files' => $uploadedFiles,
            ]);

            // Envoyer les emails si la note est partagée
            if ($note->is_shared && !empty($note->shared_with)) {
                $this->sendShareEmails($note);
            }

            Log::info('Note créée', [
                'note_id' => $note->id,
                'tenant_id' => $tenant->id
            ]);

            // Recharger la note avec les relations
            $note->load(['property', 'lease']);
            $note->file_urls = $note->file_urls;
            $note->shared_with_users = $note->shared_with_users;

            return response()->json($note, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur validation note: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur création note: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la création de la note'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/notes/{id} - Mettre à jour une note
     */
    public function update(Request $request, $id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $note = Note::where('tenant_id', $tenant->id)->findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'content' => 'nullable|string',
                'property_id' => 'nullable|exists:properties,id',
                'lease_id' => 'nullable|exists:leases,id',
                'is_shared' => 'sometimes|boolean',
                'shared_with' => 'nullable|array',
                'shared_with.*' => 'exists:users,id',
            ]);

            $oldSharedWith = $note->shared_with;
            $note->update($validated);

            // Envoyer les emails si le partage a changé
            if ($note->is_shared &&
                (!empty($note->shared_with) && $note->shared_with != $oldSharedWith)) {
                $this->sendShareEmails($note);
            }

            // Recharger la note avec les relations
            $note->load(['property', 'lease']);
            $note->file_urls = $note->file_urls;
            $note->shared_with_users = $note->shared_with_users;

            return response()->json($note);

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour note: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * DELETE /api/tenant/notes/{id} - Supprimer une note
     */
    public function destroy($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $note = Note::where('tenant_id', $tenant->id)->findOrFail($id);

            // Supprimer les fichiers
            if ($note->files) {
                foreach ($note->files as $file) {
                    Storage::disk('public')->delete($file);
                }
            }

            $note->delete();

            Log::info('Note supprimée', [
                'note_id' => $id,
                'tenant_id' => $tenant->id
            ]);

            return response()->json(['message' => 'Note supprimée avec succès']);

        } catch (\Exception $e) {
            Log::error('Erreur suppression note: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Envoyer les emails de partage
     */
    private function sendShareEmails(Note $note)
    {
        try {
            $users = User::whereIn('id', $note->shared_with)->get();
            $tenant = auth()->user()->tenant;

            foreach ($users as $user) {
                Mail::to($user->email)->send(new NoteSharedMail($note, $tenant, $user));
            }

            Log::info('Emails de partage envoyés', [
                'note_id' => $note->id,
                'recipients' => $note->shared_with
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur envoi emails partage: ' . $e->getMessage());
        }
    }

    /**
     * POST /api/tenant/notes/{id}/add-files - Ajouter des fichiers
     */
    public function addFiles(Request $request, $id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $note = Note::where('tenant_id', $tenant->id)->findOrFail($id);

            $request->validate([
                'files' => 'required|array',
                'files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif|max:15360',
            ]);

            $uploadedFiles = $note->files ?? [];

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('notes/' . $tenant->id, 'public');
                    $uploadedFiles[] = $path;
                }
            }

            $note->update(['files' => $uploadedFiles]);

            return response()->json([
                'message' => 'Fichiers ajoutés avec succès',
                'files' => $note->file_urls
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur ajout fichiers: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de l\'ajout des fichiers'
            ], 500);
        }
    }

    /**
     * DELETE /api/tenant/notes/{id}/files - Supprimer un fichier
     */
    public function deleteFile(Request $request, $id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $note = Note::where('tenant_id', $tenant->id)->findOrFail($id);

            $request->validate([
                'file_path' => 'required|string',
            ]);

            $files = $note->files ?? [];
            $key = array_search($request->file_path, $files);

            if ($key !== false) {
                Storage::disk('public')->delete($request->file_path);
                unset($files[$key]);
                $note->update(['files' => array_values($files)]);
            }

            return response()->json([
                'message' => 'Fichier supprimé avec succès',
                'files' => $note->file_urls
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression fichier: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression du fichier'
            ], 500);
        }
    }
}
