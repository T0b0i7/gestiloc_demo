<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Landlord;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PdfService
{
    /**
     * Génère un PDF pour une facture (quittance ou avis d'échéance)
     */
    public function generateInvoicePdf(Invoice $invoice, string $type = 'quittance'): string
    {
        // Charger les relations nécessaires
        $invoice->load(['lease.property.landlord.user', 'lease.tenant.user']);
        
        $data = [
            'invoice' => $invoice,
            'lease' => $invoice->lease,
            'property' => $invoice->lease->property,
            'landlord' => $invoice->lease->property->landlord,
            'tenant' => $invoice->lease->tenant,
            'type' => $type,
            'generated_at' => Carbon::now(),
        ];

        // Sélectionner le template selon le type
        $template = $type === 'quittance' ? 'pdfs.quittance' : 'pdfs.avis_echeance';
        
        $pdf = Pdf::loadView($template, $data);
        $pdf->setPaper('A4', 'portrait');
        
        // Nom du fichier : Type_NuméroFacture_Date.pdf
        $filename = sprintf(
            '%s_%s_%s.pdf',
            $type,
            $invoice->invoice_number,
            Carbon::now()->format('Y-m-d')
        );
        
        // Sauvegarder en local temporairement pour le téléchargement
        $tempPath = 'temp/' . $filename;
        Storage::put($tempPath, $pdf->output());
        
        return $tempPath;
    }

    /**
     * Génère un PDF de contrat de bail
     */
    public function generateLeaseContractPdf(Lease $lease): string
    {
        $lease->load(['property.landlord.user', 'property.landlord', 'tenant.user', 'tenant']);
        
        $data = [
            'lease' => $lease,
            'property' => $lease->property,
            'landlord' => $lease->property->landlord,
            'tenant' => $lease->tenant,
            'generated_at' => Carbon::now(),
        ];

        $pdf = Pdf::loadView('pdfs.lease_contract', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $filename = sprintf(
            'Contrat_Bail_%s_%s.pdf',
            $lease->lease_number,
            Carbon::now()->format('Y-m-d')
        );
        
        $tempPath = 'temp/' . $filename;
        Storage::put($tempPath, $pdf->output());
        
        return $tempPath;
    }

    /**
     * Génère un état des lieux
     */
    public function generateInventoryPdf($inventory): string
    {
        $inventory->load(['lease.property', 'lease.tenant', 'items']);
        
        $data = [
            'inventory' => $inventory,
            'lease' => $inventory->lease,
            'property' => $inventory->lease->property,
            'tenant' => $inventory->lease->tenant,
            'generated_at' => Carbon::now(),
        ];

        $pdf = Pdf::loadView('pdfs.inventory', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $filename = sprintf(
            'Etat_des_lieux_%s_%s.pdf',
            $inventory->type,
            Carbon::now()->format('Y-m-d')
        );
        
        $tempPath = 'temp/' . $filename;
        Storage::put($tempPath, $pdf->output());
        
        return $tempPath;
    }

    /**
     * Génère un document récapitulatif pour le bailleur
     */
    public function generateLandlordSummaryPdf(Landlord $landlord, array $data = []): string
    {
        $landlord->load(['properties.leases.invoices', 'properties.leases.tenant']);
        
        $summaryData = [
            'landlord' => $landlord,
            'properties' => $landlord->properties,
            'monthly_revenue' => $data['monthly_revenue'] ?? 0,
            'pending_invoices' => $data['pending_invoices'] ?? [],
            'generated_at' => Carbon::now(),
        ];

        $pdf = Pdf::loadView('pdfs.landlord_summary', $summaryData);
        $pdf->setPaper('A4', 'portrait');
        
        $filename = sprintf(
            'Recap_Bailleur_%s_%s.pdf',
            $landlord->last_name,
            Carbon::now()->format('Y-m-d')
        );
        
        $tempPath = 'temp/' . $filename;
        Storage::put($tempPath, $pdf->output());
        
        return $tempPath;
    }

    /**
     * Nettoie les fichiers temporaires
     */
    public function cleanupTempFiles(array $tempPaths): void
    {
        foreach ($tempPaths as $path) {
            if (Storage::exists($path)) {
                Storage::delete($path);
            }
        }
    }
}
