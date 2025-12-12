<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PropertyController extends Controller
{
    // List properties (admin => all, landlord => own)
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $props = Property::paginate(20);
        } elseif ($user->isLandlord()) {
            $landlord = $user->landlord;
            $props = $landlord ? $landlord->properties()->paginate(20) : collect([]);
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($props);
    }

    // Store a property (landlord only)
    public function store(StorePropertyRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $data = $request->validated();
        $data['landlord_id'] = $landlord->id;

        $property = Property::create($data);

        return response()->json($property, 201);
    }

    // Show
    public function show(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        // Check ownership using isLandlord method
        if ($user->isLandlord()) {
            if (! $user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($property);
    }

    // Update
    public function update(StorePropertyRequest $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        if ($user->isLandlord()) {
            if (! $user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $property->update($request->validated());

        return response()->json($property);
    }

    // Destroy
    public function destroy(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        if ($user->isLandlord()) {
            if (! $user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted']);
    }
}
