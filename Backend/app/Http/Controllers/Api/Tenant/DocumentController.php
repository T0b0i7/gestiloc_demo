<?php
// app/Http/Controllers/Api/Tenant/DocumentController.php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Lease;
use App\Models\User;
use App\Models\PropertyDelegation;
use App\Models\ConditionReport;
use App\Mail\DocumentSharedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Validation\ValidationException;

class DocumentController extends Controller
{
    /**
     * Récupérer le locataire connecté
     *
     * @return Tenant|null
     */
    private function getTenant()
    {
        $user = auth()->user();

        if (!$user || !$user->hasRole('tenant')) {
            Log::warning('getTenant: Utilisateur non trouvé ou non locataire', [
                'user_id' => $user ? $user->id : null,
                'has_role' => $user ? $user->hasRole('tenant') : false
            ]);
            return null;
        }

        // Récupérer le tenant via user_id
        $tenant = Tenant::where('user_id', $user->id)->first();

        Log::info('getTenant: Tenant trouvé', [
            'user_id' => $user->id,
            'tenant_id' => $tenant ? $tenant->id : null,
            'tenant_name' => $tenant ? trim($tenant->first_name . ' ' . $tenant->last_name) : null
        ]);

        return $tenant;
    }

    /**
     * GET /api/tenant/documents - Liste des documents
     */
    public function index(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $query = Document::where('tenant_id', $tenant->id)
                ->with(['property', 'lease']);

            // Filtres
            if ($request->has('status')) {
                if ($request->status === 'actifs') {
                    $query->where('status', 'actif');
                } elseif ($request->status === 'archives') {
                    $query->where('status', 'archive');
                }
            } else {
                $query->where('status', '!=', 'archive');
            }

            if ($request->has('category') && $request->category === 'templates') {
                $query->where('category', 'template');
            } else {
                $query->whereNull('category')->orWhere('category', '!=', 'template');
            }

            if ($request->has('type') && !empty($request->type)) {
                $query->where('type', $request->type);
            }

            if ($request->has('property_id') && !empty($request->property_id)) {
                $query->where('property_id', $request->property_id);
            }

            if ($request->has('shared')) {
                $query->where('is_shared', $request->shared === 'true');
            }

            // Recherche
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('bien', 'like', "%{$search}%");
                });
            }

            // Période
            if ($request->has('periode') && !empty($request->periode) && $request->periode !== 'Toutes') {
                $months = [
                    'janvier' => '01', 'février' => '02', 'mars' => '03',
                    'avril' => '04', 'mai' => '05', 'juin' => '06',
                    'juillet' => '07', 'août' => '08', 'septembre' => '09',
                    'octobre' => '10', 'novembre' => '11', 'décembre' => '12'
                ];

                $parts = explode(' ', $request->periode);
                if (count($parts) == 2) {
                    $monthName = strtolower($parts[0]);
                    $year = $parts[1];

                    if (isset($months[$monthName])) {
                        $month = $months[$monthName];
                        $startDate = "{$year}-{$month}-01";
                        $endDate = date('Y-m-t', strtotime($startDate));

                        $query->whereBetween('created_at', [$startDate, $endDate]);
                    }
                }
            }

            $documents = $query->orderBy('created_at', 'desc')
                ->paginate($request->input('per_page', 100));

            // Ajouter les URLs des fichiers et les infos de partage
            $documents->getCollection()->transform(function ($doc) {
                $doc->file_url = $doc->file_url;
                $doc->file_size_formatted = $doc->file_size_formatted;
                $doc->shared_with_users = $doc->shared_with_users;
                $doc->icon = $doc->getFileIcon();
                return $doc;
            });

            return response()->json([
                'success' => true,
                'data' => $documents,
                'total' => $documents->total(),
                'actifs_count' => Document::where('tenant_id', $tenant->id)->where('status', 'actif')->count(),
                'archives_count' => Document::where('tenant_id', $tenant->id)->where('status', 'archive')->count(),
                'templates_count' => Document::where('category', 'template')->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur index documents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des documents'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/leases - Liste des baux du locataire
     */
    public function getLeases(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            Log::info('=== DÉBUT GET LEASES ===', [
                'tenant_id' => $tenant ? $tenant->id : null
            ]);

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            // 1. Requête SQL directe pour vérifier
            $sqlLeases = \DB::select("SELECT * FROM leases WHERE tenant_id = ?", [$tenant->id]);
            Log::info('Résultat requête SQL directe', [
                'sql_count' => count($sqlLeases),
                'sql_results' => $sqlLeases
            ]);

            // 2. Requête Eloquent
            $query = Lease::where('tenant_id', $tenant->id)
                ->with(['property']);

            Log::info('SQL de la requête Eloquent', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            // Filtres
            if ($request->has('property_id') && !empty($request->property_id)) {
                $query->where('property_id', $request->property_id);
            }

            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Recherche
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('property', function($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%")
                             ->orWhere('address', 'like', "%{$search}%");
                    });
                });
            }

            $leases = $query->orderBy('created_at', 'desc')->get();

            Log::info('Résultat Eloquent', [
                'count' => $leases->count(),
                'leases' => $leases->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => $leases,
                'total' => $leases->count(),
                'debug' => [
                    'tenant_id' => $tenant->id,
                    'sql_count' => count($sqlLeases)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getLeases: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des baux'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/condition-reports - Liste des états des lieux du locataire
     */
    public function getConditionReports(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $query = ConditionReport::whereHas('lease', function($q) use ($tenant) {
                    $q->where('tenant_id', $tenant->id);
                })
                ->with(['property', 'lease', 'creator']);

            // Filtres
            if ($request->has('property_id') && !empty($request->property_id)) {
                $query->where('property_id', $request->property_id);
            }

            if ($request->has('type') && !empty($request->type) && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            // Recherche
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('property', function($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%")
                             ->orWhere('address', 'like', "%{$search}%");
                    })
                    ->orWhere('comments', 'like', "%{$search}%");
                });
            }

            $reports = $query->orderBy('created_at', 'desc')->get();

            // Ajouter les URLs des photos
            $reports->each(function($report) {
                $report->photos = $report->getPhotosWithUrls();
            });

            return response()->json([
                'success' => true,
                'data' => $reports,
                'total' => $reports->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getConditionReports: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des états des lieux'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/leases/{uuid}/contract - Télécharger le contrat de bail
     */
    public function downloadLeaseContract($uuid)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $lease = Lease::where('uuid', $uuid)
                ->where('tenant_id', $tenant->id)
                ->with(['property', 'tenant'])
                ->firstOrFail();

            // Vérifier si le bail a un fichier de contrat
            if ($lease->contract_file_path && Storage::disk('public')->exists($lease->contract_file_path)) {
                return Storage::disk('public')->download($lease->contract_file_path, 'contrat_bail_' . ($lease->lease_number ?? $lease->uuid) . '.pdf');
            }

            // Sinon, générer un PDF à partir des données
            $pdf = Pdf::loadView('pdf.lease-contract', [
                'lease' => $lease,
                'tenant' => $tenant,
                'property' => $lease->property,
                'date' => now()->format('d/m/Y')
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true
            ]);

            $filename = 'contrat_bail_' . ($lease->property->name ?? 'bien') . '_' . date('Ymd') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement contrat de bail: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement du contrat'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/condition-reports/{uuid}/download - Télécharger l'état des lieux
     */
    public function downloadConditionReport($uuid)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $report = ConditionReport::where('uuid', $uuid)
                ->whereHas('lease', function($q) use ($tenant) {
                    $q->where('tenant_id', $tenant->id);
                })
                ->with(['property', 'lease', 'creator'])
                ->firstOrFail();

            // Ajouter les URLs des photos
            $report->photos = $report->getPhotosWithUrls();

            // Générer le PDF de l'état des lieux
            $pdf = Pdf::loadView('pdf.condition-report', [
                'report' => $report,
                'tenant' => $tenant,
                'property' => $report->property,
                'date' => now()->format('d/m/Y')
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true
            ]);

            $type = $report->type === 'entry' ? 'entree' : 'sortie';
            $filename = 'etat_des_lieux_' . $type . '_' . ($report->property->name ?? 'bien') . '_' . date('Ymd') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement état des lieux: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement de l\'état des lieux'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/documents/templates - Liste des templates
     */
    public function templates(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $templates = Document::where('category', 'template')
                ->orderBy('name')
                ->get()
                ->map(function ($template) {
                    return [
                        'id' => $template->id,
                        'name' => $template->name,
                        'description' => $template->description,
                        'type' => $template->type,
                        'file_url' => $template->file_url,
                        'icon' => $template->getFileIcon(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $templates
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur templates documents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des templates'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/documents/shareable-contacts - Contacts partageables
     */
    public function getShareableContacts(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $propertyId = $request->property_id;

            if (!$propertyId) {
                return response()->json([]);
            }

            $property = Property::find($propertyId);

            if (!$property) {
                return response()->json([]);
            }

            $activeLease = Lease::where('tenant_id', $tenant->id)
                ->where('property_id', $propertyId)
                ->where('status', 'active')
                ->first();

            if (!$activeLease) {
                return response()->json([]);
            }

            $contacts = [];
            $processedIds = [];

            // 1. LE CRÉATEUR DU BIEN
            if ($property->user_id) {
                $creatorUser = User::with('landlord', 'coOwner')->find($property->user_id);

                if ($creatorUser) {
                    $creatorName = '';
                    $creatorRole = '';

                    if ($creatorUser->isLandlord() && $creatorUser->landlord) {
                        $creatorName = ($creatorUser->landlord->first_name ?? '') . ' ' . ($creatorUser->landlord->last_name ?? '');
                        $creatorRole = 'Propriétaire (créateur)';
                    } elseif ($creatorUser->isCoOwner() && $creatorUser->coOwner) {
                        $creatorName = ($creatorUser->coOwner->first_name ?? '') . ' ' . ($creatorUser->coOwner->last_name ?? '');
                        $creatorRole = $creatorUser->coOwner->co_owner_type === 'agency' ? 'Agence (créateur)' : 'Copropriétaire (créateur)';
                    }

                    if (!empty($creatorName) && trim($creatorName) !== ' ') {
                        $contacts[] = [
                            'id' => $creatorUser->id,
                            'name' => trim($creatorName),
                            'email' => $creatorUser->email,
                            'role' => $creatorRole,
                            'type' => 'creator',
                        ];
                        $processedIds[] = $creatorUser->id;
                    }
                }
            }

            // 2. COPROPRIÉTAIRES
            $delegations = PropertyDelegation::where('property_id', $propertyId)
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
                    $name = ($delegation->coOwner->first_name ?? '') . ' ' . ($delegation->coOwner->last_name ?? '');

                    if (!empty(trim($name))) {
                        $contacts[] = [
                            'id' => $coOwnerUser->id,
                            'name' => trim($name),
                            'email' => $coOwnerUser->email,
                            'role' => $role,
                            'type' => 'co_owner',
                        ];

                        $processedIds[] = $coOwnerUser->id;
                    }
                }
            }

            return response()->json($contacts);

        } catch (\Exception $e) {
            Log::error('Erreur getShareableContacts documents: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * GET /api/tenant/documents/{id} - Détail d'un document
     */
    public function show($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $document = Document::where('tenant_id', $tenant->id)
                ->with(['property', 'lease'])
                ->findOrFail($id);

            $document->file_url = $document->file_url;
            $document->file_size_formatted = $document->file_size_formatted;
            $document->shared_with_users = $document->shared_with_users;
            $document->icon = $document->getFileIcon();

            return response()->json([
                'success' => true,
                'data' => $document
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur show document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Document non trouvé'
            ], 404);
        }
    }

    /**
     * POST /api/tenant/documents - Créer un document
     */
    public function store(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'type' => 'required|string|in:acte_vente,bail,quittance,dpe,diagnostic,etat_des_lieux,contrat_bail,autre',
                'bien' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'property_id' => 'nullable|exists:properties,id',
                'lease_id' => 'nullable|exists:leases,id',
                'is_shared' => 'nullable|in:true,false,1,0',
                'shared_with' => 'nullable|array',
                'shared_with.*' => 'exists:users,id',
                'shared_with_emails' => 'nullable|array',
                'shared_with_emails.*' => 'email',
                'document_date' => 'nullable|date',
                'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif|max:15360',
            ]);

            // Upload du fichier
            $file = $request->file('file');
            $path = $file->store('documents/' . $tenant->id, 'public');
            $fileSize = $file->getSize();
            $fileType = $file->getMimeType();

            $document = Document::create([
                'uuid' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'property_id' => $validated['property_id'] ?? null,
                'lease_id' => $validated['lease_id'] ?? null,
                'created_by' => auth()->id(),
                'name' => $validated['name'] ?? $file->getClientOriginalName(),
                'type' => $validated['type'],
                'bien' => $validated['bien'] ?? null,
                'description' => $validated['description'] ?? null,
                'file_path' => $path,
                'file_size' => $fileSize,
                'file_type' => $fileType,
                'is_shared' => filter_var($validated['is_shared'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'shared_with' => $validated['shared_with'] ?? [],
                'shared_with_emails' => $validated['shared_with_emails'] ?? [],
                'status' => 'actif',
                'document_date' => $validated['document_date'] ?? null,
            ]);

            // Envoyer les emails si le document est partagé
            if ($document->is_shared && (!empty($document->shared_with) || !empty($document->shared_with_emails))) {
                $this->sendShareEmails($document);
            }

            Log::info('Document créé', [
                'document_id' => $document->id,
                'tenant_id' => $tenant->id
            ]);

            $document->load(['property', 'lease']);
            $document->file_url = $document->file_url;
            $document->file_size_formatted = $document->file_size_formatted;

            return response()->json([
                'success' => true,
                'message' => 'Document ajouté avec succès',
                'data' => $document
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur création document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du document'
            ], 500);
        }
    }

    /**
     * PUT /api/tenant/documents/{id} - Mettre à jour un document
     */
    public function update(Request $request, $id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $document = Document::where('tenant_id', $tenant->id)->findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'type' => 'sometimes|string|in:acte_vente,bail,quittance,dpe,diagnostic,etat_des_lieux,contrat_bail,autre',
                'bien' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'property_id' => 'nullable|exists:properties,id',
                'lease_id' => 'nullable|exists:leases,id',
                'is_shared' => 'sometimes|boolean',
                'shared_with' => 'nullable|array',
                'shared_with.*' => 'exists:users,id',
                'shared_with_emails' => 'nullable|array',
                'shared_with_emails.*' => 'email',
                'status' => 'sometimes|string|in:actif,archive',
            ]);

            $oldSharedWith = $document->shared_with;
            $document->update($validated);

            // Envoyer les emails si le partage a changé
            if ($document->is_shared &&
                (!empty($document->shared_with) && $document->shared_with != $oldSharedWith)) {
                $this->sendShareEmails($document);
            }

            $document->load(['property', 'lease']);
            $document->file_url = $document->file_url;
            $document->file_size_formatted = $document->file_size_formatted;

            return response()->json([
                'success' => true,
                'message' => 'Document mis à jour avec succès',
                'data' => $document
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * DELETE /api/tenant/documents/{id} - Supprimer un document
     */
    public function destroy($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $document = Document::where('tenant_id', $tenant->id)->findOrFail($id);

            // Supprimer le fichier
            Storage::disk('public')->delete($document->file_path);

            $document->delete();

            Log::info('Document supprimé', [
                'document_id' => $id,
                'tenant_id' => $tenant->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * POST /api/tenant/documents/{id}/archive - Archiver un document
     */
    public function archive($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $document = Document::where('tenant_id', $tenant->id)->findOrFail($id);
            $document->update(['status' => 'archive']);

            return response()->json([
                'success' => true,
                'message' => 'Document archivé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur archivage document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'archivage'
            ], 500);
        }
    }

    /**
     * POST /api/tenant/documents/{id}/restore - Restaurer un document
     */
    public function restore($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $document = Document::where('tenant_id', $tenant->id)->findOrFail($id);
            $document->update(['status' => 'actif']);

            return response()->json([
                'success' => true,
                'message' => 'Document restauré avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur restauration document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la restauration'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/documents/{id}/download - Télécharger un document
     */
    public function download($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $document = Document::where('tenant_id', $tenant->id)->findOrFail($id);

            if (!Storage::disk('public')->exists($document->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier non trouvé'
                ], 404);
            }

            $file = Storage::disk('public')->get($document->file_path);
            $mimeType = Storage::disk('public')->mimeType($document->file_path);
            $size = Storage::disk('public')->size($document->file_path);

            return response($file, 200)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'attachment; filename="' . $document->name . '"')
                ->header('Content-Length', $size)
                ->header('Cache-Control', 'private, no-transform, must-revalidate')
                ->header('Access-Control-Expose-Headers', 'Content-Disposition');

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement'
            ], 500);
        }
    }

    /**
     * GET /api/tenant/documents/{id}/pdf - Télécharger le document en PDF avec ses informations
     */
    public function downloadPdf($id)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            $document = Document::where('tenant_id', $tenant->id)
                ->with(['property', 'lease'])
                ->findOrFail($id);

            if (!Storage::disk('public')->exists($document->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier non trouvé'
                ], 404);
            }

            // Charger la vue PDF
            $pdf = Pdf::loadView('pdf.document', [
                'document' => $document,
                'tenant' => $tenant,
                'date' => now()->format('d/m/Y H:i')
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true
            ]);

            $filename = 'document_' . $document->id . '_' . date('Ymd') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement PDF document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement'
            ], 500);
        }
    }

    /**
     * Envoyer les emails de partage
     */
    private function sendShareEmails(Document $document)
    {
        try {
            $users = User::whereIn('id', $document->shared_with ?? [])->get();
            $tenant = auth()->user()->tenant;
            $frontendUrl = config('app.frontend_url', 'http://localhost:8080');

            foreach ($users as $user) {
                try {
                    Mail::to($user->email)->queue(new DocumentSharedMail($document, $tenant, $user, null, $frontendUrl));
                    Log::info('Email envoyé à', ['email' => $user->email]);
                } catch (\Exception $e) {
                    Log::error('Erreur envoi email à ' . $user->email . ': ' . $e->getMessage());
                }
            }

            foreach ($document->shared_with_emails ?? [] as $email) {
                try {
                    Mail::to($email)->queue(new DocumentSharedMail($document, $tenant, null, $email, $frontendUrl));
                    Log::info('Email externe envoyé à', ['email' => $email]);
                } catch (\Exception $e) {
                    Log::error('Erreur envoi email externe à ' . $email . ': ' . $e->getMessage());
                }
            }

            Log::info('Emails de partage envoyés', [
                'document_id' => $document->id,
                'recipients' => $document->shared_with,
                'external_recipients' => $document->shared_with_emails
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur envoi emails partage: ' . $e->getMessage());
        }
    }

    /**
     * GET /api/tenant/documents/filters/options - Options pour les filtres
     */
    public function getFilterOptions()
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            // Récupérer les biens du locataire
            $properties = Property::whereHas('leases', function($q) use ($tenant) {
                $q->where('tenant_id', $tenant->id);
            })->get(['id', 'name']);

            // Récupérer les types de documents distincts
            $types = Document::where('tenant_id', $tenant->id)
                ->whereNotNull('type')
                ->distinct()
                ->pluck('type');

            // Types de baux
            $leaseTypes = ['residential', 'commercial', 'professional', 'furnished', 'empty'];

            // Types d'états des lieux
            $reportTypes = ['entry', 'exit'];

            // Générer les options de période (6 derniers mois)
            $periodes = ['Toutes'];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $periodes[] = $date->translatedFormat('F Y');
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $properties,
                    'types' => $types,
                    'periodes' => $periodes,
                    'lease_types' => $leaseTypes,
                    'report_types' => $reportTypes,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getFilterOptions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des options'
            ], 500);
        }
    }
}
