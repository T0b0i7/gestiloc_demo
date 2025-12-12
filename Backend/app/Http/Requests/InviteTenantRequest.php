<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
        ];
    }
}
