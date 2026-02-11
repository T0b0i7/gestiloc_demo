<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyDelegation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class CoOwnerInvoiceController extends Controller
{
    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        if (auth()->check()) {
            return auth()->user();
        }

        return null;
    }

    /**
     * Affiche la liste des factures avec filtres
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        if (!$user->hasRole('co_owner')) {
            abort(403, 'Accès réservé aux copropriétaires.');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            abort(403, 'Profil copropriétaire non trouvé.');
        }

        // Récupérer les biens délégués
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        // Query de base
        $query = Invoice::with(['lease.property', 'lease.tenant.user'])
            ->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                $q->whereIn('id', $delegatedPropertyIds);
            });

        // Filtrage par type (depuis les tabs)
        if ($request->has('type') && $request->type != '') {
            $query->where('type', $request->type);
        }

        // Filtrage par type de facture (depuis le select)
        if ($request->has('invoice_type') && $request->invoice_type != '') {
            $query->where('type', $request->invoice_type);
        }

        // Filtrage par bien
        if ($request->has('property_id') && $request->property_id != '') {
            $query->whereHas('lease', function($q) use ($request) {
                $q->where('property_id', $request->property_id);
            });
        }

        // Recherche textuelle
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('lease.tenant.user', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('lease.property', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Pagination
        $invoices = $query->latest('due_date')->paginate(12);

        // Préserver les paramètres de recherche dans la pagination
        $invoices->appends($request->all());

        // Récupérer les propriétés pour le filtre
        $properties = Property::whereIn('id', $delegatedPropertyIds)->get();

        // Statistiques (sur toutes les factures, pas juste celles filtrées)
        $allInvoices = Invoice::whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
            $q->whereIn('id', $delegatedPropertyIds);
        })->get();

        $stats = [
            'total_pending' => $allInvoices->where('status', 'pending')->sum('amount_total'),
            'total_paid' => $allInvoices->where('status', 'paid')->sum('amount_total'),
            'total_overdue' => $allInvoices->where('status', 'pending')
                ->where('due_date', '<', now())
                ->sum('amount_total'),
            'count_pending' => $allInvoices->where('status', 'pending')->count(),
            'count_paid' => $allInvoices->where('status', 'paid')->count(),
            'count_overdue' => $allInvoices->where('status', 'pending')
                ->where('due_date', '<', now())
                ->count(),
        ];

        return view('co-owner.invoices.index', compact('invoices', 'stats', 'properties'));
    }

    /**
     * Affiche le formulaire de création de facture
     */
    public function create(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        if (!$user->hasRole('co_owner')) {
            abort(403, 'Accès réservé aux copropriétaires.');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            abort(403, 'Profil copropriétaire non trouvé.');
        }

        // Récupérer les biens délégués
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        // Récupérer uniquement les baux ACTIFS pour les biens délégués
        $leases = Lease::with(['property', 'tenant.user'])
            ->where('status', 'active')
            ->whereHas('property', function($q) use ($delegatedPropertyIds) {
                $q->whereIn('id', $delegatedPropertyIds);
            })
            ->get();

        Log::info('=== FORMULAIRE CRÉATION FACTURE (COPRIO) ===', [
            'co_owner_id' => $coOwner->id,
            'leases_count' => $leases->count(),
            'leases' => $leases->map(function($lease) {
                return [
                    'id' => $lease->id,
                    'property' => $lease->property->name ?? null,
                    'tenant' => $lease->tenant->user->name ?? null,
                    'rent' => $lease->rent_amount
                ];
            })->toArray()
        ]);

        return view('co-owner.invoices.create', compact('leases', 'coOwner'));
    }

    /**
     * Enregistre une nouvelle facture
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        if (!$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé')->withInput();
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil copropriétaire non trouvé')->withInput();
        }

        // Validation
        $validated = $request->validate([
            'lease_id' => [
                'required',
                'exists:leases,id',
                function ($attribute, $value, $fail) use ($coOwner) {
                    // Vérifier que le bail appartient à un bien délégué
                    $lease = Lease::with('property')->find($value);

                    if (!$lease) {
                        $fail('Bail non trouvé.');
                        return;
                    }

                    $hasDelegation = PropertyDelegation::where('property_id', $lease->property_id)
                        ->where('co_owner_id', $coOwner->id)
                        ->where('status', 'active')
                        ->exists();

                    if (!$hasDelegation) {
                        $fail('Vous ne pouvez pas créer de facture pour ce bail.');
                    }
                }
            ],
            'type' => 'required|in:rent,deposit,charge,repair',
            'due_date' => 'required|date|after:today',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after:period_start',
            'amount_total' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:card,mobile_money,virement,cheque,especes,fedapay',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $lease = Lease::find($validated['lease_id']);

            // Générer un numéro de facture unique
            $invoiceNumber = 'FACT-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 5, '0', STR_PAD_LEFT);

            // Créer la facture
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'lease_id' => $validated['lease_id'],
                'type' => $validated['type'],
                'due_date' => $validated['due_date'],
                'period_start' => $validated['period_start'],
                'period_end' => $validated['period_end'],
                'amount_total' => $validated['amount_total'],
                'payment_method' => $validated['payment_method'],
                'status' => 'pending',
                'description' => $validated['description'] ?? null,
                'meta' => [
                    'created_by_co_owner' => $coOwner->id,
                    'created_by_co_owner_name' => $coOwner->getDisplayNameAttribute(),
                    'created_at' => now()->toDateTimeString(),
                ],
            ]);

            // Optionnel : Créer un lien de paiement
            if ($request->has('create_payment_link')) {
                try {
                    $token = Str::random(48);
                    $expires = now()->addHours(24);

                    \App\Models\PaymentLink::create([
                        'invoice_id' => $invoice->id,
                        'tenant_id' => $lease->tenant_id,
                        'token' => $token,
                        'expires_at' => $expires,
                    ]);

                    $invoice->update([
                        'payment_link_token' => $token,
                        'payment_link_expires_at' => $expires,
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Erreur création lien paiement', ['error' => $e->getMessage()]);
                }
            }

            DB::commit();

            Log::info('=== FACTURE CRÉÉE PAR COPRIO ===', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoiceNumber,
                'lease_id' => $validated['lease_id'],
                'co_owner_id' => $coOwner->id,
                'amount' => $validated['amount_total'],
                'type' => $validated['type'],
            ]);

            return redirect()
                ->route('co-owner.invoices.index')
                ->with('success', 'Facture créée avec succès ! N° ' . $invoiceNumber);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur création facture par co-propriétaire', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $validated,
            ]);

            return back()
                ->with('error', 'Erreur lors de la création de la facture: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Affiche les détails d'une facture
     */
    public function show(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            abort(403, 'Profil copropriétaire non trouvé.');
        }

        $invoice = Invoice::with(['lease.property', 'lease.tenant.user', 'transactions'])
            ->findOrFail($id);

        // Vérifier l'accès
        $hasAccess = PropertyDelegation::where('property_id', $invoice->lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé à cette facture.');
        }

        return view('co-owner.invoices.show', compact('invoice'));
    }

    /**
     * Télécharge le PDF d'une facture
     */
    public function downloadPdf(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            abort(403);
        }

        $invoice = Invoice::with(['lease.property', 'lease.tenant.user'])->findOrFail($id);

        // Vérifier l'accès
        $hasAccess = PropertyDelegation::where('property_id', $invoice->lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403);
        }

        try {
            $type = $invoice->status === 'paid' ? 'quittance' : 'avis_echeance';
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('co-owner.invoices.pdf', compact('invoice', 'type'));

            $filename = $type . '_' . ($invoice->invoice_number ?? $invoice->id) . '_' . date('Y-m-d') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Erreur génération PDF facture', ['error' => $e->getMessage()]);
            return back()->with('error', 'Erreur lors de la génération du PDF');
        }
    }

    /**
     * Envoyer un rappel par email
     */
    public function sendReminder(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Non autorisé');
        }

        $invoice = Invoice::with(['lease.tenant.user'])->findOrFail($id);

        // Vérifier l'accès
        $hasAccess = PropertyDelegation::where('property_id', $invoice->lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            return back()->with('error', 'Accès non autorisé');
        }

        if ($invoice->status === 'paid') {
            return back()->with('error', 'Cette facture est déjà payée');
        }

        $tenant = $invoice->lease->tenant;

        if ($tenant && $tenant->user && $tenant->user->email) {
            try {
                \Illuminate\Support\Facades\Mail::to($tenant->user->email)
                    ->queue(new \App\Mail\PaymentReminderMail($invoice));

                $invoice->update(['reminder_sent_at' => now()]);

                return back()->with('success', 'Rappel envoyé avec succès');
            } catch (\Exception $e) {
                return back()->with('error', 'Erreur lors de l\'envoi du rappel');
            }
        }

        return back()->with('error', 'Email du locataire non trouvé');
    }
}
