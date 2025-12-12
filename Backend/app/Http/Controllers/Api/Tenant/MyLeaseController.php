<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaseResource;
use App\Http\Resources\InvoiceResource; // À créer
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MyLeaseController extends Controller
{
    private function getTenant()
    {
        return auth()->user()->tenant; // Relation définie dans User model
    }

    /**
     * Liste l'historique des baux (Actif et passés).
     */
    public function index()
    {
        $leases = Lease::where('tenant_id', $this->getTenant()->id)
            ->with(['property']) // On charge les infos du bien (adresse...)
            ->orderBy('start_date', 'desc')
            ->get();

        return LeaseResource::collection($leases);
    }

    /**
     * Détail du bail actif (Le "Dashboard" du locataire).
     */
    public function show($uuid)
    {
        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $this->getTenant()->id)
            ->with(['property.landlord', 'invoices' => function($q) {
                // On charge les 5 dernières factures/quittances
                $q->latest('due_date')->take(5);
            }])
            ->firstOrFail();

        return new LeaseResource($lease);
    }

    /**
     * Télécharger le contrat de bail (PDF).
     */
    public function downloadContract($uuid)
    {
        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $this->getTenant()->id)
            ->firstOrFail();

        if (!$lease->contract_file_path || !Storage::exists($lease->contract_file_path)) {
            return response()->json(['message' => 'Le document n\'est pas disponible.'], 404);
        }

        return Storage::download($lease->contract_file_path, 'Mon_Contrat_Bail.pdf');
    }

    /**
     * Liste spécifique des paiements/quittances pour ce bail.
     */
    public function invoices(Request $request, $uuid)
    {
        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $this->getTenant()->id)
            ->firstOrFail();

        $query = $lease->invoices()->orderBy('due_date', 'desc');

        // Filtre : Payé vs Impayé
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return InvoiceResource::collection($query->paginate(20));
    }
}