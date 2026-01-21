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
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'is_professional' => 'nullable|boolean',
            'license_number' => 'nullable|string|max:100',
            'address_billing' => 'nullable|string|max:500',
            'ifu' => 'nullable|string|max:50',
            'rccm' => 'nullable|string|max:50',
            'vat_number' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
            'first_name.max' => 'Le prénom ne doit pas dépasser 100 caractères',
            'last_name.max' => 'Le nom ne doit pas dépasser 100 caractères',
        ];
    }
}
