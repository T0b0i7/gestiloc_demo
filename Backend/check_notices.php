<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $columns = DB::select('DESCRIBE notices');
    foreach ($columns as $column) {
        echo "Column: {$column->Field} | Type: {$column->Type} | Null: {$column->Null} | Key: {$column->Key}\n";
    }
    
    // Vérifier les types existants
    $types = DB::table('notices')->distinct()->pluck('type');
    echo "\nExisting types:\n";
    foreach ($types as $type) {
        echo "- $type\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
