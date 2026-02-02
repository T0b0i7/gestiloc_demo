<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "🔍 Checking properties table structure...\n\n";
    
    $columns = DB::select('DESCRIBE properties');
    foreach ($columns as $column) {
        echo "Column: {$column->Field} | Type: {$column->Type} | Null: {$column->Null} | Key: {$column->Key}\n";
    }
    
    echo "\n🔍 Checking if property_type column exists...\n";
    $hasPropertyType = Schema::hasColumn('properties', 'property_type');
    echo "Has property_type: " . ($hasPropertyType ? 'YES' : 'NO') . "\n";
    
    echo "\n🔍 Checking if description column exists...\n";
    $hasDescription = Schema::hasColumn('properties', 'description');
    echo "Has description: " . ($hasDescription ? 'YES' : 'NO') . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
