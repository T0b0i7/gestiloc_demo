<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\RentReceipt;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;
use PDF;
use Carbon\Carbon;

class CoOwnerRentReceiptController extends Controller
{
    /**
     * Liste des quittances
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return view('co-owner.unauthorized')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Récupérer les quittances pour les biens délégués à ce co-propriétaire
        $receipts = RentReceipt::where('landlord_id', $user->id)
            ->with(['property', 'lease', 'tenant.user'])
            ->orderBy('issued_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('co-owner.quittances.index', compact('receipts', 'user'));
    }

    /**
     * Formulaire création quittance
     */
    public function create(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Récupérer les baux pour les propriétés déléguées à ce co-propriétaire
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        $leases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'active')
            ->with(['property', 'tenant.user'])
            ->get();

        return view('co-owner.quittances.create', compact('leases', 'user'));
    }

    /**
     * Enregistrer une quittance
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé')->withInput();
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé')->withInput();
        }

        $validated = $request->validate([
            'lease_id' => 'required|exists:leases,id',
            'paid_month' => 'required|date_format:Y-m',
            'issued_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'send_email' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            // Récupérer le bail avec les relations
            $lease = Lease::with(['property', 'tenant.user'])->find($validated['lease_id']);

            if (!$lease) {
                throw new \Exception('Bail non trouvé');
            }

            // Vérifier que la propriété est déléguée à ce co-propriétaire
            $delegation = PropertyDelegation::where('property_id', $lease->property_id)
                ->where('co_owner_id', $coOwner->id)
                ->where('status', 'active')
                ->first();

            if (!$delegation) {
                throw new \Exception('Cette propriété ne vous est pas déléguée');
            }

            // Vérifier si une quittance existe déjà pour ce mois
            $existingReceipt = RentReceipt::where('lease_id', $lease->id)
                ->where('paid_month', $validated['paid_month'])
                ->first();

            if ($existingReceipt) {
                throw new \Exception('Une quittance existe déjà pour ce mois et ce bail');
            }

            // Créer la référence
            [$year, $month] = explode('-', $validated['paid_month']);
            $receiptCount = RentReceipt::whereYear('issued_date', $year)
                ->whereMonth('issued_date', $month)
                ->count();
            $reference = 'RR-' . $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' .
                        str_pad((string) ($receiptCount + 1), 4, '0', STR_PAD_LEFT);

            // Créer la quittance
            $receipt = RentReceipt::create([
                'lease_id' => $lease->id,
                'property_id' => $lease->property_id,
                'landlord_id' => $user->id,
                'tenant_id' => $lease->tenant_id,
                'paid_month' => $validated['paid_month'],
                'month' => (int) $month,
                'year' => (int) $year,
                'issued_date' => $validated['issued_date'],
                'amount_paid' => $validated['amount_paid'],
                'reference' => $reference,
                'notes' => $validated['notes'],
                'status' => 'issued',
                'type' => 'independent',
            ]);

            DB::commit();

            Log::info('Quittance créée par co-propriétaire', [
                'receipt_id' => $receipt->id,
                'co_owner_id' => $coOwner->id,
                'lease_id' => $lease->id,
                'tenant_id' => $lease->tenant_id,
            ]);

            // Générer le PDF
            $pdfPath = $this->generatePdf($receipt);

            // Envoyer l'email si demandé
            if ($request->has('send_email') && $request->send_email) {
                $emailSent = $this->sendReceiptEmail($receipt, $pdfPath);

                if ($emailSent) {
                    return redirect()
                        ->route('co-owner.quittances.index')
                        ->with('success', 'Quittance créée et envoyée par email avec succès');
                } else {
                    return redirect()
                        ->route('co-owner.quittances.index')
                        ->with('success', 'Quittance créée avec succès (email non envoyé - adresse email non trouvée)');
                }
            }

            return redirect()
                ->route('co-owner.quittances.index')
                ->with('success', 'Quittance créée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création quittance', [
                'error' => $e->getMessage(),
                'co_owner_id' => $coOwner->id,
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->with('error', 'Erreur lors de la création de la quittance: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Générer le PDF de la quittance
     */
    private function generatePdf(RentReceipt $receipt)
    {
        try {
            // Charger les relations nécessaires
            $receipt->load(['property', 'lease', 'tenant.user', 'landlord']);

            // Préparer les données pour la vue
            $data = [
                'receipt' => $receipt,
                'property' => $receipt->property,
                'lease' => $receipt->lease,
                'tenant' => $receipt->tenant,
                'landlord' => $receipt->landlord,
                'date_emission' => Carbon::parse($receipt->issued_date)->format('d/m/Y'),
                'periode' => Carbon::parse($receipt->paid_month . '-01')->format('m/Y'),
                'montant_lettres' => $this->numberToWords($receipt->amount_paid),
            ];

            // Générer le PDF à partir du fichier Blade
            $pdf = PDF::loadView('pdf.quittance', $data)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'defaultFont' => 'Arial',
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                ]);

            // Sauvegarder le PDF
            $filename = 'quittance_' . $receipt->reference . '_' . time() . '.pdf';
            $path = storage_path('app/public/quittances/' . $filename);

            // Créer le répertoire s'il n'existe pas
            if (!file_exists(dirname($path))) {
                mkdir(dirname($path), 0755, true);
            }

            $pdf->save($path);

            return $path;

        } catch (\Exception $e) {
            Log::error('Erreur génération PDF quittance', [
                'error' => $e->getMessage(),
                'receipt_id' => $receipt->id,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Envoyer la quittance par email
     */
    private function sendReceiptEmail(RentReceipt $receipt, $pdfPath)
    {
        try {
            // Charger le locataire avec son utilisateur
            $receipt->load(['tenant.user', 'property']);

            // Accéder à l'email via la relation user
            $tenantEmail = $receipt->tenant->user->email ?? null;

            if (!$tenantEmail) {
                Log::warning('Email du locataire non trouvé', [
                    'receipt_id' => $receipt->id,
                    'tenant_id' => $receipt->tenant_id,
                    'user_id' => $receipt->tenant->user_id ?? null
                ]);

                return false;
            }

            $data = [
                'tenant_name' => $receipt->tenant->first_name . ' ' . $receipt->tenant->last_name,
                'property_address' => $receipt->property->address,
                'periode' => Carbon::parse($receipt->paid_month . '-01')->format('m/Y'),
                'montant' => number_format($receipt->amount_paid, 2, ',', ' ') . ' FCFA',
                'reference' => $receipt->reference,
                'date_emission' => Carbon::parse($receipt->issued_date)->format('d/m/Y'),
            ];

            Mail::send('emails.quittance', $data, function ($message) use ($tenantEmail, $receipt, $pdfPath, $data) {
                $message->to($tenantEmail)
                    ->subject('Quittance de loyer - ' . $receipt->property->name . ' - ' . $data['periode'])
                    ->attach($pdfPath, [
                        'as' => 'quittance_' . $receipt->reference . '.pdf',
                        'mime' => 'application/pdf',
                    ]);
            });

            Log::info('Email quittance envoyé', [
                'receipt_id' => $receipt->id,
                'tenant_email' => $tenantEmail,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Erreur envoi email quittance', [
                'error' => $e->getMessage(),
                'receipt_id' => $receipt->id,
                'tenant_email' => $tenantEmail ?? 'null',
            ]);

            return false;
        }
    }

    /**
     * Télécharger le PDF
     */
    public function downloadPdf(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            abort(403, 'Non autorisé');
        }

        $receipt = RentReceipt::findOrFail($id);

        // Vérifier que la quittance appartient à ce co-propriétaire
        if ($receipt->landlord_id != $user->id) {
            abort(403, 'Cette quittance ne vous appartient pas');
        }

        try {
            // Générer le PDF
            $pdfPath = $this->generatePdf($receipt);

            return response()->download($pdfPath, 'quittance_' . $receipt->reference . '.pdf');

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement PDF quittance', [
                'error' => $e->getMessage(),
                'receipt_id' => $receipt->id,
            ]);

            abort(404, 'Fichier non trouvé');
        }
    }

    /**
     * Envoyer par email (manuellement)
     */
    public function sendByEmail(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $receipt = RentReceipt::findOrFail($id);

        // Vérifier que la quittance appartient à ce co-propriétaire
        if ($receipt->landlord_id != $user->id) {
            return back()->with('error', 'Cette quittance ne vous appartient pas');
        }

        try {
            // Générer le PDF
            $pdfPath = $this->generatePdf($receipt);

            // Envoyer l'email
            $emailSent = $this->sendReceiptEmail($receipt, $pdfPath);

            if ($emailSent) {
                return back()->with('success', 'Quittance envoyée par email avec succès');
            } else {
                return back()->with('warning', 'Quittance créée mais email non envoyé (adresse email non trouvée)');
            }

        } catch (\Exception $e) {
            Log::error('Erreur envoi manuel email quittance', [
                'error' => $e->getMessage(),
                'receipt_id' => $receipt->id,
            ]);

            return back()->with('error', 'Erreur lors de l\'envoi: ' . $e->getMessage());
        }
    }

    /**
     * Supprimer une quittance
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $receipt = RentReceipt::findOrFail($id);

        // Vérifier que la quittance appartient à ce co-propriétaire
        if ($receipt->landlord_id != $user->id) {
            return back()->with('error', 'Cette quittance ne vous appartient pas');
        }

        try {
            $receipt->delete();

            return redirect()
                ->route('co-owner.quittances.index')
                ->with('success', 'Quittance supprimée avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur suppression quittance', [
                'error' => $e->getMessage(),
                'receipt_id' => $receipt->id,
            ]);

            return back()->with('error', 'Erreur lors de la suppression: ' . $e->getMessage());
        }
    }

    /**
     * Convertir un nombre en lettres (pour le montant en lettres)
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

        return ucfirst($result) . ' francs CFA';
    }

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

    /**
     * Récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        // 1. Vérifier Sanctum token
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // 2. Vérifier token paramètre
        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // 3. Session web
        if (auth()->check()) {
            return auth()->user();
        }

        // 4. Header Authorization
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = str_replace('Bearer ', '', $authHeader);
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        return null;
    }
}
