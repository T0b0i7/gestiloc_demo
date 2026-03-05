<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // L'inscription est ouverte
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|unique:users,phone',
            'company_name' => 'required|string|max:255',
            'license_number' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'id_type' => 'nullable|string|max:50',
            'id_number' => 'nullable|string|max:100',
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
            'email.unique' => 'Cet email est déjà utilisé',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.min' => 'Le mot de passe doit faire au moins 8 caractères',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas',
            'phone.required' => 'Le téléphone est obligatoire',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé',
            'company_name.required' => 'Le nom de l\'agence est obligatoire',
            'license_number.max' => 'Le numéro de licence ne doit pas dépasser 100 caractères',
        ];
    }
}
