<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Créer un utilisateur co-propriétaire de test
    $user = User::create([
        'email' => 'coowner@test.com',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ]);

    // Assigner le rôle co_owner
    $user->assignRole('co_owner');

    echo "✅ Co-owner user created successfully!\n";
    echo "Email: coowner@test.com\n";
    echo "Password: password\n";
    echo "Role: co_owner\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
