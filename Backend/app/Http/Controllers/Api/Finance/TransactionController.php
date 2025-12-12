<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Enregistrer un paiement manuel (Cash, Virement bancaire direct, Chèque)
     */
    public function store(Request $request)
    {
        // Validation
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:cash,bank_transfer,check,other',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:255'
        ]);

        $invoice = Invoice::findOrFail($request->invoice_id);

        // Sécurité : Seul le propriétaire peut valider un encaissement manuel
        // (Le locataire ne peut pas dire "J'ai payé" sans validation)
        if (auth()->user()->landlord->id !== $invoice->lease->property->landlord_id) {
            abort(403);
        }

        // Vérifier qu'on ne paie pas trop
        $remainingDue = $invoice->amount_total - $invoice->amount_paid;
        if ($request->amount > $remainingDue) {
            return response()->json([
                'message' => "Le montant dépasse le reste à payer ({$remainingDue} FCFA)."
            ], 422);
        }

        DB::transaction(function () use ($request, $invoice) {
            // 1. Créer la transaction
            Transaction::create([
                'invoice_id' => $invoice->id,
                'payment_method' => $request->payment_method,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'notes' => $request->notes,
                'recorded_by' => auth()->id(), // On note qui a saisi l'info
                'status' => 'success' // Manuel = considéré comme réussi immédiatement
            ]);
            
            // Note: La mise à jour du statut de l'Invoice (Paid/Partial) 
            // est gérée automatiquement par le modèle Transaction::booted() 
            // que nous avons défini dans l'étape précédente.
        });

        return response()->json(['message' => 'Paiement enregistré avec succès.']);
    }

    /**
     * Historique des paiements reçus
     */
    public function index(Request $request)
    {
        $landlordId = auth()->user()->landlord->id;

        $transactions = Transaction::whereHas('invoice.lease.property', function ($q) use ($landlordId) {
            $q->where('landlord_id', $landlordId);
        })
        ->with(['invoice.lease.tenant', 'invoice.lease.property'])
        ->latest('payment_date')
        ->paginate(20);

        return response()->json($transactions); // Ou via une Resource
    }
}