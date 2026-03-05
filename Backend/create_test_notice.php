<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Property;
use App\Models\Tenant;
use App\Models\Notice;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Récupérer une propriété déléguée
    $property = Property::first();
    if (!$property) {
        echo "❌ No property found\n";
        exit;
    }

    // Récupérer ou créer un locataire de test
    $tenant = Tenant::first();
    if (!$tenant) {
        echo "❌ No tenant found\n";
        exit;
    }

    // Créer une notification de test
    $notice = Notice::create([
        'property_id' => $property->id,
        'tenant_id' => $tenant->id,
        'landlord_id' => $property->landlord_id,
        'type' => 'tenant', // Type valide selon l'enum
        'reason' => 'Test de maintenance - Ceci est une notification de test pour le co-propriétaire',
        'notice_date' => now(),
        'end_date' => now()->addDays(7), // Fin dans 7 jours
        'status' => 'pending',
        'notes' => 'Notes additionnelles pour la notification de test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    echo "✅ Test notice created successfully!\n";
    echo "Property: {$property->name}\n";
    echo "Tenant: {$tenant->first_name} {$tenant->last_name}\n";
    echo "Notice ID: {$notice->id}\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
