<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteCoOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        // controller checks landlord role, keep true here
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_professional' => 'nullable|boolean',
            'license_number' => 'nullable|string|max:100',
            'address_billing' => 'nullable|string|max:500',
            'ifu' => 'nullable|string|max:50',
            'rccm' => 'nullable|string|max:50',
            'vat_number' => 'nullable|string|max:50',
            'meta' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
            'first_name.required' => 'Le prénom est obligatoire',
            'first_name.max' => 'Le prénom ne doit pas dépasser 100 caractères',
            'last_name.required' => 'Le nom est obligatoire',
            'last_name.max' => 'Le nom ne doit pas dépasser 100 caractères',
            'company_name.max' => 'Le nom de l\'entreprise ne doit pas dépasser 255 caractères',
            'phone.max' => 'Le numéro de téléphone ne doit pas dépasser 20 caractères',
            'license_number.max' => 'Le numéro de licence ne doit pas dépasser 100 caractères',
            'address_billing.max' => 'L\'adresse ne doit pas dépasser 500 caractères',
            'ifu.max' => 'L\'IFU ne doit pas dépasser 50 caractères',
            'rccm.max' => 'Le RCCM ne doit pas dépasser 50 caractères',
            'vat_number.max' => 'Le numéro de TVA ne doit pas dépasser 50 caractères',
        ];
    }
}
