<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Landlord;
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
    }
}