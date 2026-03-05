<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        // IMPORTANT : on utilise le modèle Eloquent sous-jacent
        $m = $this->resource;

        $val = fn($v) => ($v === null || $v === '') ? null : $v;

        $property = ($m && method_exists($m, 'relationLoaded') && $m->relationLoaded('property')) ? $m->property : null;
        $tenant   = ($m && method_exists($m, 'relationLoaded') && $m->relationLoaded('tenant')) ? $m->tenant : null;

        $landlord = null;
        if ($property && method_exists($property, 'relationLoaded') && $property->relationLoaded('landlord')) {
            $landlord = $property->landlord;
        }

        $landlordUser = ($landlord && method_exists($landlord, 'relationLoaded') && $landlord->relationLoaded('user')) ? $landlord->user : null;
        $tenantUser   = ($tenant && method_exists($tenant, 'relationLoaded') && $tenant->relationLoaded('user')) ? $tenant->user : null;

        return [
            'id' => $m->id,
            'property_id' => $m->property_id,
            'tenant_id' => $m->tenant_id,
            'landlord_id' => $m->landlord_id,

            'title' => $val($m->title),
            'category' => $val($m->category),
            'priority' => $val($m->priority),
            'status' => $val($m->status),

            'description' => $val($m->description),
            'preferred_slots' => $m->preferred_slots ?? [],
            'photos' => $m->photos ?? [],

            'assigned_provider' => $val($m->assigned_provider),
            'resolved_at' => $m->resolved_at?->toDateTimeString(),

            'property' => $property ? [
                'id' => $property->id,
                'uuid' => $val($property->uuid),
                'address' => $val($property->address),
                'city' => $val($property->city),
                'zip_code' => $val($property->zip_code),
                'photos' => $property->photos ?? [],
                'landlord' => $landlord ? [
                    'id' => $landlord->id,
                    'first_name' => $val($landlord->first_name),
                    'last_name' => $val($landlord->last_name),
                    'company_name' => $val($landlord->company_name),
                    'address_billing' => $val($landlord->address_billing),
                    // email/phone viennent du user
                    'email' => $val($landlordUser?->email),
                    'phone' => $val($landlordUser?->phone),
                ] : null,
            ] : null,

            'tenant' => $tenant ? [
                'id' => $tenant->id,
                'first_name' => $val($tenant->first_name),
                'last_name' => $val($tenant->last_name),
                'email' => $val($tenantUser?->email),
                'phone' => $val($tenantUser?->phone),
            ] : null,

            'created_at' => $m->created_at?->toDateTimeString(),
            'updated_at' => $m->updated_at?->toDateTimeString(),
        ];
    }
}
