<?php

use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\CoOwner;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function createAccount($email, $password, $roleName, $firstName, $lastName, $phone) {
    echo "Création du compte : $email ($roleName)...\n";
    
    // 1. Créer l'utilisateur
    $user = User::updateOrCreate(
        ['email' => $email],
        [
            'password' => Hash::make($password),
            'status' => 'active',
            'phone' => $phone
        ]
    );

    // 2. Attribuer le rôle (Spatie)
    if (!Role::where('name', $roleName)->exists()) {
        Role::create(['name' => $roleName]);
    }
    $user->syncRoles([$roleName]);

    // 3. Créer le profil spécifique
    switch ($roleName) {
        case 'landlord':
            Landlord::updateOrCreate(['user_id' => $user->id], ['first_name' => $firstName, 'last_name' => $lastName, 'status' => 'active']);
            break;
        case 'tenant':
            Tenant::updateOrCreate(['user_id' => $user->id], ['first_name' => $firstName, 'last_name' => $lastName, 'status' => 'active']);
            break;
        case 'co_owner':
            CoOwner::updateOrCreate(['user_id' => $user->id], ['first_name' => $firstName, 'last_name' => $lastName, 'status' => 'active']);
            break;
    }
    
    echo "Succès !\n";
}

try {
    // Création des 3 types de comptes
    createAccount('proprietaire@test.com', 'password123', 'landlord', 'Jean', 'Proprio', '0102030405');
    createAccount('locataire@test.com', 'password123', 'tenant', 'Alice', 'Locataire', '0102030406');
    createAccount('coproprietaire@test.com', 'password123', 'co_owner', 'Paul', 'Bernard', '0102030407');

    echo "\n--- RÉCAPITULATIF DES COMPTES ---\n";
    echo "Propriétaire : proprietaire@test.com / password123\n";
    echo "Locataire : locataire@test.com / password123\n";
    echo "Copropriétaire : coproprietaire@test.com / password123\n";
    echo "---------------------------------\n";

} catch (\Exception $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
