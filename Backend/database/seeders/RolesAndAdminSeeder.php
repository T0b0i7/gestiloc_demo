<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Agency;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RolesAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $admin     = Role::firstOrCreate(['name' => 'admin']);
        $landlord  = Role::firstOrCreate(['name' => 'landlord']);
        $tenant    = Role::firstOrCreate(['name' => 'tenant']);
// Rôle copropriétaire/gestionnaire
        $coOwner   = Role::firstOrCreate(['name' => 'co_owner']);
        // Create dev admin
        $user = User::firstOrCreate(
            ['email' => 'admin@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '0000000000',
            ]
        );

        if (! $user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        // Create dev landlord
        $landlordUser = User::firstOrCreate(
            ['email' => 'proprietaire@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '+22912345678',
            ]
        );

        if (! $landlordUser->hasRole('landlord')) {
            $landlordUser->assignRole('landlord');
        }

        // Create landlord profile
        Landlord::firstOrCreate(
            ['user_id' => $landlordUser->id],
            [
                'owner_type' => 'landlord', // Landlord pur
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'company_name' => 'Gestion Immobilière Dupont',
                'address_billing' => '123 Rue du Commerce, Cotonou, Bénin',
                'vat_number' => 'BJ123456789',
            ]
        );

        // Create dev co-owner agency (agence professionnelle)
        $coOwnerUser = User::firstOrCreate(
            ['email' => 'coproprietaire@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '+22911223344',
            ]
        );

        if (! $coOwnerUser->hasRole('co_owner')) {
            $coOwnerUser->assignRole('co_owner');
        }

        // Create co-owner agency profile (agence professionnelle)
        Agency::firstOrCreate(
            ['user_id' => $coOwnerUser->id],
            [
                'agency_type' => 'co_owner_agency', // Co-owner agence
                'company_name' => 'Gestion Immobilière Pro',
                'license_number' => 'AGENCE-BJ-2023-001',
                'address' => '456 Avenue des Nations, Cotonou, Bénin',
                'phone' => '+22911223344',
                'email' => 'coproprietaire@dev.com',
                'is_professional' => true,
                'id_type' => 'CNI',
                'id_number' => 'BJ123456789012',
                'ifu' => '3209876543210',
                'rccm' => 'BJ-COT-2023-B5678',
                'vat_number' => 'BJ987654321',
            ]
        );

        // Create dev co-owner particulier
        $coOwnerPartUser = User::firstOrCreate(
            ['email' => 'coproprietaire-part@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '+22999887766',
            ]
        );

        if (! $coOwnerPartUser->hasRole('co_owner')) {
            $coOwnerPartUser->assignRole('co_owner');
        }

        // Create co-owner particulier profile
        Landlord::firstOrCreate(
            ['user_id' => $coOwnerPartUser->id],
            [
                'owner_type' => 'co_owner', // Co-owner particulier
                'first_name' => 'Pierre',
                'last_name' => 'Mbodj',
                'company_name' => null,
                'address_billing' => '789 Boulevard de la Paix, Porto-Novo, Bénin',
                'vat_number' => 'BJ556677889',
            ]
        );
        // Create dev tenant
        $tenantUser = User::firstOrCreate(
            ['email' => 'locataire@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '+22998765432',
            ]
        );

        if (! $tenantUser->hasRole('tenant')) {
            $tenantUser->assignRole('tenant');
        }

        // Create tenant profile
        Tenant::firstOrCreate(
            ['user_id' => $tenantUser->id],
            [
                'first_name' => 'Marie',
                'last_name' => 'Kouadio',
                'status' => 'active',
                'solvency_score' => 850.00,
            ]
        );
    }
}