<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use Spatie\Permission\Models\Role;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Création des rôles s'ils n'existent pas
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $landlordRole = Role::firstOrCreate(['name' => 'landlord']);
        $tenantRole = Role::firstOrCreate(['name' => 'tenant']);
        $coOwnerRole = Role::firstOrCreate(['name' => 'co_owner']);

        // ============= ADMINISTRATEURS =============
        $adminUsers = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@gestiloc.com',
                'phone' => '+221770000001',
                'password' => 'password123',
                'first_name' => 'Super',
                'last_name' => 'Admin',
            ],
            [
                'name' => 'Admin Finance',
                'email' => 'finance@gestiloc.com',
                'phone' => '+221770000002',
                'password' => 'password123',
                'first_name' => 'Admin',
                'last_name' => 'Finance',
            ],
        ];

        foreach ($adminUsers as $adminData) {
            $user = User::firstOrCreate(
                ['email' => $adminData['email']],
                [
                    'phone' => $adminData['phone'],
                    'password' => Hash::make($adminData['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($adminRole);
            $this->command->info("✅ Admin créé: {$adminData['email']}");
        }

        // ============= PROPRIÉTAIRES (LANDLORDS) =============
        $landlordUsers = [
            [
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@gestiloc.com',
                'phone' => '+221770000101',
                'password' => 'password123',
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'company_name' => 'Gestion Dupont SARL',
                'address_billing' => '123 Avenue Faidherbe, Dakar, Sénégal',
                'vat_number' => 'SN12345678901',
                'properties_count' => 3,
            ],
            [
                'name' => 'Marie Sarr',
                'email' => 'marie.sarr@gestiloc.com',
                'phone' => '+221770000102',
                'password' => 'password123',
                'first_name' => 'Marie',
                'last_name' => 'Sarr',
                'company_name' => 'Immobilière Sarr & Cie',
                'address_billing' => '45 Rue de la République, Dakar, Sénégal',
                'vat_number' => 'SN98765432109',
                'properties_count' => 2,
            ],
            [
                'name' => 'Pierre Ndiaye',
                'email' => 'pierre.ndiaye@gestiloc.com',
                'phone' => '+221770000103',
                'password' => 'password123',
                'first_name' => 'Pierre',
                'last_name' => 'Ndiaye',
                'company_name' => null,
                'address_billing' => '78 Boulevard de la Liberation, Dakar, Sénégal',
                'vat_number' => null,
                'properties_count' => 1,
            ],
        ];

        foreach ($landlordUsers as $landlordData) {
            $user = User::firstOrCreate(
                ['email' => $landlordData['email']],
                [
                    'phone' => $landlordData['phone'],
                    'password' => Hash::make($landlordData['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($landlordRole);

            // Créer le profil landlord associé
            $landlord = Landlord::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'owner_type' => 'landlord',
                    'first_name' => $landlordData['first_name'],
                    'last_name' => $landlordData['last_name'],
                    'company_name' => $landlordData['company_name'],
                    'address_billing' => $landlordData['address_billing'],
                    'vat_number' => $landlordData['vat_number'],
                    'meta' => [
                        'properties_count' => $landlordData['properties_count'] ?? 0,
                        'join_date' => now()->subMonths(rand(1, 12))->format('Y-m-d'),
                        'verified' => true,
                    ],
                    'fedapay_subaccount_id' => 'acc_' . uniqid(),
                    'fedapay_meta' => [
                        'status' => 'active',
                        'created_at' => now()->toISOString(),
                    ],
                ]
            );

            $this->command->info("✅ Propriétaire créé: {$landlordData['email']} ({$landlordData['properties_count']} biens)");
        }

        // ============= COPROPRIÉTAIRES (CO-OWNERS) =============
        $coOwnerUsers = [
            [
                'name' => 'Ahmed Ba',
                'email' => 'ahmed.ba@gestiloc.com',
                'phone' => '+221770000201',
                'password' => 'password123',
                'first_name' => 'Ahmed',
                'last_name' => 'Ba',
                'company_name' => null,
                'address_billing' => '156 Avenue Cheikh Anta Diop, Dakar, Sénégal',
                'vat_number' => null,
            ],
            [
                'name' => 'Fatou Fall',
                'email' => 'fatou.fall@gestiloc.com',
                'phone' => '+221770000202',
                'password' => 'password123',
                'first_name' => 'Fatou',
                'last_name' => 'Fall',
                'company_name' => 'Fall Investissements',
                'address_billing' => '89 Place de l\'Indépendance, Dakar, Sénégal',
                'vat_number' => 'SN45678912345',
            ],
        ];

        foreach ($coOwnerUsers as $coOwnerData) {
            $user = User::firstOrCreate(
                ['email' => $coOwnerData['email']],
                [
                    'phone' => $coOwnerData['phone'],
                    'password' => Hash::make($coOwnerData['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($coOwnerRole);

            // Créer le profil co-owner associé
            $coOwner = Landlord::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'owner_type' => 'co_owner',
                    'first_name' => $coOwnerData['first_name'],
                    'last_name' => $coOwnerData['last_name'],
                    'company_name' => $coOwnerData['company_name'],
                    'address_billing' => $coOwnerData['address_billing'],
                    'vat_number' => $coOwnerData['vat_number'],
                    'meta' => [
                        'join_date' => now()->subMonths(rand(1, 6))->format('Y-m-d'),
                        'verified' => true,
                        'delegated_properties' => rand(1, 3),
                    ],
                ]
            );

            $this->command->info("✅ Copropriétaire créé: {$coOwnerData['email']}");
        }

        // ============= LOCATAIRES (TENANTS) =============
        $tenantUsers = [
            [
                'name' => 'Moussa Diop',
                'email' => 'moussa.diop@gestiloc.com',
                'phone' => '+221770000301',
                'password' => 'password123',
                'first_name' => 'Moussa',
                'last_name' => 'Diop',
                'status' => 'active',
                'solvency_score' => 850.50,
                'property_type' => 'apartment',
            ],
            [
                'name' => 'Aminata Touré',
                'email' => 'aminata.toure@gestiloc.com',
                'phone' => '+221770000302',
                'password' => 'password123',
                'first_name' => 'Aminata',
                'last_name' => 'Touré',
                'status' => 'active',
                'solvency_score' => 920.75,
                'property_type' => 'house',
            ],
            [
                'name' => 'Ibrahim Ly',
                'email' => 'ibrahim.ly@gestiloc.com',
                'phone' => '+221770000303',
                'password' => 'password123',
                'first_name' => 'Ibrahim',
                'last_name' => 'Ly',
                'status' => 'candidate',
                'solvency_score' => 750.00,
                'property_type' => 'studio',
            ],
            [
                'name' => 'Khadija Gueye',
                'email' => 'khadija.gueye@gestiloc.com',
                'phone' => '+221770000304',
                'password' => 'password123',
                'first_name' => 'Khadija',
                'last_name' => 'Gueye',
                'status' => 'active',
                'solvency_score' => 880.25,
                'property_type' => 'apartment',
            ],
            [
                'name' => 'Baba Cissé',
                'email' => 'baba.cisse@gestiloc.com',
                'phone' => '+221770000305',
                'password' => 'password123',
                'first_name' => 'Baba',
                'last_name' => 'Cissé',
                'status' => 'inactive',
                'solvency_score' => 650.00,
                'property_type' => 'villa',
            ],
        ];

        foreach ($tenantUsers as $tenantData) {
            $user = User::firstOrCreate(
                ['email' => $tenantData['email']],
                [
                    'phone' => $tenantData['phone'],
                    'password' => Hash::make($tenantData['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($tenantRole);

            // Créer le profil tenant associé
            $tenant = Tenant::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'first_name' => $tenantData['first_name'],
                    'last_name' => $tenantData['last_name'],
                    'status' => $tenantData['status'],
                    'solvency_score' => $tenantData['solvency_score'],
                    'meta' => [
                        'property_type' => $tenantData['property_type'],
                        'join_date' => now()->subMonths(rand(1, 24))->format('Y-m-d'),
                        'payment_history' => [
                            'on_time_payments' => rand(0, 12),
                            'late_payments' => rand(0, 3),
                            'total_paid' => rand(500000, 2000000), // FCFA
                        ],
                        'documents_verified' => true,
                    ],
                ]
            );

            $this->command->info("✅ Locataire créé: {$tenantData['email']} (Score: {$tenantData['solvency_score']})");
        }

        // ============= RÉCAPITULATIF =============
        $this->command->info("\n🎉 UTILISATEURS DE TEST CRÉÉS AVEC SUCCÈS!");
        $this->command->info("==========================================");
        
        $this->command->info("\n👑 ADMINISTRATEURS:");
        $this->command->info("• admin@gestiloc.com (Super Admin)");
        $this->command->info("• finance@gestiloc.com (Admin Finance)");
        
        $this->command->info("\n🏠 PROPRIÉTAIRES:");
        $this->command->info("• jean.dupont@gestiloc.com (3 biens)");
        $this->command->info("• marie.sarr@gestiloc.com (2 biens)");
        $this->command->info("• pierre.ndiaye@gestiloc.com (1 bien)");
        
        $this->command->info("\n🤝 COPROPRIÉTAIRES:");
        $this->command->info("• ahmed.ba@gestiloc.com");
        $this->command->info("• fatou.fall@gestiloc.com");
        
        $this->command->info("\n👤 LOCATAIRES:");
        $this->command->info("• moussa.diop@gestiloc.com (Actif, Score: 850)");
        $this->command->info("• aminata.toure@gestiloc.com (Actif, Score: 920)");
        $this->command->info("• ibrahim.ly@gestiloc.com (En attente, Score: 750)");
        $this->command->info("• khadija.gueye@gestiloc.com (Actif, Score: 880)");
        $this->command->info("• baba.cisse@gestiloc.com (Inactif, Score: 650)");
        
        $this->command->info("\n🔐 MOT DE PASSE UNIVERSEL: password123");
        $this->command->info("==========================================");
    }
}
