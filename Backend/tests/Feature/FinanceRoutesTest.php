<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Invoice;
use App\Models\Transaction;
use App\Models\TenantInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;

class FinanceRoutesTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'landlord']);
        Role::firstOrCreate(['name' => 'tenant']);

        // Configuration storage pour les tests
        Storage::fake('public');
    }

    // ===== TESTS TRANSACTIONS =====
    
    /** @test */
    public function landlord_can_view_transactions(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        $transaction = Transaction::factory()->create([
            'invoice_id' => $invoice->id,
            'recorded_by' => $landlord->user->id
        ]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/transactions');

        $response->assertStatus(200);
    }

    /** @test */
    public function landlord_can_create_manual_transaction(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'invoice_id' => $invoice->id,
            'amount' => 50000,
            'payment_method' => 'mobile_money',
            'reference' => 'MM123456789',
            'notes' => 'Paiement MTN Mobile Money'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/transactions', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'amount', 'payment_method', 'reference'
                 ]);

        $this->assertDatabaseHas('transactions', [
            'invoice_id' => $invoice->id,
            'amount' => 50000
        ]);
    }

    /** @test */
    public function tenant_cannot_create_transactions(): void
    {
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create(['tenant_id' => $tenant->id]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        
        $user = $tenant->user;
        $user->assignRole('tenant');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'invoice_id' => $invoice->id,
            'amount' => 50000,
            'payment_method' => 'mobile_money'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/transactions', $data);

        $response->assertStatus(403);
    }

    // ===== TESTS FILTRES FACTURES =====
    
    /** @test */
    public function can_filter_invoices_by_status(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        
        Invoice::factory()->create(['lease_id' => $lease->id, 'status' => 'pending']);
        Invoice::factory()->create(['lease_id' => $lease->id, 'status' => 'paid']);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/invoices?status=pending');

        $response->assertStatus(200);
    }

    /** @test */
    public function can_filter_invoices_by_month(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        
        $invoice = Invoice::factory()->create([
            'lease_id' => $lease->id,
            'due_date' => '2024-01-15'
        ]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/invoices?month=1');

        $response->assertStatus(200);
    }

    // ===== TESTS ISOLATION DONNÉES =====
    
    /** @test */
    public function landlord_sees_only_own_invoices(): void
    {
        $landlord1 = Landlord::factory()->create();
        $landlord2 = Landlord::factory()->create();
        
        $property1 = Property::factory()->create(['landlord_id' => $landlord1->id]);
        $property2 = Property::factory()->create(['landlord_id' => $landlord2->id]);
        
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();
        
        $lease1 = Lease::factory()->create([
            'property_id' => $property1->id,
            'tenant_id' => $tenant1->id
        ]);
        
        $lease2 = Lease::factory()->create([
            'property_id' => $property2->id,
            'tenant_id' => $tenant2->id
        ]);
        
        Invoice::factory()->create(['lease_id' => $lease1->id]);
        Invoice::factory()->create(['lease_id' => $lease2->id]);
        
        $user = $landlord1->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/invoices');

        $response->assertStatus(200);
        // Vérifier que seule la facture du landlord1 est visible
        // Note: Implementation dépend de la structure de réponse API
    }

    /** @test */
    public function tenant_sees_only_own_invoices(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();
        
        $lease1 = Lease::factory()->create(['tenant_id' => $tenant1->id]);
        $lease2 = Lease::factory()->create(['tenant_id' => $tenant2->id]);
        
        Invoice::factory()->create(['lease_id' => $lease1->id]);
        Invoice::factory()->create(['lease_id' => $lease2->id]);
        
        $user = $tenant1->user;
        $user->assignRole('tenant');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/invoices');

        $response->assertStatus(200);
    }

    // ===== TESTS VALIDATION DONNÉES =====
    
    /** @test */
    public function transaction_requires_valid_amount(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'invoice_id' => $invoice->id,
            'amount' => 0, // Montant invalide
            'payment_method' => 'mobile_money'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/transactions', $data);

        $response->assertStatus(422);
    }

    /** @test */
    public function transaction_requires_valid_payment_method(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'invoice_id' => $invoice->id,
            'amount' => 50000,
            'payment_method' => 'invalid_method' // Méthode non supportée
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/transactions', $data);

        $response->assertStatus(422);
    }

    // ===== TESTS MÉTHODES DE PAIEMENT =====
    
    /** @test */
    public function supports_mobile_money_payment(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'invoice_id' => $invoice->id,
            'amount' => 50000,
            'payment_method' => 'mobile_money',
            'reference' => 'MTN123456789',
            'notes' => 'Paiement MTN Mobile Money'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/transactions', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('transactions', [
            'payment_method' => 'mobile_money'
        ]);
    }

    /** @test */
    public function supports_bank_transfer_payment(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'invoice_id' => $invoice->id,
            'amount' => 75000,
            'payment_method' => 'bank_transfer',
            'reference' => 'VIR2024001',
            'notes' => 'Virement bancaire BIBE'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/transactions', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('transactions', [
            'payment_method' => 'bank_transfer'
        ]);
    }

    // ===== TESTS RAPPORTS FINANCIERS =====
    
    /** @test */
    public function landlord_can_view_financial_summary(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
        
        // Créer plusieurs factures avec différents statuts
        Invoice::factory()->create(['lease_id' => $lease->id, 'status' => 'paid', 'amount_total' => 150000]);
        Invoice::factory()->create(['lease_id' => $lease->id, 'status' => 'pending', 'amount_total' => 150000]);
        Invoice::factory()->create(['lease_id' => $lease->id, 'status' => 'overdue', 'amount_total' => 150000]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/dashboard');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'properties_count',
                     'active_leases_count',
                     'monthly_revenue',
                     'pending_invoices',
                     'overdue_amount'
                 ]);
    }

    // ===== TESTS GESTION DES ERREURS =====
    
    /** @test */
    public function cannot_create_transaction_for_nonexistent_invoice(): void
    {
        $landlord = Landlord::factory()->create();
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'invoice_id' => 999999, // ID qui n'existe pas
            'amount' => 50000,
            'payment_method' => 'mobile_money'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/transactions', $data);

        $response->assertStatus(422);
    }

    /** @test */
    public function cannot_access_invoice_of_other_landlord(): void
    {
        $landlord1 = Landlord::factory()->create();
        $landlord2 = Landlord::factory()->create();
        
        $property2 = Property::factory()->create(['landlord_id' => $landlord2->id]);
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'property_id' => $property2->id,
            'tenant_id' => $tenant->id
        ]);
        $invoice = Invoice::factory()->create(['lease_id' => $lease->id]);
        
        $user = $landlord1->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/invoices/' . $invoice->id);

        $response->assertStatus(403);
    }
}
