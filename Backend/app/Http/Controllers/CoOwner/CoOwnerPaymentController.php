<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Tenant;
use App\Models\PropertyDelegation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;
use Barryvdh\DomPDF\Facade\Pdf;

class CoOwnerPaymentController extends Controller
{
    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié (API + Web)
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
     * Affiche la page de gestion des paiements avec statistiques et liste
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

        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $paymentsQuery = Payment::query()
            ->with(['lease.property', 'lease.tenant.user', 'invoice'])
            ->whereHas('lease.property', function($sq) use ($delegatedPropertyIds) {
                $sq->whereIn('id', $delegatedPropertyIds);
            });

        // Filtre par bien
        if ($request->filled('property_id') && $request->property_id !== 'all') {
            $paymentsQuery->whereHas('lease', function($q) use ($request) {
                $q->where('property_id', $request->property_id);
            });
        }

        // Filtre par statut
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $paymentsQuery->whereIn('status', ['initiated', 'pending', 'approved']);
            } elseif ($request->status === 'archived') {
                $paymentsQuery->whereIn('status', ['cancelled', 'failed', 'declined']);
            } else {
                $paymentsQuery->where('status', $request->status);
            }
        }

        // Filtre par recherche (locataire ou bien)
        if ($request->filled('search')) {
            $search = $request->search;
            $paymentsQuery->where(function($q) use ($search) {
                $q->whereHas('lease.tenant.user', function($sq) use ($search) {
                    $sq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('lease.property', function($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%")
                       ->orWhere('address', 'like', "%{$search}%");
                });
            });
        }

        // Calcul des statistiques
        $currentMonth = now()->startOfMonth();
        $nextMonth = now()->endOfMonth();

        $stats = [
            'expected_rent' => (clone $paymentsQuery)
                ->whereBetween('created_at', [$currentMonth, $nextMonth])
                ->sum('amount_total'),
            'received_rent' => (clone $paymentsQuery)
                ->where('status', 'approved')
                ->whereBetween('paid_at', [$currentMonth, $nextMonth])
                ->sum('amount_total'),
            'late_amount' => (clone $paymentsQuery)
                ->whereIn('status', ['pending', 'initiated'])
                ->whereHas('invoice', function($q) {
                    $q->where('due_date', '<', now());
                })
                ->sum('amount_total'),
            'total_payments' => (clone $paymentsQuery)->count(),
            'paid_count' => (clone $paymentsQuery)->where('status', 'approved')->count(),
        ];

        $stats['recovery_rate'] = $stats['expected_rent'] > 0
            ? round(($stats['received_rent'] / $stats['expected_rent']) * 100, 0)
            : 0;

        $activeCount = (clone $paymentsQuery)->whereIn('status', ['initiated', 'pending', 'approved'])->count();
        $archivedCount = (clone $paymentsQuery)->whereIn('status', ['cancelled', 'failed', 'declined'])->count();

        $perPage = $request->input('per_page', 100);
        $payments = $paymentsQuery->latest('created_at')->paginate($perPage);

        $properties = Property::whereIn('id', $delegatedPropertyIds)->get();
        $trendData = $this->getRecoveryTrend($delegatedPropertyIds);

        return view('co-owner.payments.index', compact(
            'payments',
            'stats',
            'properties',
            'activeCount',
            'archivedCount',
            'trendData'
        ));
    }

    /**
     * Récupère la tendance de recouvrement sur 6 mois
     */
    private function getRecoveryTrend($delegatedPropertyIds = [])
    {
        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $expectedQuery = Payment::whereBetween('created_at', [$monthStart, $monthEnd]);
            $receivedQuery = Payment::where('status', 'approved')
                ->whereBetween('paid_at', [$monthStart, $monthEnd]);

            if (!empty($delegatedPropertyIds)) {
                $expectedQuery->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                    $q->whereIn('id', $delegatedPropertyIds);
                });
                $receivedQuery->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                    $q->whereIn('id', $delegatedPropertyIds);
                });
            }

            $expected = $expectedQuery->sum('amount_total');
            $received = $receivedQuery->sum('amount_total');
            $rate = $expected > 0 ? round(($received / $expected) * 100, 0) : 0;

            $trend[] = [
                'month' => $month->format('M Y'),
                'rate' => $rate
            ];
        }

        return $trend;
    }

    /**
     * Affiche le formulaire d'enregistrement d'un paiement manuel
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

        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $leases = Lease::with(['tenant.user', 'property'])
            ->where('status', 'active')
            ->whereHas('property', function($q) use ($delegatedPropertyIds) {
                $q->whereIn('id', $delegatedPropertyIds);
            })
            ->get();

        return view('co-owner.payments.create', compact('leases'));
    }

    /**
     * Enregistre un nouveau paiement manuel
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $validated = $request->validate([
            'lease_id' => 'required|exists:leases,id',
            'amount_total' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:virement,especes,cheque,mobile_money,card',
            'notes' => 'nullable|string|max:500',
        ]);

        $lease = Lease::with('tenant')->findOrFail($validated['lease_id']);
        $coOwner = $user->coOwner;

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $lease->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            return redirect()->back()
                ->with('error', 'Vous n\'avez pas accès à ce bien.')
                ->withInput();
        }

        $feeRate = 0.05;
        $feeAmount = $validated['amount_total'] * $feeRate;
        $amountNet = $validated['amount_total'] - $feeAmount;

        DB::transaction(function () use ($validated, $user, $lease, $feeAmount, $amountNet, $coOwner) {
            Payment::create([
                'invoice_id' => null,
                'lease_id' => $validated['lease_id'],
                'tenant_id' => $lease->tenant_id,
                'landlord_user_id' => $user->id,
                'provider' => 'manual',
                'status' => 'approved',
                'amount_total' => $validated['amount_total'],
                'fee_amount' => $feeAmount,
                'amount_net' => $amountNet,
                'currency' => 'XOF',
                'paid_at' => $validated['payment_date'],
                'provider_payload' => json_encode([
                    'payment_method' => $validated['payment_method'],
                    'notes' => $validated['notes'] ?? null,
                    'recorded_by' => $user->id,
                    'recorded_by_co_owner' => $coOwner->id,
                ]),
            ]);
        });

        return redirect()->route('co-owner.payments.index')
            ->with('success', 'Paiement enregistré avec succès.');
    }

    /**
     * Affiche les détails d'un paiement
     */
    public function show(Request $request, Payment $payment)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $payment->lease->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        $payment->load(['lease.property', 'lease.tenant.user', 'invoice']);

        return view('co-owner.payments.show', compact('payment'));
    }

    /**
     * Génère une quittance PDF
     */
    public function generateReceipt(Request $request, Payment $payment)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $payment->lease->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        $payment->load(['lease.property', 'lease.tenant.user']);

        $pdf = Pdf::loadView('co-owner.payments.receipt', [
            'payment' => $payment,
            'coOwner' => $coOwner,
            'user' => $user,
            'date' => now()->format('d/m/Y')
        ]);

        return $pdf->download('quittance_' . $payment->id . '_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Envoie la quittance par email
     */
    public function sendReceipt(Request $request, Payment $payment)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $payment->lease->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'Accès non autorisé.'], 403);
        }

        $tenant = $payment->lease->tenant;

        if (!$tenant || !$tenant->user || !$tenant->user->email) {
            return response()->json(['error' => 'Email du locataire non trouvé.'], 400);
        }

        try {
            $payment->load(['lease.property', 'lease.tenant.user']);

            $pdf = Pdf::loadView('co-owner.payments.receipt', [
                'payment' => $payment,
                'coOwner' => $coOwner,
                'user' => $user,
                'date' => now()->format('d/m/Y')
            ]);

            Mail::send([], [], function ($message) use ($tenant, $payment, $pdf) {
                $message->to($tenant->user->email)
                    ->subject('Quittance de loyer - ' . $payment->paid_at->format('F Y'))
                    ->html("
                        <h3>Bonjour {$tenant->user->first_name},</h3>
                        <p>Veuillez trouver ci-joint votre quittance de loyer pour le mois de " . $payment->paid_at->format('F Y') . ".</p>
                        <p>Montant réglé : " . number_format($payment->amount_total, 0, ',', ' ') . " FCFA</p>
                        <p>Bien : {$payment->lease->property->name}</p>
                        <br>
                        <p>Cordialement,<br>L'équipe GestiLoc</p>
                    ");
                $message->attachData($pdf->output(), 'quittance_' . $payment->id . '.pdf', [
                    'mime' => 'application/pdf',
                ]);
            });

            return response()->json(['success' => 'Quittance envoyée avec succès.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de l\'envoi de la quittance.'], 500);
        }
    }

    /**
     * Exporte les paiements (CSV/PDF)
     */
    public function export(Request $request)
    {
        $format = $request->input('format', 'csv');

        if ($format === 'csv') {
            return $this->exportCsv($request);
        }

        return $this->exportPdf($request);
    }

    /**
     * Export CSV
     */
    private function exportCsv(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            abort(401);
        }

        $coOwner = $user->coOwner;
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $payments = Payment::with(['lease.property', 'lease.tenant.user', 'invoice'])
            ->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                $q->whereIn('id', $delegatedPropertyIds);
            })
            ->latest('created_at')
            ->get();

        $filename = 'paiements_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($payments) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'ID', 'Date', 'Bien', 'Locataire', 'Montant Total',
                'Frais', 'Net', 'Statut', 'Méthode', 'Date Paiement'
            ]);

            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->id,
                    $payment->created_at->format('d/m/Y'),
                    $payment->lease->property->name ?? 'N/A',
                    $payment->lease->tenant->user->full_name ?? 'N/A',
                    number_format($payment->amount_total, 0, ',', ' '),
                    number_format($payment->fee_amount, 0, ',', ' '),
                    number_format($payment->amount_net, 0, ',', ' '),
                    $this->getStatusLabel($payment->status),
                    $payment->provider_payload ? json_decode($payment->provider_payload)->payment_method ?? 'N/A' : 'N/A',
                    $payment->paid_at ? $payment->paid_at->format('d/m/Y') : 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export PDF
     */
    private function exportPdf(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            abort(401);
        }

        $coOwner = $user->coOwner;
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $payments = Payment::with(['lease.property', 'lease.tenant.user', 'invoice'])
            ->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                $q->whereIn('id', $delegatedPropertyIds);
            })
            ->latest('created_at')
            ->get();

        $pdf = Pdf::loadView('co-owner.payments.export-pdf', [
            'payments' => $payments,
            'user' => $user,
            'date' => now()->format('d/m/Y')
        ]);

        return $pdf->download('paiements_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Génère les rappels de paiement
     */
    public function reminders(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $latePayments = Payment::with(['lease.tenant.user', 'lease.property'])
            ->where('status', 'pending')
            ->whereHas('invoice', function($q) {
                $q->where('due_date', '<', now()->subDays(7));
            })
            ->whereHas('lease.property', function($q) use ($delegatedPropertyIds) {
                $q->whereIn('id', $delegatedPropertyIds);
            })
            ->get();

        return view('co-owner.payments.reminders', compact('latePayments'));
    }

    /**
     * Envoie un rappel par email
     */
    public function sendReminder(Request $request, Payment $payment)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $payment->lease->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            return back()->with('error', 'Accès non autorisé.');
        }

        $tenant = $payment->lease->tenant;

        if ($tenant && $tenant->user && $tenant->user->email) {
            try {
                Mail::to($tenant->user->email)
                    ->queue(new \App\Mail\PaymentReminderMail($payment));

                return back()->with('success', 'Rappel envoyé avec succès.');
            } catch (\Exception $e) {
                return back()->with('error', 'Erreur lors de l\'envoi du rappel.');
            }
        }

        return back()->with('error', 'Impossible d\'envoyer le rappel : email non trouvé.');
    }

    /**
     * Archive un paiement
     */
    public function archive(Request $request, Payment $payment)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return redirect('http://localhost:8080/login');
        }

        $coOwner = $user->coOwner;

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $payment->lease->property_id)
            ->where('status', 'active')
            ->exists();

        if (!$hasAccess) {
            return back()->with('error', 'Accès non autorisé.');
        }

        $payment->update(['status' => 'cancelled']);

        return back()->with('success', 'Paiement archivé.');
    }

    /**
     * Helper pour obtenir le libellé du statut
     */
    private function getStatusLabel($status)
    {
        return match($status) {
            'approved' => 'Approuvé',
            'pending' => 'En attente',
            'initiated' => 'Initiatié',
            'cancelled' => 'Annulé',
            'failed' => 'Échoué',
            'declined' => 'Refusé',
            default => $status
        };
    }
}