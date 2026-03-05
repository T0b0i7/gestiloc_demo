<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\RentReceipt;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class RentReceiptService
{
    public function generateForInvoice(Invoice $invoice): RentReceipt
    {
        $invoice->load(['lease.property.landlord.user', 'lease.tenant.user']);

        $lease = $invoice->lease;
        $property = $lease->property;

        $tenant = $lease->tenant;
        $tenantUser = $tenant?->user;

        $landlord = $property?->landlord;
        $landlordUser = $landlord?->user;

        $receipt = RentReceipt::firstOrCreate(
            ['invoice_id' => $invoice->id],
            [
                'lease_id' => $lease->id,
                'tenant_id' => $tenant->id,
                'landlord_user_id' => $landlordUser?->id,
                'amount_paid' => $invoice->amount_total,
                'paid_month' => optional($invoice->period_start)->format('Y-m') ?? now()->format('Y-m'),
                'status' => 'issued',
                'meta' => [
                    'lease_uuid' => $lease->uuid,
                    'invoice_number' => $invoice->invoice_number,
                ],
            ]
        );

        // PDF render
        $pdf = Pdf::loadView('pdf.rent-receipt', [
            'receipt' => $receipt,
            'invoiceNumber' => $invoice->invoice_number,
            'propertyAddress' => trim(($property->address ?? '') . ' ' . ($property->city ?? '')),
            'tenantName' => trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')),
            'tenantEmail' => $tenantUser?->email ?? '',
            'landlordName' => trim(($landlord->first_name ?? '') . ' ' . ($landlord->last_name ?? '')),
            'landlordEmail' => $landlordUser?->email ?? '',
        ]);

        $path = "receipts/{$receipt->receipt_number}.pdf";
        Storage::disk('public')->put($path, $pdf->output());

        $receipt->update(['pdf_path' => $path]);

        return $receipt;
    }
}
