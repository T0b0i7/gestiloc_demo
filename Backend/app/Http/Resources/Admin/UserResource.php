<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            /* ======================
             * IDENTITÉ TECHNIQUE
             * ====================== */
            'id' => $this->id,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status ?? 'active',
            'roles' => $this->getRoleNames(),

            /* ======================
             * TYPE MÉTIER NORMALISÉ
             * ====================== */
            'user_type' => $this->resolveUserType(),

            /* ======================
             * PROFILS LIÉS (OPTIONNELS)
             * ====================== */
            'landlord' => $this->whenLoaded('landlord', function () {
                return [
                    'id' => $this->landlord->id,
                    'owner_type' => $this->landlord->owner_type, // landlord | co_owner
                    'first_name' => $this->landlord->first_name,
                    'last_name' => $this->landlord->last_name,
                    'company_name' => $this->landlord->company_name,
                    'vat_number' => $this->landlord->vat_number,
                ];
            }),

            'tenant' => $this->whenLoaded('tenant', function () {
                return [
                    'id' => $this->tenant->id,
                    'first_name' => $this->tenant->first_name,
                    'last_name' => $this->tenant->last_name,
                    'status' => $this->tenant->status,
                    'solvency_score' => $this->tenant->solvency_score,
                ];
            }),

            'agency' => $this->whenLoaded('agency', function () {
                return [
                    'id' => $this->agency->id,
                    'agency_type' => $this->agency->agency_type, // agency | co_owner_agency
                    'company_name' => $this->agency->company_name,
                    'email' => $this->agency->email,
                    'phone' => $this->agency->phone,
                ];
            }),

            /* ======================
             * MÉTA SYSTÈME
             * ====================== */
            'last_activity_at' => optional($this->last_activity_at)?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
        ];
    }

    /**
     * Détermination DU type métier unique
     */
    private function resolveUserType(): string
    {
        if ($this->hasRole('admin')) {
            return 'admin';
        }

        if ($this->hasRole('tenant')) {
            return 'tenant';
        }

        if ($this->hasRole('landlord') && $this->landlord) {
            return $this->landlord->isCoOwner()
                ? 'co_owner'
                : 'landlord';
        }

        if ($this->hasRole('agency') && $this->agency) {
            return $this->agency->isCoOwnerAgency()
                ? 'co_owner_agency'
                : 'agency';
        }

        return 'unknown';
    }
}
