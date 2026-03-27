<?php
// app/Http/Controllers/Api/QuittanceController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class QuittanceController extends Controller
{
    /**
     * Afficher une quittance
     */
    public function show($id)
    {
        $user = Auth::user();

        // Chercher d'abord dans les paiements
        $payment = Payment::with(['lease.tenant.user', 'lease.property'])
            ->where('id', $id)
            ->first();

        if ($payment) {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $payment?->id,
                    'tenant_name' => trim(($payment?->lease?->tenant?->first_name ?? '') . ' ' . ($payment?->lease?->tenant?->last_name ?? '')) ?: 'Locataire',
                    'tenant_email' => $payment?->lease?->tenant?->user?->email ?? '',
                    'property_name' => $payment?->lease?->property?->name ?? 'Bien',
                    'amount' => $payment?->amount,
                    'date' => $payment?->created_at?->format('d/m/Y'),
                    'month' => $payment?->created_at?->format('m/Y'),
                ]
            ]);
        }

        // Chercher dans les factures
        $invoice = Invoice::with(['lease.tenant.user', 'lease.property'])
            ->where('id', $id)
            ->first();

        if ($invoice) {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $invoice?->id,
                    'tenant_name' => trim(($invoice?->lease?->tenant?->first_name ?? '') . ' ' . ($invoice?->lease?->tenant?->last_name ?? '')) ?: 'Locataire',
                    'tenant_email' => $invoice?->lease?->tenant?->user?->email ?? '',
                    'property_name' => $invoice?->lease?->property?->name ?? 'Bien',
                    'amount' => $invoice?->amount_total,
                    'date' => $invoice?->created_at?->format('d/m/Y'),
                    'month' => $invoice?->due_date?->format('m/Y'),
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Quittance non trouvée'
        ], 404);
    }

    /**
     * Télécharger le PDF de la quittance
     */
    public function downloadPdf($id)
    {
        $user = Auth::user();

        // Chercher dans les paiements
        $payment = Payment::with(['lease.tenant.user', 'lease.property'])
            ->where('id', $id)
            ->first();

        if ($payment) {
            $data = [
                'numero' => 'QUIT-' . str_pad($payment?->id ?? 0, 6, '0', STR_PAD_LEFT),
                'tenant_name' => trim(($payment?->lease?->tenant?->first_name ?? '') . ' ' . ($payment?->lease?->tenant?->last_name ?? '')) ?: 'Locataire',
                'tenant_address' => $payment?->lease?->tenant?->address ?? '',
                'property_address' => $payment?->lease?->property?->address ?? '',
                'period' => $payment?->created_at?->format('m/Y'),
                'amount' => number_format($payment?->amount ?? 0, 0, ',', ' ') . ' FCFA',
                'amount_letters' => $this->numberToWords($payment?->amount ?? 0) . ' francs CFA',
                'date' => $payment?->created_at?->format('d/m/Y'),
            ];

            $pdf = Pdf::loadView('pdf.quittances', $data);
            return $pdf->download('quittance-' . ($payment?->id ?? 'unknown') . '.pdf');
        }

        // Chercher dans les factures
        $invoice = Invoice::with(['lease.tenant.user', 'lease.property'])
            ->where('id', $id)
            ->first();

        if ($invoice) {
            $data = [
                'numero' => 'FACT-' . str_pad($invoice?->id ?? 0, 6, '0', STR_PAD_LEFT),
                'tenant_name' => trim(($invoice?->lease?->tenant?->first_name ?? '') . ' ' . ($invoice?->lease?->tenant?->last_name ?? '')) ?: 'Locataire',
                'tenant_address' => $invoice?->lease?->tenant?->address ?? '',
                'property_address' => $invoice?->lease?->property?->address ?? '',
                'period' => $invoice?->due_date?->format('m/Y'),
                'amount' => number_format($invoice?->amount_total ?? 0, 0, ',', ' ') . ' FCFA',
                'amount_letters' => $this->numberToWords($invoice?->amount_total ?? 0) . ' francs CFA',
                'date' => $invoice?->created_at?->format('d/m/Y'),
            ];

            $pdf = Pdf::loadView('pdf.quittances', $data);
            return $pdf->download('quittance-' . ($invoice?->id ?? 'unknown') . '.pdf');
        }

        return response()->json([
            'success' => false,
            'message' => 'Quittance non trouvée'
        ], 404);
    }

    /**
     * Envoyer la quittance par email
     */
    public function sendEmail(Request $request, $id)
    {
        try {
            $user = Auth::user();

            // Chercher dans les paiements
            $payment = Payment::with(['lease.tenant.user', 'lease.property'])
                ->where('id', $id)
                ->first();

            if ($payment) {
                $tenantEmail = $payment?->lease?->tenant?->user?->email ?? null;

                if (!$tenantEmail) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email du locataire non trouvé'
                    ], 400);
                }

                // Générer le PDF
                $data = [
                    'numero' => 'QUIT-' . str_pad($payment?->id ?? 0, 6, '0', STR_PAD_LEFT),
                    'tenant_name' => trim(($payment?->lease?->tenant?->first_name ?? '') . ' ' . ($payment?->lease?->tenant?->last_name ?? '')) ?: 'Locataire',
                    'tenant_address' => $payment?->lease?->tenant?->address ?? '',
                    'property_address' => $payment?->lease?->property?->address ?? '',
                    'period' => $payment?->created_at?->format('m/Y'),
                    'amount' => number_format($payment?->amount ?? 0, 0, ',', ' ') . ' FCFA',
                    'amount_letters' => $this->numberToWords($payment?->amount ?? 0) . ' francs CFA',
                    'date' => $payment?->created_at?->format('d/m/Y'),
                ];

                $pdf = Pdf::loadView('pdf.quittances', $data);

                // Créer le dossier temp s'il n'existe pas
                $tempPath = storage_path('app/temp');
                if (!file_exists($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $pdfPath = $tempPath . '/quittance-' . ($payment?->id ?? 'unknown') . '.pdf';
                $pdf->save($pdfPath);

                // Envoyer l'email
                Mail::send('emails.quittances', ['data' => $data], function ($message) use ($tenantEmail, $payment, $pdfPath) {
                    $message->to($tenantEmail)
                        ->subject('Votre quittance de loyer')
                        ->attach($pdfPath, [
                            'as' => 'quittance-' . ($payment?->id ?? 'unknown') . '.pdf',
                            'mime' => 'application/pdf',
                        ]);
                });

                // Supprimer le fichier temporaire
                if (file_exists($pdfPath)) {
                    unlink($pdfPath);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Quittance envoyée avec succès'
                ]);
            }

            // Chercher dans les factures
            $invoice = Invoice::with(['lease.tenant.user', 'lease.property'])
                ->where('id', $id)
                ->first();

            if ($invoice) {
                $tenantEmail = $invoice?->lease?->tenant?->user?->email ?? null;

                if (!$tenantEmail) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email du locataire non trouvé'
                    ], 400);
                }

                // Générer le PDF
                $data = [
                    'numero' => 'FACT-' . str_pad($invoice?->id ?? 0, 6, '0', STR_PAD_LEFT),
                    'tenant_name' => trim(($invoice?->lease?->tenant?->first_name ?? '') . ' ' . ($invoice?->lease?->tenant?->last_name ?? '')) ?: 'Locataire',
                    'tenant_address' => $invoice?->lease?->tenant?->address ?? '',
                    'property_address' => $invoice?->lease?->property?->address ?? '',
                    'period' => $invoice?->due_date?->format('m/Y'),
                    'amount' => number_format($invoice?->amount_total ?? 0, 0, ',', ' ') . ' FCFA',
                    'amount_letters' => $this->numberToWords($invoice?->amount_total ?? 0) . ' francs CFA',
                    'date' => $invoice?->created_at?->format('d/m/Y'),
                ];

                $pdf = Pdf::loadView('pdfs.quittance', $data);

                // Créer le dossier temp s'il n'existe pas
                $tempPath = storage_path('app/temp');
                if (!file_exists($tempPath)) {
                    mkdir($tempPath, 0755, true);
                }

                $pdfPath = $tempPath . '/quittance-' . ($invoice?->id ?? 'unknown') . '.pdf';
                $pdf->save($pdfPath);

                // Envoyer l'email
                Mail::send('emails.quittances', ['data' => $data], function ($message) use ($tenantEmail, $invoice, $pdfPath) {
                    $message->to($tenantEmail)
                        ->subject('Votre quittance de loyer')
                        ->attach($pdfPath, [
                            'as' => 'quittance-' . ($invoice?->id ?? 'unknown') . '.pdf',
                            'mime' => 'application/pdf',
                        ]);
                });

                // Supprimer le fichier temporaire
                if (file_exists($pdfPath)) {
                    unlink($pdfPath);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Quittance envoyée avec succès'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Quittance non trouvée'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convertir un nombre en lettres
     */
    private function numberToWords($number)
    {
        $intPart = (int) $number;
        $decimalPart = round(($number - $intPart) * 100);

        if ($intPart == 0) {
            $result = 'zéro';
        } else {
            $result = $this->convertNumberToFrench($intPart);
        }

        if ($decimalPart > 0) {
            $result .= ' virgule ' . $this->convertNumberToFrench($decimalPart);
        }

        return $result;
    }

    /**
     * Convertir un nombre en français (simplifié)
     */
    private function convertNumberToFrench($number)
    {
        if ($number < 1000) {
            return (string) $number;
        }

        $millions = floor($number / 1000000);
        $rest = $number % 1000000;

        if ($millions > 0) {
            return $millions . ' million' . ($millions > 1 ? 's' : '') .
                   ($rest > 0 ? ' ' . $this->convertNumberToFrench($rest) : '');
        }

        $thousands = floor($number / 1000);
        $rest = $number % 1000;

        if ($thousands > 0) {
            return $thousands . ' mille' . ($rest > 0 ? ' ' . $this->convertNumberToFrench($rest) : '');
        }

        return (string) $number;
    }
}
