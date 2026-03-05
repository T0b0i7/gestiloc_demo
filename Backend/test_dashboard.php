<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Resources\Admin\DashboardResource;

// Initialiser l'application Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Créer une instance du contrôleur
$controller = new DashboardController();

// Exécuter la méthode stats
$result = $controller->stats();

// Afficher les données brutes
echo "=== DASHBOARD CONTROLLER RAW OUTPUT ===\n";
print_r($result);
