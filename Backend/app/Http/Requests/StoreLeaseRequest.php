<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // controller checks ownership and tenant
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'tenant_id' => 'required|exists:tenants,id',
            'start_date' => 'required|date|after:today',
            'end_date' => 'nullable|date|after:start_date',
            'rent_amount' => 'required|numeric|min:0.01|max:99999.99',
            'deposit' => 'nullable|numeric|min:0|max:99999.99',
            'type' => 'required|in:nu,meuble',
            'status' => 'nullable|in:pending,active,terminated',
            'terms' => 'nullable|array',
            'terms.*' => 'nullable|string|max:1000',
        ];
    }
}
