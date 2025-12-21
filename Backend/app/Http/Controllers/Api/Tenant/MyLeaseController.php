<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaseResource;
use App\Http\Resources\InvoiceResource; // si tu l'as, sinon remplace par response()->json
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MyLeaseController extends Controller
{
    private function getTenant()
    {
        $user = auth()->user();

        if (!$user || !$user->isTenant()) {
            abort(403, 'Accès réservé aux locataires');
        }

        if (!$user->tenant) {
            abort(404, 'Profil locataire introuvable');
        }

        return $user->tenant;
    }

    /**
     * Liste l'historique des baux.
     */
public function index()
{
    $user = auth()->user();

    if (!$user || !$user->hasRole('tenant') || !$user->tenant) {
        return response()->json(['message' => 'Accès réservé aux locataires'], 403);
    }

    $leases = Lease::query()
        ->where('tenant_id', $user->tenant->id)
        ->with([
            'property',
            'property.landlord',
            'property.landlord.user',
            'invoices' => function ($q) {
                $q->latest('due_date')->take(5);
            },
        ])
        ->orderByDesc('start_date')
        ->get();

    // ✅ IMPORTANT : retourne un tableau, pas {data: ...}
    return response()->json($leases->values());
}


    /**
     * Détail d'un bail.
     */
    public function show($uuid)
    {
        $tenant = $this->getTenant();

        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->with([
                'property',
                'property.landlord',
                'property.landlord.user',
                'invoices' => function ($q) {
                    $q->latest('due_date')->take(5);
                },
            ])
            ->firstOrFail();

        return new LeaseResource($lease);
    }

    /**
     * Télécharger le contrat de bail.
     */
    public function downloadContract($uuid)
    {
        $tenant = $this->getTenant();

        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        if (!$lease->contract_file_path || !Storage::exists($lease->contract_file_path)) {
            return response()->json(['message' => 'Le document n\'est pas disponible.'], 404);
        }

        return Storage::download($lease->contract_file_path, 'Mon_Contrat_Bail.pdf');
    }

    /**
     * Factures/quittances du bail.
     */
    public function invoices(Request $request, $uuid)
    {
        $tenant = $this->getTenant();

        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        $query = $lease->invoices()->orderBy('due_date', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Si InvoiceResource existe :
        return InvoiceResource::collection($query->paginate(20));

        // Sinon :
        // return response()->json($query->paginate(20));
    }
}
