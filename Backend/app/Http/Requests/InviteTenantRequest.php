<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class InviteTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        // controller checks landlord role, keep true here
        return true;
    }

    public function rules(): array
    {
        return [
            // Champs de base (obligatoires)
            'email'                    => 'required|email',
            'first_name'               => 'required|string|max:100',
            'last_name'                => 'required|string|max:100',
            'phone'                    => 'nullable|string|max:20',

            // Informations personnelles supplémentaires (optionnelles)
            'birth_date'               => 'nullable|date',
            'birth_place'              => 'nullable|string|max:100',
            'address'                  => 'nullable|string|max:255',
            'city'                     => 'nullable|string|max:100',
            'country'                  => 'nullable|string|max:100',
            'marital_status'           => 'nullable|string|max:50',

            // Contact d'urgence
            'emergency_contact_name'   => 'nullable|string|max:200',
            'emergency_contact_phone'  => 'nullable|string|max:20',
            'emergency_contact_email'  => 'nullable|email',

            // Situation professionnelle
            'profession'               => 'nullable|string|max:150',
            'employer'                 => 'nullable|string|max:200',
            'contract_type'            => 'nullable|string|max:50',
            'monthly_income'           => 'nullable|numeric|min:0',
            'annual_income'            => 'nullable|numeric|min:0',

            // Informations du garant
            'has_guarantor'            => 'nullable|boolean',
            'guarantor_first_name'     => 'nullable|string|max:100',
            'guarantor_last_name'      => 'nullable|string|max:100',
            'guarantor_name'           => 'nullable|string|max:200',
            'guarantor_relationship'   => 'nullable|string|max:100',
            'guarantor_phone'          => 'nullable|string|max:20',
            'guarantor_email'          => 'nullable|email',
            'guarantor_profession'     => 'nullable|string|max:150',
            'guarantor_monthly_income' => 'nullable|numeric|min:0',
            'guarantor_annual_income'  => 'nullable|numeric|min:0',
            'guarantor_address'        => 'nullable|string|max:255',
            'guarantor_birth_date'     => 'nullable|date',
            'guarantor_birth_place'    => 'nullable|string|max:200',
            'guarantor_nationality'    => 'nullable|string|max:100',

            // Notes
            'notes'                    => 'nullable|string',

            // Type de locataire
            'tenant_type'              => 'nullable|string|max:50',

            // Documents (sera traité séparément)
            'documents'                => 'nullable|array',
            'documents.*'              => 'nullable|file|max:15360', // 15MB max par fichier
            'document_types'           => 'nullable|array',
        ];
    }

    protected function passedValidation()
    {
        $validated = $this->validated();
        Log::info('InviteTenantRequest validation passed:', $validated);
    }
}
