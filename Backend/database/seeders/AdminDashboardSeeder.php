<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Invoice;
use App\Models\Transaction;
use App\Models\Ticket;
use App\Models\MaintenanceRequest;

class AdminDashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer des propriétés pour les propriétaires existants
        $landlords = User::role('landlord')->with('landlord')->get();
        
        foreach ($landlords as $landlord) {
            // Créer 2-3 propriétés par propriétaire
            for ($i = 1; $i <= rand(2, 3); $i++) {
                Property::create([
                    'user_id' => $landlord->id,
                    'landlord_id' => $landlord->landlord->id,
                    'name' => "Propriété {$i} - {$landlord->landlord->first_name}",
                    'description' => "Belle propriété de {$i} pièces",
                    'address' => "Adresse {$i}, Cotonou",
                    'city' => 'Cotonou',
                    'district' => 'Arrondissement ' . $i,
                    'type' => ['appartement', 'maison', 'studio'][rand(0, 2)],
                    'surface' => rand(30, 150),
                    'rent_amount' => rand(50000, 200000),
                    'status' => 'rented',
                    'reference_code' => 'PROP-' . strtoupper(uniqid()),
                ]);
            }
        }

        // Créer des baux pour les locataires existants
        $tenants = User::role('tenant')->with('tenant')->get();
        $properties = Property::all();

        foreach ($tenants as $index => $tenant) {
            if ($properties->isNotEmpty()) {
                $property = $properties[$index % $properties->count()];
                
                Lease::create([
                    'property_id' => $property->id,
                    'tenant_id' => $tenant->tenant->id,
                    'start_date' => now()->subMonths(rand(1, 6)),
                    'end_date' => now()->addMonths(rand(6, 12)),
                    'rent_amount' => $property->rent_amount,
                    'status' => 'active',
                    'guarantee_amount' => $property->rent_amount,
                ]);
            }
        }

        // Créer des factures pour les baux actifs
        $activeLeases = Lease::where('status', 'active')->get();
        
        foreach ($activeLeases as $lease) {
            // Créer 3-6 factures par bail
            for ($i = 1; $i <= rand(3, 6); $i++) {
                $dueDate = now()->subMonths($i - 1);
                $status = rand(0, 1) ? 'paid' : 'pending';
                
                Invoice::create([
                    'lease_id' => $lease->id,
                    'invoice_number' => 'INV-' . date('Ym') . '-' . str_pad($lease->id . $i . time(), 6, '0', STR_PAD_LEFT),
                    'due_date' => $dueDate,
                    'amount_total' => $lease->rent_amount,
                    'amount_paid' => $status === 'paid' ? $lease->rent_amount : 0,
                    'status' => $status,
                    'type' => 'rent',
                ]);
            }
        }

        // Créer des transactions pour les factures payées
        $paidInvoices = Invoice::where('status', 'paid')->get();
        
        foreach ($paidInvoices as $invoice) {
            Transaction::create([
                'invoice_id' => $invoice->id,
                'amount' => $invoice->amount_paid,
                'payment_date' => $invoice->updated_at,
                'payment_method' => 'fedapay',
                'transaction_reference' => 'TXN-' . strtoupper(uniqid()),
            ]);
        }

        // Créer des tickets de maintenance
        foreach ($properties as $index => $property) {
            if (rand(0, 1)) {
                $lease = $property->leases->first();
                if ($lease) {
                    MaintenanceRequest::create([
                        'property_id' => $property->id,
                        'tenant_id' => $lease->tenant_id,
                        'landlord_id' => $property->landlord_id,
                        'title' => 'Problème de plomberie',
                        'description' => 'Fuite d eau dans la salle de bain',
                        'priority' => ['low', 'medium', 'high'][rand(0, 2)],
                        'status' => ['open', 'in_progress', 'resolved'][rand(0, 2)],
                        'created_at' => now()->subDays(rand(1, 10)),
                    ]);
                }
            }
        }

        // Créer des tickets de support
        $ticketTypes = [
            'Demande d information',
            'Problème technique',
            'Réclamation',
            'Demande de document',
        ];

        foreach ($ticketTypes as $index => $type) {
            $lease = $activeLeases->first();
            if ($lease) {
                Ticket::create([
                    'lease_id' => $lease->id,
                    'creator_user_id' => $lease->tenant_id,
                    'subject' => $type,
                    'description' => 'Description détaillée du ' . strtolower($type),
                    'status' => ['open', 'in_progress', 'resolved'][rand(0, 2)],
                    'priority' => ['low', 'medium', 'high'][rand(0, 2)],
                    'created_at' => now()->subDays(rand(1, 7)),
                ]);
            }
        }

        $this->command->info('✅ Dashboard seeded with realistic data!');
    }
}
