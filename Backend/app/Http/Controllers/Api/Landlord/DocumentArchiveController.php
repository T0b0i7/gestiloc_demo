<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Lease;
use App\Models\PropertyConditionReport;
use App\Models\Property;
use App\Models\RentReceipt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DocumentArchiveController extends Controller
{
    /**
     * Obtenir les documents archivés pour le landlord
     * Inclut: baux terminés, états des lieux, quittances
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $landlordId = $user->landlord->id;

        // Récupérer les biens du landlord
        $propertyIds = Property::where('landlord_id', $landlordId)->pluck('id')->toArray();

        if (empty($propertyIds)) {
            return response()->json([
                'archives' => [],
                'stats' => [
                    'total_documents' => 0,
                    'baux_termines' => 0,
                    'edl_archives' => 0,
                    'quittances_archives' => 0,
                    'total_size' => '0 MB',
                ]
            ]);
        }

        $archives = [];

        // 1. Baux terminés (date_fin < aujourd'hui)
        $leases = Lease::whereIn('property_id', $propertyIds)
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->where('end_date', '<', Carbon::now())
            ->with(['property', 'tenant'])
            ->get();

        foreach ($leases as $lease) {
            $tenantName = $lease->tenant ? ($lease->tenant->first_name . ' ' . $lease->tenant->last_name) : 'N/A';
            $propertyName = $lease->property ? ($lease->property->name ?? $lease->property->address) : 'N/A';

            $duration = $lease->start_date->diffInMonths($lease->end_date);
            $durationYears = floor($duration / 12);
            $durationMonths = $duration % 12;
            $durationText = $durationYears > 0 
                ? ($durationYears . ' an' . ($durationYears > 1 ? 's' : '') . ($durationMonths > 0 ? ' ' . $durationMonths . ' mois' : ''))
                : ($durationMonths . ' mois');

            $archives[] = [
                'id' => 'lease_' . $lease->id,
                'type' => 'BAIL TERMINÉ',
                'typeBadge' => 'BAIL TERMINÉ',
                'typeBadgeColor' => '#f59e0b',
                'typeCategory' => 'Contrat de bails',
                'titre' => 'Contrat de bail - ' . $tenantName,
                'bien' => $propertyName,
                'champ1Label' => 'DÉBUT BAIL',
                'champ1Value' => $lease->start_date->format('d M Y'),
                'champ2Label' => 'FIN BAIL',
                'champ2Value' => $lease->end_date->format('d M Y'),
                'champ3Label' => 'DURÉE',
                'champ3Value' => $durationText,
                'champ4Label' => 'LOYER MENSUEL',
                'champ4Value' => number_format($lease->rent_amount ?? 0, 0, ',', ' ') . ' €',
                'dateBas' => 'Archivé le ' . $lease->end_date->format('d M Y'),
                'date_archive' => $lease->end_date,
                'property_id' => $lease->property_id,
                'lease_id' => $lease->id,
            ];
        }

        // 2. États des lieux archivés (plus de 2 mois)
        $twoMonthsAgo = Carbon::now()->subMonths(2);
        
        $conditionReports = PropertyConditionReport::whereIn('property_id', $propertyIds)
            ->where('created_at', '<', $twoMonthsAgo)
            ->with(['property', 'lease.tenant'])
            ->get();

        foreach ($conditionReports as $report) {
            $tenantName = $report->lease && $report->lease->tenant 
                ? ($report->lease->tenant->first_name . ' ' . $report->lease->tenant->last_name) 
                : 'N/A';
            $propertyName = $report->property ? ($report->property->name ?? $report->property->address) : 'N/A';
            
            $reportType = $report->type === 'entry' ? 'Entrée' : 'Sortie';
            $badgeType = $report->type === 'entry' ? 'EDL ENTRÉE' : 'EDL SORTIE';
            $badgeColor = $report->type === 'entry' ? '#83C757' : '#ef4444';

            $archives[] = [
                'id' => 'edl_' . $report->id,
                'type' => $badgeType,
                'typeBadge' => $badgeType,
                'typeBadgeColor' => $badgeColor,
                'typeCategory' => 'Etats des lieux',
                'titre' => 'État des lieux ' . strtolower($reportType) . ' - ' . $tenantName,
                'bien' => $propertyName,
                'champ1Label' => 'DATE VISITE',
                'champ1Value' => $report->created_at->format('d M Y'),
                'champ2Label' => 'TYPE',
                'champ2Value' => $reportType,
                'champ3Label' => 'ÉTAT GÉNÉRAL',
                'champ3Value' => $report->notes ? substr($report->notes, 0, 50) . (strlen($report->notes) > 50 ? '...' : '') : 'Bon',
                'champ4Label' => 'DÉPÔT DE GARANTIE',
                'champ4Value' => $report->lease && $report->lease->guarantee_amount 
                    ? number_format($report->lease->guarantee_amount, 0, ',', ' ') . ' €' 
                    : 'N/A',
                'dateBas' => 'Archivé le ' . $report->created_at->format('d M Y'),
                'date_archive' => $report->created_at,
                'property_id' => $report->property_id,
                'lease_id' => $report->lease_id,
            ];
        }

        // 3. Quittances archivées (par année, plus de 2 mois)
        $currentYear = Carbon::now()->year;
        
        foreach (range($currentYear - 5, $currentYear) as $year) {
            $yearStart = Carbon::createFromDate($year, 1, 1);
            $yearEnd = Carbon::createFromDate($year, 12, 31);
            $twoMonthsAgo = Carbon::now()->subMonths(2);

            // Skip si l'année est récente (pas encore archivée)
            if ($yearEnd->isAfter($twoMonthsAgo)) {
                continue;
            }

            $rentReceipts = RentReceipt::whereIn('property_id', $propertyIds)
                ->where('year', $year)
                ->where('status', 'paid')
                ->with(['property', 'lease.tenant'])
                ->get();

            if ($rentReceipts->isEmpty()) {
                continue;
            }

            $totalAmount = $rentReceipts->sum('rent_amount') + $rentReceipts->sum('charges_amount');
            $count = $rentReceipts->count();

            // Regrouper par bien pour l'affichage
            $groupedByProperty = $rentReceipts->groupBy('property_id');

            foreach ($groupedByProperty as $propertyId => $receipts) {
                $firstReceipt = $receipts->first();
                $propertyName = $firstReceipt->property ? ($firstReceipt->property->name ?? $firstReceipt->property->address) : 'N/A';
                $tenantName = $firstReceipt->lease && $firstReceipt->lease->tenant 
                    ? ($firstReceipt->lease->tenant->first_name . ' ' . $firstReceipt->lease->tenant->last_name)
                    : 'N/A';

                $totalForProperty = $receipts->sum('rent_amount') + $receipts->sum('charges_amount');
                $countForProperty = $receipts->count();

                $archives[] = [
                    'id' => 'quittance_' . $year . '_' . $propertyId,
                    'type' => 'QUITTANCES ' . $year,
                    'typeBadge' => 'QUITTANCES ' . $year,
                    'typeBadgeColor' => '#83C757',
                    'typeCategory' => 'Quittances',
                    'titre' => 'Quittances annuelles ' . $year,
                    'bien' => $tenantName . ' • ' . $propertyName,
                    'champ1Label' => 'PÉRIODE',
                    'champ1Value' => 'Année ' . $year,
                    'champ2Label' => 'NOMBRE',
                    'champ2Value' => $countForProperty . ' quittance' . ($countForProperty > 1 ? 's' : ''),
                    'champ3Label' => 'TOTAL ENCAISSÉ',
                    'champ3Value' => number_format($totalForProperty, 0, ',', ' ') . ' €',
                    'champ4Label' => '',
                    'champ4Value' => '',
                    'dateBas' => 'Archivé le 31 Déc ' . $year,
                    'date_archive' => $yearEnd,
                    'property_id' => $propertyId,
                    'lease_id' => $firstReceipt->lease_id,
                ];
            }
        }

        // 4. Documents archivés (status = archive)
        $documents = Document::whereIn('property_id', $propertyIds)
            ->where('status', 'archive')
            ->where('created_at', '<', Carbon::now()->subMonths(2))
            ->with(['property'])
            ->get();

        foreach ($documents as $doc) {
            $propertyName = $doc->property ? ($doc->property->name ?? $doc->property->address) : 'N/A';

            $categoryLabels = [
                'identity' => 'Identité',
                'financial' => 'Financier',
                'lease' => 'Bail',
                'inventory' => 'État des lieux',
                'insurance' => 'Assurance',
                'other' => 'Autre',
            ];

            $typeCategory = $categoryLabels[$doc->category] ?? 'Autres documents';

            $archives[] = [
                'id' => 'doc_' . $doc->id,
                'type' => strtoupper($typeCategory),
                'typeBadge' => strtoupper($typeCategory),
                'typeBadgeColor' => '#3b82f6',
                'typeCategory' => 'Autres documents',
                'titre' => $doc->name ?? 'Document',
                'bien' => $propertyName,
                'champ1Label' => 'TYPE',
                'champ1Value' => $doc->type ?? 'Document',
                'champ2Label' => 'DATE',
                'champ2Value' => $doc->created_at->format('d M Y'),
                'champ3Label' => 'TAILLE',
                'champ3Value' => $doc->file_size_formatted ?? 'N/A',
                'champ4Label' => '',
                'champ4Value' => '',
                'dateBas' => 'Archivé le ' . $doc->created_at->format('d M Y'),
                'date_archive' => $doc->created_at,
                'property_id' => $doc->property_id,
                'lease_id' => $doc->lease_id,
            ];
        }

        // Trier par date d'archivage décroissante
        $archives = collect($archives)->sortByDesc('date_archive')->values();

        // Calculer les statistiques
        $totalDocuments = count($archives);
        $bauxTermines = count($leases);
        $edlArchives = count($conditionReports);
        $quittancesArchives = collect($archives)->where('typeCategory', 'Quittances')->count();

        // Calculer la taille totale (approximative)
        $totalSize = $documents->sum('file_size') ?? 0;
        $totalSizeFormatted = $totalSize >= 1048576 
            ? number_format($totalSize / 1048576, 1) . ' MB'
            : number_format($totalSize / 1024, 1) . ' KB';

        return response()->json([
            'archives' => $archives,
            'stats' => [
                'total_documents' => $totalDocuments,
                'baux_termines' => $bauxTermines,
                'edl_archives' => $edlArchives,
                'quittances_archives' => $quittancesArchives,
                'total_size' => $totalSizeFormatted ?: '0 KB',
            ]
        ]);
    }

    /**
     * Obtenir les statistiques des archives
     */
    public function stats(Request $request): JsonResponse
    {
        $user = auth()->user();
        $landlordId = $user->landlord->id;

        $propertyIds = Property::where('landlord_id', $landlordId)->pluck('id')->toArray();

        if (empty($propertyIds)) {
            return response()->json([
                'total_documents' => 0,
                'baux_termines' => 0,
                'edl_archives' => 0,
                'quittances_archives' => 0,
                'total_size' => '0 KB',
            ]);
        }

        $twoMonthsAgo = Carbon::now()->subMonths(2);

        // Baux terminés
        $bauxTermines = Lease::whereIn('property_id', $propertyIds)
            ->whereNotNull('end_date')
            ->where('end_date', '<', Carbon::now())
            ->count();

        // EDL archivés
        $edlArchives = PropertyConditionReport::whereIn('property_id', $propertyIds)
            ->where('created_at', '<', $twoMonthsAgo)
            ->count();

        // Documents archivés
        $documentsArchives = Document::whereIn('property_id', $propertyIds)
            ->where('status', 'archive')
            ->where('created_at', '<', $twoMonthsAgo)
            ->count();

        $totalSize = Document::whereIn('property_id', $propertyIds)
            ->where('status', 'archive')
            ->sum('file_size');

        $totalSizeFormatted = $totalSize >= 1048576 
            ? number_format($totalSize / 1048576, 1) . ' MB'
            : number_format($totalSize / 1024, 1) . ' KB';

        return response()->json([
            'total_documents' => $bauxTermines + $edlArchives + $documentsArchives,
            'baux_termines' => $bauxTermines,
            'edl_archives' => $edlArchives,
            'quittances_archives' => 0, // À calculer séparément si nécessaire
            'total_size' => $totalSizeFormatted ?: '0 KB',
        ]);
    }
}
