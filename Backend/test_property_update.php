<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Property;
use Illuminate\Support\Facades\Log;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Récupérer une propriété
    $property = Property::find(1);
    if (!$property) {
        echo "❌ Property not found\n";
        exit;
    }

    echo "✅ Property found: {$property->name}\n";
    echo "Current data:\n";
    echo "- Name: {$property->name}\n";
    echo "- Address: {$property->address}\n";
    echo "- City: {$property->city}\n";
    echo "- Rent: {$property->rent_amount}\n";
    echo "- Surface: {$property->surface}\n";
    echo "- Type: {$property->property_type}\n";
    
    // Tenter une mise à jour simple
    $updateData = [
        'name' => 'Test Update ' . date('Y-m-d H:i:s'),
        'address' => 'Test Address',
        'city' => 'Test City',
        'rent_amount' => 1500,
        'surface' => 80,
        'property_type' => 'apartment',
        'description' => 'Test description',
    ];

    echo "\n🔄 Testing update with data:\n";
    foreach ($updateData as $key => $value) {
        echo "- $key: $value\n";
    }

    $property->update($updateData);
    
    echo "\n✅ Update successful!\n";
    echo "New name: {$property->name}\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
