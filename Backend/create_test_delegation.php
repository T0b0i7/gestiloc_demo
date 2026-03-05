<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use App\Models\Property;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Récupérer l'utilisateur co-propriétaire
    $coOwnerUser = User::where('email', 'Donaldadanhounme229@gmail.com')->first();
    if (!$coOwnerUser) {
        echo "❌ Co-owner user not found\n";
        exit;
    }

    // Récupérer ou créer le profil co-propriétaire
    $coOwner = CoOwner::where('user_id', $coOwnerUser->id)->first();
    if (!$coOwner) {
        $coOwner = CoOwner::create([
            'user_id' => $coOwnerUser->id,
            'first_name' => 'Donald',
            'last_name' => 'Adanhounme',
            'phone' => '+2290153875795',
            'is_professional' => false,
            'status' => 'active',
        ]);
    }

    // Récupérer une propriété existante
    $property = Property::first();
    if (!$property) {
        echo "❌ No property found\n";
        exit;
    }

    // Créer une délégation de test
    $delegation = PropertyDelegation::create([
        'property_id' => $property->id,
        'co_owner_id' => $coOwner->id,
        'landlord_id' => $property->landlord_id,
        'status' => 'active',
        'permissions' => ['view', 'edit', 'manage_tenants', 'manage_leases'],
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    echo "✅ Test delegation created successfully!\n";
    echo "Property: {$property->name}\n";
    echo "Co-owner: {$coOwner->first_name} {$coOwner->last_name}\n";
    echo "Delegation ID: {$delegation->id}\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
