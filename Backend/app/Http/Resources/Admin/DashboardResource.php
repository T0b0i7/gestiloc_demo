<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            // KPI utilisateurs
            'kpi' => [
                'total_users' => $this->kpi['total_users'] ?? 0,
                'online_users' => $this->kpi['online_users'] ?? 0,
                'offline_users' => $this->kpi['offline_users'] ?? 0,
                'online_percentage' => $this->kpi['online_percentage'] ?? 0,
                'total_landlords' => $this->kpi['total_landlords'] ?? 0,
                'total_tenants' => $this->kpi['total_tenants'] ?? 0,
                'suspended_users' => $this->kpi['suspended_users'] ?? 0,
                'deactivated_users' => $this->kpi['deactivated_users'] ?? 0,
                'user_growth_rate' => $this->kpi['user_growth_rate'] ?? 0,
                'new_users_this_month' => $this->kpi['new_users_this_month'] ?? 0,
            ],

            // Propriétés
            'properties' => [
                'total_properties' => $this->properties['total_properties'] ?? 0,
                'new_properties_this_month' => $this->properties['new_properties_this_month'] ?? 0,
                'global_occupancy_rate' => $this->properties['global_occupancy_rate'] ?? 0,
                'properties_with_leases' => $this->properties['properties_with_leases'] ?? 0,
                'vacant_properties' => $this->properties['vacant_properties'] ?? 0,
            ],

            // Baux
            'leases' => [
                'total_leases' => $this->leases['total_leases'] ?? 0,
                'active_leases' => $this->leases['active_leases'] ?? 0,
                'new_leases_this_month' => $this->leases['new_leases_this_month'] ?? 0,
                'lease_activation_rate' => $this->leases['lease_activation_rate'] ?? 0,
            ],

            // Finance
            'financial' => [
                'monthly_expected_rent' => $this->financial['monthly_expected_rent'] ?? 0,
                'monthly_collected_rent' => $this->financial['monthly_collected_rent'] ?? 0,
                'collection_rate' => $this->financial['collection_rate'] ?? 0,
                'revenue_growth_rate' => $this->financial['revenue_growth_rate'] ?? 0,
                'last_month_expected_rent' => $this->financial['last_month_expected_rent'] ?? 0,
                'last_month_collected_rent' => $this->financial['last_month_collected_rent'] ?? 0,
            ],

            // Paiements
            'payments' => [
                'total_payments' => $this->payments['total_payments'] ?? 0,
                'fedapay_payments' => $this->payments['fedapay_payments'] ?? 0,
                'successful_payments' => $this->payments['successful_payments'] ?? 0,
                'fedapay_conversion_rate' => $this->payments['fedapay_conversion_rate'] ?? 0,
            ],

            // Documents
            'documents' => [
                'rent_receipts_count' => $this->documents['rent_receipts_count'] ?? 0,
                'property_condition_reports_count' => $this->documents['property_condition_reports_count'] ?? 0,
                'contracts_count' => $this->documents['contracts_count'] ?? 0,
                'total_documents' => $this->documents['total_documents'] ?? 0,
            ],

            // Maintenance / tickets
            'maintenance' => [
                'total_requests' => $this->maintenance['total_requests'] ?? 0,
                'open_requests' => $this->maintenance['open_requests'] ?? 0,
                'in_progress_requests' => $this->maintenance['in_progress_requests'] ?? 0,
                'resolved_requests' => $this->maintenance['resolved_requests'] ?? 0,
            ],

            // Graphiques
            'charts' => [
                'revenue_trend' => $this->charts['revenue_trend'] ?? [],
                'online_by_role' => $this->charts['online_by_role'] ?? [],
            ],

            // Activité récente
            'recent_activity' => collect($this->recent_activity ?? [])
                ->map(fn($item) => [
                    'type' => $item['type'] ?? '',
                    'description' => $item['description'] ?? '',
                    'property' => $item['property'] ?? null,
                    'tenant' => $item['tenant'] ?? null,
                    'landlord' => $item['landlord'] ?? null,
                    'month' => $item['month'] ?? null,
                    'created_at' => $item['created_at'] ?? now()->toISOString(),
                ])->toArray(),

            // Date de mise à jour
            'updated_at' => $this->updated_at ?? now()->toISOString(),
        ];
    }
}
