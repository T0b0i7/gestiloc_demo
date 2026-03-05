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
            'email' => 'required|email',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
        ];
    }

    protected function passedValidation()
    {
        $validated = $this->validated();
        Log::info('InviteTenantRequest validation passed:', $validated);
        Log::info('Phone in validated data:', ['phone' => $validated['phone'] ?? 'null']);
    }
}
