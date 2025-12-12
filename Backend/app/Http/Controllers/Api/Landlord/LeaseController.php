<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\StoreLeaseRequest;
use App\Http\Requests\Landlord\TerminateLeaseRequest;
use App\Http\Resources\LeaseResource; // À créer
use App\Models\Lease;
use App\Models\Property;
use App\Models\Invoice;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class LeaseController extends Controller
{
    private function getLandlord()
    {
        return auth('api')->user()->landlord;
    }

    public function index(Request $request)
    {
        $query = Lease::whereHas('property', function ($q) {
            $q->where('landlord_id', $this->getLandlord()->id);
        });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return LeaseResource::collection($query->with(['property', 'tenant'])->latest()->paginate(15));
    }

    /**
     * Création d'un bail (Logique métier lourde).
     */
    public function store(StoreLeaseRequest $request)
    {
        $data = $request->validated();

        // 1. Vérification sécurité : Le bien appartient-il au bailleur ?
        $property = $this->getLandlord()->properties()->find($data['property_id']);
        if (!$property) {
            return response()->json(['message' => 'Propriété introuvable ou accès refusé.'], 403);
        }

        // 2. Vérification disponibilité : Le bien est-il déjà loué ?
        if ($property->status === 'rented') {
            return response()->json(['message' => 'Ce bien est déjà loué.'], 409);
        }

        return DB::transaction(function () use ($data, $property) {
            // A. Création du bail
            $lease = Lease::create([
                'property_id' => $property->id,
                'tenant_id' => $data['tenant_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'rent_amount' => $data['rent_amount'],
                'charges_amount' => $data['charges_amount'] ?? 0,
                'guarantee_amount' => $data['guarantee_amount'] ?? 0,
                'prepaid_rent_months' => $data['prepaid_rent_months'] ?? 0,
                'billing_day' => $data['billing_day'] ?? 1,
                'status' => 'active', // Ou 'draft' si vous voulez une étape de validation
            ]);

            // B. Mise à jour du statut de la propriété
            $property->update(['status' => 'rented']);

            // C. Génération de la première facture (Caution + X mois d'avance)
            $totalFirstInvoice = $lease->guarantee_amount + ($lease->rent_amount * $lease->prepaid_rent_months);

            if ($totalFirstInvoice > 0) {
                Invoice::create([
                    'lease_id' => $lease->id,
                    'type' => 'deposit', // Type spécial pour le premier paiement
                    'due_date' => Carbon::parse($data['start_date']),
                    'period_start' => Carbon::parse($data['start_date']),
                    'period_end' => Carbon::parse($data['start_date'])->addMonths($lease->prepaid_rent_months),
                    'amount_total' => $totalFirstInvoice,
                    'status' => 'pending'
                ]);
            }

            // TODO: Déclencher ici un Job pour générer le PDF du contrat (Queue)
            // GenerateLeasePdfJob::dispatch($lease);

            return new LeaseResource($lease);
        });
    }

    public function show($uuid)
    {
        $lease = Lease::where('uuid', $uuid)
            ->whereHas('property', function ($q) {
                $q->where('landlord_id', $this->getLandlord()->id);
            })
            ->with(['property', 'tenant', 'invoices']) // Charger les factures associées
            ->firstOrFail();

        return new LeaseResource($lease);
    }

    /**
     * Résilier un bail (Sortie locataire).
     */
    public function terminate(TerminateLeaseRequest $request, $uuid)
    {
        $lease = Lease::where('uuid', $uuid)->firstOrFail();

        // Sécurité
        if ($lease->property->landlord_id !== $this->getLandlord()->id) {
            abort(403);
        }

        $date = $request->input('end_date', now());

        DB::transaction(function () use ($lease, $date) {
            // 1. Clôturer le bail
            $lease->update([
                'status' => 'terminated',
                'end_date' => $date
            ]);

            // 2. Libérer la propriété
            $lease->property->update(['status' => 'available']);
        });

        return response()->json(['message' => 'Bail résilié avec succès. Le bien est à nouveau disponible.']);
    }
}
