<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource; // À créer
use App\Models\Invoice;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\PaymentReminderMail; // Mailable à créer

class InvoiceController extends Controller
{
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