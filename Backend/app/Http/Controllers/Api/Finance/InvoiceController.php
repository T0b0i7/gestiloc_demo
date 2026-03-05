<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\PaymentReminderMail; 

class InvoiceController extends Controller
{
    /**
     * Créer une nouvelle facture (Bailleur ou Co-propriétaire)
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // Vérifier que c'est un bailleur ou un co-propriétaire
        if (!$user->landlord && !$user->coOwner) {
            return response()->json(['message' => 'Seul un propriétaire ou un co-propriétaire peut créer une facture.'], 403);
        }

        $request->validate([
            'lease_id' => 'required|exists:leases,id',
            'type' => 'required|in:rent,deposit,charge,repair',
            'due_date' => 'required|date|after:today',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after:period_start',
            'amount_total' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:card,mobile_money,virement,cheque,especes,fedapay',
        ]);

        $lease = \App\Models\Lease::findOrFail($request->lease_id);

        // Vérifier que le bailleur possède bien cette location
        if ($user->landlord && $lease->property->landlord_id !== $user->landlord->id) {
            return response()->json(['message' => 'Vous ne pouvez pas créer de facture pour cette location.'], 403);
        }

        // Pour les co-propriétaires, vérifier qu'ils ont accès à cette location via délégation
        if ($user->coOwner) {
            // Vérifier si la propriété est déléguée à ce co-propriétaire
            $hasDelegation = \App\Models\PropertyDelegation::where('delegated_to', $user->coOwner->id)
                ->whereHas('property', function($query) use ($lease) {
                    $query->where('id', $lease->property_id);
                })
                ->where('status', 'accepted')
                ->exists();

            if (!$hasDelegation) {
                return response()->json(['message' => 'Vous ne pouvez pas créer de facture pour cette location.'], 403);
            }
        }

        $invoice = Invoice::create([
            'lease_id' => $request->lease_id,
            'type' => $request->type,
            'due_date' => $request->due_date,
            'period_start' => $request->period_start,
            'period_end' => $request->period_end,
            'amount_total' => $request->amount_total,
            'payment_method' => $request->payment_method,
            'status' => 'pending',
        ]);

        // Option: créer automatiquement un lien de paiement et envoyer au locataire
        try {
            $token = \Illuminate\Support\Str::random(48);
            $expires = now()->addHours(24);
            $tenantId = $invoice->lease->tenant_id ?? null;

            \App\Models\PaymentLink::create([
                'invoice_id' => $invoice->id,
                'tenant_id' => $tenantId,
                'token' => $token,
                'expires_at' => $expires,
            ]);

            $url = rtrim(config('app.frontend_url', ''), '/') . '/pay-link/' . $token;
            if ($invoice->lease && $invoice->lease->tenant && $invoice->lease->tenant->user) {
                \Illuminate\Support\Facades\Mail::to($invoice->lease->tenant->user->email)
                    ->queue(new \App\Mail\PaymentLinkMail($invoice, $url));
            }
        } catch (\Throwable $e) {
            // silent fail: link/email not required for invoice creation
        }

        return response()->json([
            'message' => 'Facture créée avec succès.',
            'invoice' => new InvoiceResource($invoice->load(['lease.property', 'lease.tenant']))
        ], 201);
    }

    /**
     * Liste les factures (Adaptatif : Bailleur ou Locataire)
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Invoice::query();

        // Ségrégation des données selon le rôle
        if ($user->landlord) {
            // Le bailleur voit les factures de SES biens
            $query->whereHas('lease.property', function ($q) use ($user) {
                $q->where('landlord_id', $user->landlord->id);
            });
        } elseif ($user->tenant) {
            // Le locataire ne voit que SES factures
            $query->whereHas('lease', function ($q) use ($user) {
                $q->where('tenant_id', $user->tenant->id);
            });
        }

        // Filtres (Impayés, Payés, Retard)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtre par date (Mois en cours par exemple)
        if ($request->filled('month')) {
            $query->whereMonth('due_date', $request->month);
        }

        return InvoiceResource::collection($query->latest('due_date')->paginate(20));
    }

    /**
     * Détails d'une facture
     */
    public function show($id)
    {
        $invoice = $this->getSecureInvoice($id);
        return new InvoiceResource($invoice->load(['transactions', 'lease.property']));
    }

    /**
     * Télécharger la Quittance ou l'Avis d'échéance (PDF)
     */
    public function downloadPdf($id, PdfService $pdfService)
    {
        $invoice = $this->getSecureInvoice($id);

        // Si payé = Quittance, Sinon = Avis d'échéance
        $type = $invoice->status === 'paid' ? 'quittance' : 'avis_echeance';

        try {
            // Génération du PDF via le service
            $tempPath = $pdfService->generateInvoicePdf($invoice, $type);

            // Récupérer le contenu du fichier temporaire
            $pdfContent = Storage::get($tempPath);

            // Nettoyer le fichier temporaire
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename={$type}_{$invoice->invoice_number}.pdf");
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la génération du PDF'], 500);
        }
    }

    /**
     * (Bailleur seulement) Envoyer une relance par email
     */
    public function sendReminder($id)
    {
        $invoice = Invoice::findOrFail($id);

        // Vérification : Seul le propriétaire peut relancer
        $this->authorize('manage', $invoice->lease->property);

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Cette facture est déjà payée.'], 400);
        }

        // Envoi de l'email
        $tenantEmail = $invoice->lease->tenant->user->email;
        Mail::to($tenantEmail)->queue(new PaymentReminderMail($invoice));

        // On peut enregistrer l'action dans les logs ou meta
        $invoice->update(['sent_at' => now()]);

        return response()->json(['message' => 'Relance envoyée avec succès au locataire.']);
    }

    /**
     * Helper pour sécuriser l'accès aux factures selon le rôle
     */
    private function getSecureInvoice($id)
    {
        $invoice = Invoice::findOrFail($id);
        $user = auth()->user();

        $isOwner = $user->landlord && $invoice->lease->property->landlord_id === $user->landlord->id;
        $isTenant = $user->tenant && $invoice->lease->tenant_id === $user->tenant->id;

        if (!$isOwner && !$isTenant) {
            abort(403, 'Accès non autorisé à cette facture.');
        }

        return $invoice;
    }
}
