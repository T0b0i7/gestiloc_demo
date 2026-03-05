<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'phone' => $this->phone,
            'roles' => $this->getRoleNames(),

            'type' => $this->resolveUserType(),

            'profile' => $this->when(true, fn () => $this->profileData()),

            'created_at' => $this->created_at->toISOString(),
        ];
    }

    private function resolveUserType(): string
    {
        if ($this->hasRole('admin')) return 'admin';
        if ($this->hasRole('tenant')) return 'tenant';

        if ($this->hasRole('landlord') && $this->landlord) {
            return $this->landlord->owner_type === 'co_owner'
                ? 'co_owner'
                : 'landlord';
        }

        if ($this->hasRole('agency')) return 'agency';

        return 'unknown';
    }

    private function profileData(): array|null
    {
        return match ($this->resolveUserType()) {
            'tenant' => $this->tenant,
            'landlord', 'co_owner' => $this->landlord,
            'agency' => $this->agency,
            default => null,
        };
    }
}
