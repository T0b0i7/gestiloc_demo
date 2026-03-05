<?php

namespace App\Services\Admin\Dashboard;

use App\Models\RentReceipt;
use App\Models\PropertyConditionReport;
use App\Models\Lease;

class DocumentStatsService
{
    public function overview(): array
    {
        $rentReceiptsCount = RentReceipt::count();
        $conditionReportsCount = PropertyConditionReport::count();
        $contractsCount = Lease::whereNotNull('contract_file_path')->count();

        return [
            'rent_receipts_count' => $rentReceiptsCount,
            'property_condition_reports_count' => $conditionReportsCount,
            'contracts_count' => $contractsCount,
            'total_documents' => $rentReceiptsCount + $conditionReportsCount + $contractsCount,
        ];
    }

    public function recentDocuments(int $limit = 5): array
    {
        $recentReceipts = RentReceipt::latest()->take($limit)->get()->map(fn($doc) => [
            'type' => 'rent_receipt',
            'reference' => $doc->reference,
            'tenant' => $doc->tenant?->user?->email,
            'property' => $doc->property?->name,
            'created_at' => $doc->created_at->toISOString(),
        ]);

        $recentReports = PropertyConditionReport::latest()->take($limit)->get()->map(fn($doc) => [
            'type' => 'condition_report',
            'property' => $doc->property?->name,
            'landlord' => $doc->property?->landlord?->user?->email,
            'report_type' => $doc->type,
            'created_at' => $doc->created_at->toISOString(),
        ]);

        return $recentReceipts->merge($recentReports)->sortByDesc('created_at')->values()->toArray();
    }
}
