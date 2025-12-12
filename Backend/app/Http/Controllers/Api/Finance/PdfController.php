<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\Property;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfController extends Controller
{
    protected $pdfService;

    public function __construct(PdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Génère une quittance PDF pour une facture payée
     */
    public function generateQuittance($id)
    {
        try {
            $invoice = Invoice::with(['lease.property.landlord.user', 'lease.tenant.user', 'lease'])
                ->findOrFail($id);

            // Vérifier que la facture est payée
            if ($invoice->status !== 'paid') {
                return response()->json([
                    'message' => 'Seules les factures payées peuvent générer une quittance'
                ], 400);
            }

            // Générer le PDF
            $tempPath = $this->pdfService->generateInvoicePdf($invoice, 'quittance');
            
            // Récupérer le contenu
            $pdfContent = Storage::get($tempPath);
            
            // Nettoyer le fichier temporaire
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=quittance_{$invoice->invoice_number}.pdf");
                
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération de la quittance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Génère un avis d'échéance pour une facture impayée
     */
    public function generateAvisEcheance($id)
    {
        try {
            $invoice = Invoice::with(['lease.property.landlord.user', 'lease.tenant.user', 'lease'])
                ->findOrFail($id);

            // Vérifier que la facture n'est pas payée
            if ($invoice->status === 'paid') {
                return response()->json([
                    'message' => 'Les factures payées ne peuvent pas générer d\'avis d\'échéance'
                ], 400);
            }

            // Générer le PDF
            $tempPath = $this->pdfService->generateInvoicePdf($invoice, 'avis_echeance');
            
            // Récupérer le contenu
            $pdfContent = Storage::get($tempPath);
            
            // Nettoyer le fichier temporaire
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=avis_echeance_{$invoice->invoice_number}.pdf");
                
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération de l\'avis d\'échéance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Génère un contrat de bail PDF
     */
    public function generateLeaseContract($uuid)
    {
        try {
            $lease = Lease::with(['property.landlord.user', 'property.landlord', 'tenant.user', 'tenant'])
                ->where('uuid', $uuid)
                ->firstOrFail();

            // Vérifier que l'utilisateur a les droits sur ce bail
            $user = auth()->user();
            $hasAccess = false;

            if ($user->isLandlord() && $user->landlord) {
                $hasAccess = $lease->property->landlord_id === $user->landlord->id;
            } elseif ($user->isTenant() && $user->tenant) {
                $hasAccess = $lease->tenant_id === $user->tenant->id;
            } elseif ($user->isAdmin()) {
                $hasAccess = true;
            }

            if (!$hasAccess) {
                return response()->json(['message' => 'Accès non autorisé'], 403);
            }

            // Générer le PDF
            $tempPath = $this->pdfService->generateLeaseContractPdf($lease);
            
            // Récupérer le contenu
            $pdfContent = Storage::get($tempPath);
            
            // Nettoyer le fichier temporaire
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=contrat_bail_{$lease->lease_number}.pdf");
                
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération du contrat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Génère un document récapitulatif pour le bailleur
     */
    public function generateLandlordSummary(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user->isLandlord() || !$user->landlord) {
                return response()->json(['message' => 'Accès réservé aux bailleurs'], 403);
            }

            // Données pour le résumé
            $data = [
                'monthly_revenue' => 0,
                'pending_invoices' => []
            ];

            // Générer le PDF
            $tempPath = $this->pdfService->generateLandlordSummaryPdf($user->landlord, $data);
            
            // Récupérer le contenu
            $pdfContent = Storage::get($tempPath);
            
            // Nettoyer le fichier temporaire
            Storage::delete($tempPath);

            $filename = sprintf(
                'recap_bailleur_%s_%s.pdf',
                $user->landlord->last_name,
                now()->format('Y-m-d')
            );

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename={$filename}");
                
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération du récapitulatif',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
