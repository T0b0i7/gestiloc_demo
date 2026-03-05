<?php

namespace App\Http\Controllers\Api\Contract;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class RentalContractController extends Controller
{
    public function generatePdf(Request $request)
    {
        $data = [
            'landlord' => [
                'name' => $request->input('landlord.name'),
                'address' => $request->input('landlord.address'),
                'phone' => $request->input('landlord.phone'),
                'email' => $request->input('landlord.email'),
                // Les champs id_type et id_number sont retirés pour les landlords
                // Ils ne doivent exister que pour les co-owners
            ],
            'tenant' => [
                'name' => $request->input('tenant.name'),
                'address' => $request->input('tenant.address'),
                'phone' => $request->input('tenant.phone'),
                'email' => $request->input('tenant.email'),
                'id_type' => $request->input('tenant.id_type'),
                'id_number' => $request->input('tenant.id_number'),
            ],
            'property' => [
                'address' => $request->input('property.address'),
                'floor' => $request->input('property.floor'),
                'type' => $request->input('property.type'),
                'area' => $request->input('property.area'),
                'rooms' => $request->input('property.rooms'),
                'has_parking' => $request->input('property.has_parking'),
                'equipment' => $request->input('property.equipment', []),
            ],
            'contract' => [
                'start_date' => $request->input('contract.start_date'),
                'end_date' => $request->input('contract.end_date'),
                'rent_amount' => $request->input('contract.rent_amount'),
                'deposit_amount' => $request->input('contract.deposit_amount'),
                'included_charges' => $request->input('contract.included_charges', []),
                'payment_frequency' => $request->input('contract.payment_frequency', 'monthly'),
                'payment_method' => $request->input('contract.payment_method', 'bank_transfer'),
                'notice_period' => $request->input('contract.notice_period', 1), // in months
            ],
            'current_date' => Carbon::now()->format('d/m/Y'),
        ];

        $pdf = PDF::loadView('contracts.rental', $data);
        return $pdf->download('contrat-location-' . now()->format('Y-m-d') . '.pdf');
    }
}
