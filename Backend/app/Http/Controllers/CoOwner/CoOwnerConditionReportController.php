<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyConditionReport;
use App\Models\PropertyConditionPhoto;
use App\Models\PropertyDelegation;
use App\Models\CoOwner;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;

class CoOwnerConditionReportController extends Controller
{
    /**
     * Affiche la liste des états des lieux
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        // Récupérer les biens délégués ACTIFS
        $propertyIds = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les biens pour le filtre
        $properties = Property::whereIn('id', $propertyIds)->get();

        if ($propertyIds->isEmpty()) {
            $reports = new LengthAwarePaginator([], 0, 15, null, ['path' => request()->url()]);

            return view('co-owner.condition-reports.index', [
                'reports' => $reports,
                'properties' => $properties,
                'noProperties' => true
            ]);
        }

        // Query de base
        $query = PropertyConditionReport::whereIn('property_id', $propertyIds)
            ->with(['photos', 'lease.tenant', 'creator', 'property']);

        // Filtre par type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filtre par bien
        if ($request->filled('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('lease.tenant', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%");
                })->orWhereHas('property', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%");
                });
            });
        }

        $reports = $query->latest('report_date')->paginate(15);

        // Transformer les rapports
        $formattedReports = $reports->map(function($report) {
            return (object) [
                'id' => $report->id,
                'type' => $report->type,
                'tenant_name' => $report->lease->tenant->full_name ?? 'N/A',
                'property_name' => $report->property->name ?? 'Bien #' . $report->property_id,
                'report_date' => $report->report_date,
                'general_condition' => $this->getGeneralCondition($report),
                'is_signed' => !is_null($report->signed_at),
                'photos_count' => $report->photos->count(),
                'created_at' => $report->created_at,
            ];
        });

        $reports->setCollection($formattedReports);

        return view('co-owner.condition-reports.index', compact('reports', 'properties'));
    }

    /**
     * Détermine l'état général basé sur les photos
     */
    private function getGeneralCondition($report)
    {
        $photos = $report->photos;

        if ($photos->isEmpty()) {
            return 'Non évalué';
        }

        $statuses = $photos->pluck('condition_status');

        $goodCount = $statuses->filter(fn($s) => $s === 'good')->count();
        $satisfactoryCount = $statuses->filter(fn($s) => $s === 'satisfactory')->count();
        $poorCount = $statuses->filter(fn($s) => $s === 'poor')->count();
        $damagedCount = $statuses->filter(fn($s) => $s === 'damaged')->count();

        $total = $photos->count();

        if ($damagedCount > 0) {
            return 'Mauvais';
        } elseif ($poorCount > $total * 0.3) {
            return 'Passable';
        } elseif ($goodCount >= $total * 0.7) {
            return 'Excellent';
        } elseif ($goodCount + $satisfactoryCount >= $total * 0.7) {
            return 'Très bon';
        } else {
            return 'Bon';
        }
    }

    /**
     * Affiche le formulaire de création
     */
    public function create()
    {
        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        // Récupérer les biens délégués ACTIFS
        $propertyIds = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('status', 'active')
            ->pluck('property_id');

        if ($propertyIds->isEmpty()) {
            return redirect()->route('co-owner.condition-reports.index')
                ->with('error', 'Aucun bien délégué. Vous ne pouvez pas créer d\'état des lieux.');
        }

        // Récupérer les biens avec leurs baux ACTIFS et locataires
        $properties = Property::whereIn('id', $propertyIds)
            ->with(['leases' => function($query) {
                $query->where('status', 'active')
                      ->with('tenant');
            }])
            ->get();

        // Debug: Vérifier les données
        // dd($properties->toArray());

        return view('co-owner.condition-reports.create', compact('properties'));
    }

    /**
     * Enregistre un nouvel état des lieux
     */
    public function store(Request $request)
    {
        try {
            // Validation
            $validated = $request->validate([
                'property_id'   => 'required|exists:properties,id',
                'lease_id'      => 'required|exists:leases,id',
                'type'          => 'required|in:entry,exit,intermediate',
                'report_date'   => 'required|date',
                'notes'         => 'nullable|string',
                'photos'        => 'required|array|min:1',
                'photos.*'      => 'image|max:10240',
                'condition_statuses' => 'nullable|array',
                'condition_statuses.*' => 'nullable|in:good,satisfactory,poor,damaged',
                'condition_notes' => 'nullable|array',
                'condition_notes.*' => 'nullable|string|max:500',
            ]);

            $user = Auth::user();
            $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

            if (!$coOwnerProfile) {
                return redirect()->back()
                    ->with('error', 'Vous n\'avez pas de profil copropriétaire.')
                    ->withInput();
            }

            // Vérifier l'accès au bien
            $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
                ->where('property_id', $validated['property_id'])
                ->where('status', 'active')
                ->exists();

            if (!$hasAccess) {
                return redirect()->back()
                    ->with('error', 'Vous n\'avez pas accès à ce bien.')
                    ->withInput();
            }

            // Vérifier que le bail appartient au bien
            $leaseBelongs = Lease::where('id', $validated['lease_id'])
                ->where('property_id', $validated['property_id'])
                ->exists();

            if (!$leaseBelongs) {
                return redirect()->back()
                    ->with('error', 'Le bail sélectionné ne correspond pas au bien.')
                    ->withInput();
            }

            // Créer l'état des lieux dans une transaction
            DB::beginTransaction();

            try {
                // Créer le rapport
                $report = PropertyConditionReport::create([
                    'property_id'    => $validated['property_id'],
                    'lease_id'       => $validated['lease_id'],
                    'created_by'     => $user->id,
                    'type'           => $validated['type'],
                    'report_date'    => $validated['report_date'],
                    'notes'          => $validated['notes'] ?? null,
                    'signed_at'      => null,
                    'signed_by'      => null,
                ]);

                // Enregistrer les photos
                if ($request->hasFile('photos')) {
                    foreach ($request->file('photos') as $index => $photo) {
                        if ($photo->isValid()) {
                            $this->storePhoto($photo, $report, [
                                'condition_status' => $request->input("condition_statuses.{$index}", 'good'),
                                'condition_notes'  => $request->input("condition_notes.{$index}", ''),
                            ]);
                        }
                    }
                }

                // Mettre à jour le statut du bail si nécessaire
                if ($validated['type'] === 'entry') {
                    Lease::where('id', $validated['lease_id'])
                        ->update(['status' => 'active']);
                } elseif ($validated['type'] === 'exit') {
                    Lease::where('id', $validated['lease_id'])
                        ->update(['status' => 'terminated']);
                }

                DB::commit();

                return redirect()->route('co-owner.condition-reports.show', $report->id)
                    ->with('success', 'État des lieux créé avec succès.');

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Erreur création état des lieux: ' . $e->getMessage());

                return redirect()->back()
                    ->with('error', 'Une erreur est survenue lors de la création : ' . $e->getMessage())
                    ->withInput();
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->validator)
                ->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur validation état des lieux: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Une erreur est survenue lors de la validation.')
                ->withInput();
        }
    }

    /**
     * Affiche un état des lieux spécifique
     */
    public function show($id)
    {
        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $report = PropertyConditionReport::with([
            'photos',
            'lease.tenant',
            'property',
            'creator'
        ])->findOrFail($id);

        // Vérifier l'accès
        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        return view('co-owner.condition-reports.show', compact('report'));
    }

    /**
     * Ajoute des photos à un état des lieux existant
     */
    public function addPhotos(Request $request, $id)
    {
        $validated = $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|max:10240',
            'condition_statuses.*' => 'nullable|in:good,satisfactory,poor,damaged',
            'condition_notes.*'    => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $report = PropertyConditionReport::findOrFail($id);
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        DB::beginTransaction();

        try {
            foreach ($request->file('photos') as $index => $photo) {
                if ($photo->isValid()) {
                    $this->storePhoto($photo, $report, [
                        'condition_status' => $request->input("condition_statuses.{$index}", 'good'),
                        'condition_notes'  => $request->input("condition_notes.{$index}", ''),
                    ]);
                }
            }

            DB::commit();

            return redirect()->back()
                ->with('success', 'Photos ajoutées avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur ajout photos: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Erreur lors de l\'ajout des photos.');
        }
    }

    /**
     * Supprime un état des lieux
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $report = PropertyConditionReport::findOrFail($id);
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        if ($report->signed_at) {
            return redirect()->back()
                ->with('error', 'Impossible de supprimer un état des lieux signé.');
        }

        DB::beginTransaction();

        try {
            // Supprimer les photos physiques
            foreach ($report->photos as $photo) {
                Storage::disk('public')->delete($photo->path);
                $photo->delete();
            }

            // Supprimer le rapport
            $report->delete();

            DB::commit();

            return redirect()->route('co-owner.condition-reports.index')
                ->with('success', 'État des lieux supprimé avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur suppression état des lieux: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression.');
        }
    }

    /**
     * Télécharge un PDF de l'état des lieux
     */
    public function downloadPdf($id)
    {
        $user = Auth::user();
        $report = PropertyConditionReport::with([
            'photos',
            'lease.tenant',
            'property',
            'creator'
        ])->findOrFail($id);

        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        try {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('co-owner.condition-reports.pdf', compact('report'));
            return $pdf->download("etat-des-lieux-{$report->id}.pdf");

        } catch (\Exception $e) {
            Log::error('Erreur génération PDF: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Erreur lors de la génération du PDF.');
        }
    }

    /**
     * Méthode utilitaire pour stocker une photo
     */
    protected function storePhoto(UploadedFile $photo, PropertyConditionReport $report, array $attributes = [])
    {
        try {
            $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();

            $path = $photo->storeAs(
                'property_condition_photos/' . $report->id,
                $filename,
                'public'
            );

            return PropertyConditionPhoto::create([
                'report_id'          => $report->id,
                'path'              => $path,
                'original_filename' => $photo->getClientOriginalName(),
                'mime_type'         => $photo->getMimeType(),
                'size'              => $photo->getSize(),
                'taken_at'          => now(),
                'condition_status'  => $attributes['condition_status'] ?? 'good',
                'condition_notes'   => $attributes['condition_notes'] ?? null,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur stockage photo: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Édite un état des lieux
     */
    public function edit($id)
    {
        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $report = PropertyConditionReport::with(['photos', 'lease', 'property'])->findOrFail($id);

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        $propertyIds = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('status', 'active')
            ->pluck('property_id');

        $properties = Property::whereIn('id', $propertyIds)
            ->with(['leases' => function($query) {
                $query->where('status', 'active')->with('tenant');
            }])
            ->get();

        return view('co-owner.condition-reports.edit', compact('report', 'properties'));
    }

    /**
     * Met à jour un état des lieux
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'property_id'   => 'required|exists:properties,id',
            'lease_id'      => 'required|exists:leases,id',
            'type'          => 'required|in:entry,exit,intermediate',
            'report_date'   => 'required|date',
            'notes'         => 'nullable|string',
        ]);

        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $report = PropertyConditionReport::findOrFail($id);

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $validated['property_id'])
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            return redirect()->back()
                ->with('error', 'Vous n\'avez pas accès à ce bien.')
                ->withInput();
        }

        try {
            $report->update($validated);

            return redirect()->route('co-owner.condition-reports.show', $report->id)
                ->with('success', 'État des lieux mis à jour avec succès.');

        } catch (\Exception $e) {
            Log::error('Erreur mise à jour état des lieux: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour.')
                ->withInput();
        }
    }
}
