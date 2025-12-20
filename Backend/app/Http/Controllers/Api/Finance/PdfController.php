<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\RentReceipt;
use App\Models\Invoice;
use App\Models\Lease;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PdfController extends Controller
{
    protected PdfService $pdfService;

    public function __construct(PdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    public function generateQuittance($id)
    {
        try {
            $invoice = Invoice::with(['lease.property.landlord.user', 'lease.tenant.user', 'lease'])
                ->findOrFail($id);

            if ($invoice->status !== 'paid') {
                return response()->json([
                    'message' => 'Seules les factures payées peuvent générer une quittance'
                ], 400);
            }

            $tempPath = $this->pdfService->generateInvoicePdf($invoice, 'quittance');

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=quittance_{$invoice->invoice_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération de la quittance',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Quittance indépendante (bailleur)
     * Route: GET /api/quittance-independent/{id}
     */
    /**
 * ✅ Quittance indépendante (bailleur + locataire)
 * Route: GET /api/quittance-independent/{id}
 */
public function generateIndependentRentReceipt($id)
{
    $user = auth()->user();

    Log::info('[PdfController@generateIndependentRentReceipt] incoming', [
        'auth_id'    => $user?->id,
        'roles'      => $user?->roles?->pluck('name'),
        'receipt_id' => (string) $id,
    ]);

    try {
        $receipt = RentReceipt::with([
            'property',
            'landlord',           // User
            'tenant.user',        // Tenant profile + User (email/phone)
            'lease',
            'lease.property',
            'lease.property.landlord',
            'lease.property.landlord.user',
            'lease.tenant',
            'lease.tenant.user',
        ])->findOrFail($id);

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $isLandlord = $user->hasRole('landlord');
        $isTenant   = $user->hasRole('tenant');

        // tenant profile id (tenants.id)
        $tenantProfileId = $user->tenant?->id;

        // ✅ Autorisations:
        // - landlord: users.id doit matcher receipt.landlord_id
        // - tenant: tenants.id doit matcher receipt.tenant_id
        $canLandlord = $isLandlord && ((int) $receipt->landlord_id === (int) $user->id);
        $canTenant   = $isTenant && $tenantProfileId && ((int) $receipt->tenant_id === (int) $tenantProfileId);

        if (!$canLandlord && !$canTenant) {
            Log::warning('[PdfController@generateIndependentRentReceipt] forbidden', [
                'auth_id' => $user->id,
                'receipt_landlord_id' => $receipt->landlord_id,
                'receipt_tenant_id' => $receipt->tenant_id,
                'tenant_profile_id' => $tenantProfileId,
            ]);

            return response()->json(['message' => 'Forbidden'], 403);
        }

        // ✅ PDF view
        $viewName = 'pdfs.rent_receipt_independent';
        if (!view()->exists($viewName)) {
            Log::error('[PdfController@generateIndependentRentReceipt] view missing', [
                'view' => $viewName,
            ]);

            return response()->json(['message' => 'PDF template missing'], 500);
        }

        $pdf = \PDF::loadView($viewName, [
            'receipt' => $receipt,
        ])->setPaper('a4');

        $year  = $receipt->year ?: (int) now()->format('Y');
        $month = $receipt->month ?: (int) now()->format('m');
        $ref   = $receipt->reference ?: ('RR-' . $receipt->id);

        $filename = "quittance-{$year}-" . str_pad((string)$month, 2, '0', STR_PAD_LEFT) . "-{$ref}.pdf";

        return $pdf->download($filename);

    } catch (\Throwable $e) {
        Log::error('[PdfController@generateIndependentRentReceipt] exception', [
            'message' => $e->getMessage(),
            'trace'   => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => 'Erreur lors de la génération de la quittance',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

    public function generateAvisEcheance($id)
    {
        try {
            $invoice = Invoice::with(['lease.property.landlord.user', 'lease.tenant.user', 'lease'])
                ->findOrFail($id);

            if ($invoice->status === 'paid') {
                return response()->json([
                    'message' => 'Les factures payées ne peuvent pas générer d\'avis d\'échéance'
                ], 400);
            }

            $tempPath = $this->pdfService->generateInvoicePdf($invoice, 'avis_echeance');

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=avis_echeance_{$invoice->invoice_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération de l\'avis d\'échéance',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function generateLeaseContract($uuid)
    {
        try {
            $lease = Lease::with(['property.landlord.user', 'property.landlord', 'tenant.user', 'tenant'])
                ->where('uuid', $uuid)
                ->firstOrFail();

            $user = auth()->user();
            $hasAccess = false;

            if ($user && $user->isLandlord() && $user->landlord) {
                $hasAccess = (int) $lease->property->landlord_id === (int) $user->landlord->id;
            } elseif ($user && $user->isTenant() && $user->tenant) {
                $hasAccess = (int) $lease->tenant_id === (int) $user->tenant->id;
            } elseif ($user && $user->isAdmin()) {
                $hasAccess = true;
            }

            if (!$hasAccess) {
                return response()->json(['message' => 'Accès non autorisé'], 403);
            }

            $tempPath = $this->pdfService->generateLeaseContractPdf($lease);

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=contrat_bail_{$lease->lease_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération du contrat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function generateLandlordSummary(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->isLandlord() || !$user->landlord) {
                return response()->json(['message' => 'Accès réservé aux bailleurs'], 403);
            }

            $data = [
                'monthly_revenue'  => 0,
                'pending_invoices' => []
            ];

            $tempPath = $this->pdfService->generateLandlordSummaryPdf($user->landlord, $data);

            $pdfContent = Storage::get($tempPath);
            Storage::delete($tempPath);

            $filename = sprintf(
                'recap_bailleur_%s_%s.pdf',
                $user->landlord->last_name ?? 'bailleur',
                now()->format('Y-m-d')
            );

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename={$filename}");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la génération du récapitulatif',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
