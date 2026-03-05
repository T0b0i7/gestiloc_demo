<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DelegationAudit;
use App\Models\PropertyDelegation;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DelegationAuditController extends Controller
{
    /**
     * Lister les audits d'une délégation
     * GET /api/delegations/{delegation}/audits
     */
    public function index(PropertyDelegation $delegation): JsonResponse
    {
        $user = auth()->user();

        // Vérifier les permissions
        $canView = false;
        
        if ($user->isAdmin()) {
            $canView = true;
        } elseif ($user->isLandlord() && $delegation->landlord_id === $user->landlord->id) {
            $canView = true;
        } elseif ($user->isCoOwner()) {
            // Vérifier si c'est le co-propriétaire de la délégation
            if ($delegation->co_owner_type === 'App\Models\CoOwner' && $user->coOwner && $delegation->co_owner_id === $user->coOwner->id) {
                $canView = true;
            }
        }

        if (!$canView) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $audits = $delegation->audits()
            ->with('performedBy')
            ->latest()
            ->paginate(50);

        return response()->json([
            'audits' => $audits,
            'delegation' => $delegation->load(['property', 'coOwner'])
        ]);
    }

    /**
     * Lister les audits de délégation pour une propriété
     * GET /api/properties/{property}/delegation-audits
     */
    public function propertyAudits(Property $property): JsonResponse
    {
        $user = auth()->user();

        // Vérifier les permissions
        $canView = false;
        
        if ($user->isAdmin()) {
            $canView = true;
        } elseif ($user->isLandlord() && $property->landlord_id === $user->landlord->id) {
            $canView = true;
        } elseif ($user->isCoOwner()) {
            // Vérifier si le co-propriétaire a une délégation sur cette propriété
            $hasDelegation = $property->delegations()
                ->where('co_owner_type', 'App\Models\CoOwner')
                ->where('co_owner_id', $user->coOwner->id ?? null)
                ->where('status', 'active')
                ->exists();
            
            if ($hasDelegation) {
                $canView = true;
            }
        }

        if (!$canView) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $audits = DelegationAudit::whereHas('delegation', function ($query) use ($property) {
                $query->where('property_id', $property->id);
            })
            ->with(['delegation.property', 'delegation.coOwner', 'performedBy'])
            ->latest()
            ->paginate(50);

        return response()->json([
            'audits' => $audits,
            'property' => $property
        ]);
    }

    /**
     * Statistiques d'audit pour un landlord
     * GET /api/landlords/delegation-audit-stats
     */
    public function stats(): JsonResponse
    {
        $user = auth()->user();

        if (!$user->isLandlord() && !$user->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = DelegationAudit::query();

        if ($user->isLandlord()) {
            $query->whereHas('delegation', function ($q) use ($user) {
                $q->where('landlord_id', $user->landlord->id);
            });
        }

        $stats = [
            'total_audits' => $query->count(),
            'created_count' => $query->where('action', 'created')->count(),
            'revoked_count' => $query->where('action', 'revoked')->count(),
            'updated_count' => $query->where('action', 'updated')->count(),
            'recent_audits' => $query->with(['delegation.property', 'performedBy'])
                ->latest()
                ->limit(10)
                ->get()
        ];

        return response()->json($stats);
    }

    /**
     * Lister les audits de délégation pour le co-propriétaire connecté
     * GET /api/my-delegation-audits
     */
    public function myDelegationAudits(): JsonResponse
    {
        $user = auth()->user();

        if (!$user->isCoOwner() || !$user->coOwner) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $audits = DelegationAudit::where('auditable_type', 'App\Models\CoOwner')
            ->where('auditable_id', $user->coOwner->id)
            ->with(['delegation.property', 'performedBy'])
            ->latest()
            ->paginate(50);

        return response()->json([
            'audits' => $audits,
            'co_owner' => $user->coOwner
        ]);
    }
}
