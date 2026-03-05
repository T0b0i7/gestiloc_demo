<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // token validated in controller
    }

    public function rules(): array
    {
        return [
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
