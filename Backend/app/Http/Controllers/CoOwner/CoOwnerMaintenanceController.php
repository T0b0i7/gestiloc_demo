<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRequest;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Tenant;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class CoOwnerMaintenanceController extends Controller
{
    private function getCoOwner()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user && $this->isCoOwner($user)) {
                return CoOwner::where('user_id', $user->id)->firstOrFail();
            }
        }

        $token = request()->query('api_token');
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);

            if ($accessToken) {
                $user = $accessToken->tokenable;

                if ($user && $this->isCoOwner($user)) {
                    Auth::login($user);
                    return CoOwner::where('user_id', $user->id)->firstOrFail();
                }
            }
        }

        abort(403, 'Accès réservé aux copropriétaires/agences. Veuillez vous reconnecter.');
    }

    private function isCoOwner($user)
    {
        return $user->coOwner !== null;
    }

    private function getDelegatedProperties()
    {
        $coOwner = $this->getCoOwner();

        return PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get()
            ->pluck('property')
            ->filter()
            ->pluck('id')
            ->toArray();
    }

    /**
     * Afficher la liste des interventions
     */
    public function index(Request $request)
    {
        try {
            $coOwner = $this->getCoOwner();
            $delegatedProperties = $this->getDelegatedProperties();

            $properties = Property::whereIn('id', $delegatedProperties)
                ->orderBy('name')
                ->get();

            $years = MaintenanceRequest::whereIn('property_id', $delegatedProperties)
                ->selectRaw('YEAR(created_at) as year')
                ->distinct()
                ->orderBy('year', 'desc')
                ->pluck('year')
                ->toArray();

            if (empty($delegatedProperties)) {
                return view('co-owner.maintenance.index', [
                    'maintenanceRequests' => collect(),
                    'stats' => [
                        'urgent' => 0,
                        'in_progress' => 0,
                        'planned' => 0,
                        'total_cost' => 0,
                    ],
                    'properties' => $properties,
                    'years' => $years,
                    'coOwner' => $coOwner,
                    'currentFilter' => 'all',
                ]);
            }

            $query = MaintenanceRequest::whereIn('property_id', $delegatedProperties)
                ->with(['property', 'tenant.user']);

            if ($request->filled('status_filter')) {
                $statusFilter = $request->status_filter;
                if ($statusFilter === 'urgent') {
                    $query->where('priority', 'emergency');
                } elseif ($statusFilter === 'in_progress') {
                    $query->where('status', 'in_progress');
                } elseif ($statusFilter === 'planned') {
                    $query->where('status', 'open');
                } elseif ($statusFilter === 'completed') {
                    $query->where('status', 'resolved');
                }
            }

            if ($request->filled('property_id') && $request->property_id !== 'all') {
                $query->where('property_id', $request->property_id);
            }

            if ($request->filled('year') && $request->year !== 'all') {
                $query->whereYear('created_at', $request->year);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('property', function($subQ) use ($search) {
                          $subQ->where('name', 'like', "%{$search}%")
                               ->orWhere('address', 'like', "%{$search}%");
                      })
                      ->orWhereHas('tenant', function($subQ) use ($search) {
                          $subQ->where('first_name', 'like', "%{$search}%")
                               ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            }

            $maintenanceRequests = $query->orderBy('created_at', 'desc')->get();

            $stats = [
                'urgent' => MaintenanceRequest::whereIn('property_id', $delegatedProperties)
                    ->where('priority', 'emergency')
                    ->whereIn('status', ['open', 'in_progress'])
                    ->count(),
                'in_progress' => MaintenanceRequest::whereIn('property_id', $delegatedProperties)
                    ->where('status', 'in_progress')
                    ->count(),
                'planned' => MaintenanceRequest::whereIn('property_id', $delegatedProperties)
                    ->where('status', 'open')
                    ->count(),
                'total_cost' => MaintenanceRequest::whereIn('property_id', $delegatedProperties)
                    ->whereYear('created_at', date('Y'))
                    ->sum('estimated_cost') ?? 0,
            ];

            return view('co-owner.maintenance.index', [
                'maintenanceRequests' => $maintenanceRequests,
                'stats' => $stats,
                'properties' => $properties,
                'years' => $years,
                'coOwner' => $coOwner,
                'currentFilter' => $request->status_filter ?? 'all',
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur accès maintenance copropriétaire: ' . $e->getMessage());
            return redirect('/login')->with('error', 'Session expirée. Veuillez vous reconnecter.');
        }
    }

    /**
     * Afficher le formulaire de création
     */
    public function create(Request $request)
    {
        try {
            $coOwner = $this->getCoOwner();
            $delegatedPropertyIds = $this->getDelegatedProperties();

            $properties = Property::whereIn('id', $delegatedPropertyIds)
                ->with(['leases' => function($query) {
                    $query->where('status', 'active')
                          ->with('tenant');
                }])
                ->orderBy('name')
                ->get();

            $propertiesWithTenants = $properties->map(function($property) {
                $activeLease = $property->leases->first();
                return [
                    'id' => $property->id,
                    'name' => $property->name,
                    'address' => $property->address,
                    'city' => $property->city,
                    'full_address' => $property->name . ' - ' . $property->address . ', ' . $property->city,
                    'tenant' => $activeLease ? $activeLease->tenant : null,
                    'tenant_id' => $activeLease ? $activeLease->tenant_id : null,
                ];
            });

            $tenantIds = Lease::whereIn('property_id', $delegatedPropertyIds)
                ->where('status', 'active')
                ->pluck('tenant_id')
                ->unique();

            $tenants = Tenant::whereIn('id', $tenantIds)
                ->with('user')
                ->get()
                ->map(function($tenant) {
                    return [
                        'id' => $tenant->id,
                        'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                        'email' => $tenant->email,
                        'phone' => $tenant->phone,
                    ];
                });

            return view('co-owner.maintenance.create', [
                'properties' => $propertiesWithTenants,
                'tenants' => $tenants,
                'coOwner' => $coOwner,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur création maintenance: ' . $e->getMessage());
            return redirect()->route('co-owner.maintenance.index')
                ->with('error', 'Erreur lors de l\'accès au formulaire: ' . $e->getMessage());
        }
    }

    /**
     * Stocker une nouvelle demande
     */
    public function store(Request $request)
    {
        try {
            $coOwner = $this->getCoOwner();
            $delegatedPropertyIds = $this->getDelegatedProperties();

            $validated = $request->validate([
                'property_id' => [
                    'required',
                    'exists:properties,id',
                    function ($attribute, $value, $fail) use ($delegatedPropertyIds) {
                        if (!in_array($value, $delegatedPropertyIds)) {
                            $fail('Ce bien ne vous est pas délégué.');
                        }
                    }
                ],
                'tenant_id' => [
                    'required',
                    'exists:tenants,id',
                    function ($attribute, $value, $fail) use ($request) {
                        $hasActiveLease = Lease::where('property_id', $request->property_id)
                            ->where('tenant_id', $value)
                            ->where('status', 'active')
                            ->exists();

                        if (!$hasActiveLease) {
                            $fail('Ce locataire n\'est pas associé à ce bien.');
                        }
                    }
                ],
                'title' => 'required|string|max:255',
                'category' => 'required|in:plumbing,electricity,heating,other',
                'priority' => 'required|in:low,medium,high,emergency',
                'status' => 'required|in:open,in_progress,resolved,cancelled',
                'description' => 'required|string|max:5000',
                'estimated_cost' => 'nullable|numeric|min:0',
                'preferred_date' => 'nullable|date|after_or_equal:today',
                'assigned_provider' => 'nullable|string|max:255',
                'photos' => 'nullable|array',
                'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            DB::beginTransaction();

            $photoPaths = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('maintenance/' . date('Y/m'), 'public');
                    $photoPaths[] = $path;
                }
            }

            $maintenance = MaintenanceRequest::create([
                'property_id' => $validated['property_id'],
                'tenant_id' => $validated['tenant_id'],
                'landlord_id' => $coOwner->landlord_id,
                'title' => $validated['title'],
                'category' => $validated['category'],
                'priority' => $validated['priority'],
                'status' => $validated['status'],
                'description' => $validated['description'],
                'estimated_cost' => $validated['estimated_cost'] ?? null,
                'assigned_provider' => $validated['assigned_provider'] ?? null,
                'preferred_slots' => $validated['preferred_date'] ? [
                    ['date' => $validated['preferred_date'], 'from' => '09:00', 'to' => '18:00']
                ] : null,
                'photos' => $photoPaths,
                'created_by_co_owner' => $coOwner->id,
            ]);

            if ($validated['status'] === 'in_progress') {
                $maintenance->update(['started_at' => now()]);
            }

            if ($validated['status'] === 'resolved') {
                $maintenance->update(['resolved_at' => now()]);
            }

            DB::commit();

            Log::info('Demande de maintenance créée par co-propriétaire', [
                'maintenance_id' => $maintenance->id,
                'co_owner_id' => $coOwner->id,
                'property_id' => $validated['property_id'],
                'status' => $validated['status'],
            ]);

            return redirect()->route('co-owner.maintenance.index')
                ->with('success', 'Intervention créée avec succès !');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->validator)
                ->withInput()
                ->with('error', 'Veuillez corriger les erreurs dans le formulaire.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création maintenance: ' . $e->getMessage());
            return back()
                ->with('error', 'Erreur lors de la création: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Afficher le formulaire d'édition
     */
    public function edit(MaintenanceRequest $maintenance)
    {
        try {
            $coOwner = $this->getCoOwner();
            $delegatedPropertyIds = $this->getDelegatedProperties();

            if (!in_array($maintenance->property_id, $delegatedPropertyIds)) {
                abort(403, 'Vous n\'avez pas accès à cette demande');
            }

            $maintenance->load(['property', 'tenant']);

            $properties = Property::whereIn('id', $delegatedPropertyIds)
                ->with(['leases' => function($query) {
                    $query->where('status', 'active')
                          ->with('tenant');
                }])
                ->orderBy('name')
                ->get()
                ->map(function($property) {
                    $activeLease = $property->leases->first();
                    return [
                        'id' => $property->id,
                        'name' => $property->name,
                        'address' => $property->address,
                        'city' => $property->city,
                        'full_address' => $property->name . ' - ' . $property->address . ', ' . $property->city,
                        'tenant' => $activeLease ? $activeLease->tenant : null,
                        'tenant_id' => $activeLease ? $activeLease->tenant_id : null,
                    ];
                });

            $tenantIds = Lease::whereIn('property_id', $delegatedPropertyIds)
                ->where('status', 'active')
                ->pluck('tenant_id')
                ->unique();

            $tenants = Tenant::whereIn('id', $tenantIds)
                ->with('user')
                ->get()
                ->map(function($tenant) {
                    return [
                        'id' => $tenant->id,
                        'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                        'email' => $tenant->email,
                        'phone' => $tenant->phone,
                    ];
                });

            $preferredDate = null;
            if ($maintenance->preferred_slots && is_array($maintenance->preferred_slots) && count($maintenance->preferred_slots) > 0) {
                $preferredDate = $maintenance->preferred_slots[0]['date'] ?? null;
            }

            return view('co-owner.maintenance.edit', [
                'maintenance' => $maintenance,
                'properties' => $properties,
                'tenants' => $tenants,
                'coOwner' => $coOwner,
                'preferredDate' => $preferredDate,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur édition maintenance: ' . $e->getMessage());
            return redirect()->route('co-owner.maintenance.index')
                ->with('error', "Erreur lors de l'accès au formulaire d'édition: " . $e->getMessage());
        }
    }

    /**
     * Mettre à jour une demande de maintenance
     */
    public function update(Request $request, MaintenanceRequest $maintenance)
    {
        try {
            $coOwner = $this->getCoOwner();
            $delegatedPropertyIds = $this->getDelegatedProperties();

            if (!in_array($maintenance->property_id, $delegatedPropertyIds)) {
                abort(403, 'Vous n\'avez pas accès à cette demande');
            }

            $validated = $request->validate([
                'property_id' => [
                    'required',
                    'exists:properties,id',
                    function ($attribute, $value, $fail) use ($delegatedPropertyIds) {
                        if (!in_array($value, $delegatedPropertyIds)) {
                            $fail('Ce bien ne vous est pas délégué.');
                        }
                    }
                ],
                'tenant_id' => [
                    'required',
                    'exists:tenants,id',
                    function ($attribute, $value, $fail) use ($request) {
                        $hasActiveLease = Lease::where('property_id', $request->property_id)
                            ->where('tenant_id', $value)
                            ->where('status', 'active')
                            ->exists();

                        if (!$hasActiveLease) {
                            $fail('Ce locataire n\'est pas associé à ce bien.');
                        }
                    }
                ],
                'title' => 'required|string|max:255',
                'category' => 'required|in:plumbing,electricity,heating,other',
                'priority' => 'required|in:low,medium,high,emergency',
                'status' => 'required|in:open,in_progress,resolved,cancelled',
                'description' => 'required|string|max:5000',
                'estimated_cost' => 'nullable|numeric|min:0',
                'actual_cost' => 'nullable|numeric|min:0',
                'preferred_date' => 'nullable|date',
                'assigned_provider' => 'nullable|string|max:255',
                'photos' => 'nullable|array',
                'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'remove_photos' => 'nullable|array',
            ]);

            DB::beginTransaction();

            $photoPaths = $maintenance->photos ?? [];

            if ($request->filled('remove_photos')) {
                $photoPaths = array_diff($photoPaths, $request->remove_photos);
            }

            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('maintenance/' . date('Y/m'), 'public');
                    $photoPaths[] = $path;
                }
            }

            $updateData = [
                'property_id' => $validated['property_id'],
                'tenant_id' => $validated['tenant_id'],
                'title' => $validated['title'],
                'category' => $validated['category'],
                'priority' => $validated['priority'],
                'status' => $validated['status'],
                'description' => $validated['description'],
                'estimated_cost' => $validated['estimated_cost'] ?? null,
                'actual_cost' => $validated['actual_cost'] ?? null,
                'assigned_provider' => $validated['assigned_provider'] ?? null,
                'preferred_slots' => $validated['preferred_date'] ? [
                    ['date' => $validated['preferred_date'], 'from' => '09:00', 'to' => '18:00']
                ] : null,
                'photos' => array_values($photoPaths),
            ];

            if ($validated['status'] === 'in_progress' && $maintenance->status !== 'in_progress') {
                $updateData['started_at'] = now();
            }

            if ($validated['status'] === 'resolved' && $maintenance->status !== 'resolved') {
                $updateData['resolved_at'] = now();
            }

            if ($validated['status'] === 'cancelled' && $maintenance->status !== 'cancelled') {
                $updateData['resolved_at'] = now();
            }

            $maintenance->update($updateData);

            DB::commit();

            Log::info('Demande de maintenance mise à jour par co-propriétaire', [
                'maintenance_id' => $maintenance->id,
                'co_owner_id' => $coOwner->id,
                'old_status' => $maintenance->getOriginal('status'),
                'new_status' => $validated['status'],
            ]);

            return redirect()->route('co-owner.maintenance.show', $maintenance)
                ->with('success', 'Intervention mise à jour avec succès !');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->validator)
                ->withInput()
                ->with('error', 'Veuillez corriger les erreurs dans le formulaire.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur mise à jour maintenance: ' . $e->getMessage());
            return back()
                ->with('error', 'Erreur lors de la mise à jour: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Afficher une demande
     */
    public function show(MaintenanceRequest $maintenance)
    {
        $coOwner = $this->getCoOwner();
        $delegatedProperties = $this->getDelegatedProperties();

        if (!in_array($maintenance->property_id, $delegatedProperties)) {
            abort(403, 'Vous n\'avez pas accès à cette demande');
        }

        $maintenance->load(['property', 'tenant.user', 'landlord.user']);

        return view('co-owner.maintenance.show', [
            'maintenance' => $maintenance,
            'coOwner' => $coOwner,
        ]);
    }

    /**
     * Répondre au locataire et envoyer un email
     */
    public function replyToTenant(Request $request, MaintenanceRequest $maintenance)
    {
        try {
            $coOwner = $this->getCoOwner();
            $delegatedProperties = $this->getDelegatedProperties();

            if (!in_array($maintenance->property_id, $delegatedProperties)) {
                abort(403, 'Vous n\'avez pas accès à cette demande');
            }

            $validated = $request->validate([
                'reply_message' => 'required|string|max:2000',
            ]);

            // Charger les relations nécessaires
            $maintenance->load(['tenant.user', 'property', 'landlord.user']);
            $coOwner->load('user');

            // Préparer les données pour l'email
            $tenant = $maintenance->tenant;
            $tenantUser = $tenant->user;
            $property = $maintenance->property;

            // Formatage des créneaux préférés
            $preferredSlotsFormatted = '';
            if (!empty($maintenance->preferred_slots) && is_array($maintenance->preferred_slots)) {
                foreach ($maintenance->preferred_slots as $slot) {
                    if (is_array($slot) && isset($slot['date'])) {
                        $preferredSlotsFormatted .= $slot['date'];
                        if (isset($slot['from']) && isset($slot['to'])) {
                            $preferredSlotsFormatted .= ' de ' . $slot['from'] . ' à ' . $slot['to'];
                        }
                        $preferredSlotsFormatted .= "\n";
                    }
                }
            }

            // Envoyer l'email au locataire - CORRECTION : changement du nom de variable
            Mail::send('emails.maintenance-reply', [
                'maintenance' => $maintenance,
                'tenant' => $tenant,
                'tenantUser' => $tenantUser,
                'property' => $property,
                'coOwner' => $coOwner,
                'coOwnerUser' => $coOwner->user,
                'replyMessage' => $validated['reply_message'], // Changé de 'message' à 'replyMessage'
                'preferredSlotsFormatted' => $preferredSlotsFormatted,
                'status' => $maintenance->status,
                'priority' => $maintenance->priority,
                'category' => $maintenance->category,
                'estimated_cost' => $maintenance->estimated_cost,
                'assigned_provider' => $maintenance->assigned_provider,
                'started_at' => $maintenance->started_at,
                'resolved_at' => $maintenance->resolved_at,
            ], function ($mailer) use ($tenantUser, $maintenance, $coOwner) { // Changé de '$mail' à '$mailer'
                $mailer->to($tenantUser->email, $tenantUser->name ?? 'Locataire')
                       ->subject('Réponse à votre demande de maintenance #' . $maintenance->id);
            });

            Log::info('Réponse envoyée au locataire', [
                'maintenance_id' => $maintenance->id,
                'co_owner_id' => $coOwner->id,
                'tenant_id' => $maintenance->tenant_id,
                'email' => $tenantUser->email
            ]);

            return redirect()->route('co-owner.maintenance.show', $maintenance)
                ->with('success', 'Votre réponse a été envoyée au locataire par email avec succès !');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->validator)
                ->withInput()
                ->with('error', 'Veuillez corriger les erreurs dans le formulaire.');
        } catch (\Exception $e) {
            Log::error('Erreur envoi réponse au locataire: ' . $e->getMessage());
            return back()
                ->with('error', 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage())
                ->withInput();
        }
    }
}
