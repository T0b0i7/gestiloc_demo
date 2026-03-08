<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Lease;
use App\Models\PropertyConditionReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class PropertyConditionReportController extends Controller
{
    public function index()
    {
        // Retourne tous les états des lieux du landlord connecté
        //Autorisation déjà gérée par middleware role:landlord
        $reports = PropertyConditionReport::with([
            'photos',
            'creator',
            'lease.tenant',
            'lease.property',
            'property'
        ])
        ->latest('report_date')
        ->get();

        return response()->json($reports);
    }

    public function forLease(Lease $lease)
    {
        // Autorisation déjà gérée par middleware
        $reports = $lease->conditionReports()
            ->with([
                'photos',
                'creator',
                'lease.tenant',
                'lease.property',
            ])
            ->latest('report_date')
            ->get();

        return response()->json([
            'entry_report'  => $reports->firstWhere('type', 'entry'),
            'exit_report'   => $reports->firstWhere('type', 'exit'),
            'other_reports' => $reports->whereNotIn('type', ['entry', 'exit'])->values(),
        ]);
    }

    public function store(Request $request, Property $property)
    {
        $validated = $request->validate([
            'lease_id'         => 'required|exists:leases,id',
            'type'             => 'required|in:entry,exit,intermediate',
            'report_date'      => 'required|date',
            'notes'            => 'nullable|string',
            'photos'           => 'required|array|min:1',
            'photos.*'         => 'image|max:10240',

            'photo_dates'      => 'required|array|size:' . count($request->file('photos', [])),
            'photo_dates.*'    => 'required|date',

            'photo_captions'   => 'sometimes|array',
            'photo_captions.*' => 'nullable|string|max:255',

            'signature_data'   => 'nullable|string',
            'signed_by'        => 'required_with:signature_data|string|max:255',
        ]);

        // Vérifier que le bail appartient bien à la propriété
        $lease = Lease::where('id', $validated['lease_id'])
            ->where('property_id', $property->id)
            ->firstOrFail();

        // Vérifier qu'il n'existe pas déjà un état des lieux de ce type pour ce bail
        if (in_array($validated['type'], ['entry', 'exit'], true)) {
            $existingReport = PropertyConditionReport::where('lease_id', $lease->id)
                ->where('type', $validated['type'])
                ->exists();

            if ($existingReport) {
                return response()->json([
                    'message' => "Un état des lieux de type {$validated['type']} existe déjà pour ce bail",
                ], 422);
            }
        }

        return DB::transaction(function () use ($validated, $property, $lease, $request) {
            // Créer le rapport
            $report = $property->conditionReports()->create([
                'lease_id'        => $lease->id,
                'created_by'      => auth()->id(),
                'type'            => $validated['type'],
                'report_date'     => $validated['report_date'],
                'notes'           => $validated['notes'] ?? null,
                'signature_data'  => $validated['signature_data'] ?? null,
                'signed_by'       => $validated['signed_by'] ?? null,
                'signed_at'       => isset($validated['signature_data']) ? now() : null,
            ]);

            // Traiter les photos
            foreach ($request->file('photos', []) as $index => $photo) {
                $this->storePhoto($photo, $report, [
                    'taken_at' => $validated['photo_dates'][$index],
                    'caption'  => $validated['photo_captions'][$index] ?? null,
                ]);
            }

            // Mettre à jour le statut du bail si nécessaire
            if ($validated['type'] === 'entry') {
                $lease->update(['status' => 'active']);
            } elseif ($validated['type'] === 'exit') {
                $lease->update(['status' => 'terminated']);
            }

            return response()->json([
                'message' => 'État des lieux enregistré avec succès',
                'report'  => $report->load([
                    'photos',
                    'creator',
                    'lease.tenant',
                    'lease.property',
                ]),
            ], 201);
        });
    }

    public function storeEntry(Request $request, Lease $lease)
    {
        $request->merge([
            'lease_id' => $lease->id,
            'type'     => 'entry',
        ]);

        return $this->store($request, $lease->property);
    }

    public function storeExit(Request $request, Lease $lease)
    {
        $request->merge([
            'lease_id' => $lease->id,
            'type'     => 'exit',
        ]);

        return $this->store($request, $lease->property);
    }

    public function show(Property $property, PropertyConditionReport $report)
    {
        if ($report->property_id !== $property->id) {
            abort(404);
        }

        return response()->json(
            $report->load([
                'photos',
                'creator',
                'lease.tenant',
                'lease.property',
            ])
        );
    }

    public function addPhotos(Request $request, Property $property, PropertyConditionReport $report)
    {
        if ($report->property_id !== $property->id) {
            abort(404);
        }

        $validated = $request->validate([
            'photos'              => 'required|array|min:1',
            'photos.*'            => 'image|max:10240',

            'photo_dates'         => 'required|array|size:' . count($request->file('photos', [])),
            'photo_dates.*'       => 'required|date',

            'photo_captions'      => 'sometimes|array',
            'photo_captions.*'    => 'nullable|string|max:255',

            'condition_status'    => 'sometimes|array',
            'condition_status.*'  => 'nullable|in:good,satisfactory,poor,damaged',

            'condition_notes'     => 'sometimes|array',
            'condition_notes.*'   => 'nullable|string|max:1000',
        ]);

        $photos = [];

        foreach ($request->file('photos', []) as $index => $photo) {
            $photoData = [
                'taken_at' => $validated['photo_dates'][$index],
                'caption'  => $validated['photo_captions'][$index] ?? null,
            ];

            if (isset($validated['condition_status'][$index])) {
                $photoData['condition_status'] = $validated['condition_status'][$index];
            }

            if (isset($validated['condition_notes'][$index])) {
                $photoData['condition_notes'] = $validated['condition_notes'][$index];
            }

            $photos[] = $this->storePhoto($photo, $report, $photoData);
        }

        return response()->json([
            'message' => 'Photos ajoutées avec succès',
            'photos'  => $photos,
            'report'  => $report->fresh()->load([
                'photos',
                'creator',
                'lease.tenant',
                'lease.property',
            ]),
        ]);
    }

    public function sign(Request $request, Property $property, PropertyConditionReport $report)
    {
        if ($report->property_id !== $property->id) {
            abort(404);
        }

        $validated = $request->validate([
            'signature_data' => 'required|string',
            'signed_by'      => 'required|string|max:255',
        ]);

        $signed = $report->sign($validated['signature_data'], $validated['signed_by']);

        if (!$signed) {
            return response()->json(['message' => "Erreur lors de l'enregistrement de la signature"], 500);
        }

        return response()->json([
            'message' => 'Signature enregistrée avec succès',
            'report'  => $report->fresh()->load([
                'photos',
                'creator',
                'lease.tenant',
                'lease.property',
            ]),
        ]);
    }

    public function destroy(Property $property, PropertyConditionReport $report)
    {
        if ($report->property_id !== $property->id) {
            abort(404);
        }

        foreach ($report->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        $report->delete();

        return response()->json(['message' => 'État des lieux supprimé avec succès']);
    }

    protected function storePhoto(UploadedFile $photo, PropertyConditionReport $report, array $attributes = [])
    {
        $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();

        $path = $photo->storeAs(
            'property_condition_photos/' . $report->id,
            $filename,
            'public'
        );

        return $report->photos()->create([
            'path'              => $path,
            'original_filename' => $photo->getClientOriginalName(),
            'mime_type'         => $photo->getMimeType(),
            'size'              => $photo->getSize(),
            'taken_at'          => $attributes['taken_at'] ?? now(),
            'caption'           => $attributes['caption'] ?? null,
            'condition_status'  => $attributes['condition_status'] ?? 'good',
            'condition_notes'   => $attributes['condition_notes'] ?? null,
        ]);
    }
}
