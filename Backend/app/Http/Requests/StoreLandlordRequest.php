<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLandlordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public registration
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email:rfc,dns|unique:users,email',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'phone' => 'required|string|regex:/^[\+]?[0-9\s\-\(\)]{10,15}$/|unique:users,phone',
            'first_name' => 'required|string|regex:/^[a-zA-ZÀ-ÿ\s\-]+$/u|max:100',
            'last_name' => 'required|string|regex:/^[a-zA-ZÀ-ÿ\s\-]+$/u|max:100',
            'company_name' => 'nullable|string|max:255|regex:/^[a-zA-Z0-9À-ÿ\s\-\&\.\,]+$/u',
            'address_billing' => 'nullable|string|max:500',
            'vat_number' => 'nullable|string|regex:/^[A-Z]{2}[0-9]{2,12}$/i',
        ];
    }
}
