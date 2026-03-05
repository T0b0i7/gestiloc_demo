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
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class ApiRoutesTest extends TestCase
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

    // ===== TESTS AUTHENTIFICATION =====
    
    /** @test */
    public function landlord_can_register(): void
    {
        $data = [
            'email' => 'test@landlord.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+22990123456',
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'company_name' => 'Immobilier Benin',
            'address_billing' => 'Cotonou, Benin'
        ];

        $response = $this->postJson('/api/auth/register/landlord', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'user' => ['id', 'email'],
                     'landlord' => ['id', 'first_name', 'last_name']
                 ]);

        $this->assertDatabaseHas('users', ['email' => 'test@landlord.com']);
        $this->assertDatabaseHas('landlords', ['first_name' => 'Jean']);
    }

    /** @test */
    public function user_can_login(): void
    {
        $user = User::factory()->create();
        $user->assignRole('landlord');

        $data = [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'landlord'
        ];

        $response = $this->postJson('/api/auth/login', $data);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'access_token',
                     'token_type',
                     'user' => ['id', 'email', 'roles']
                 ]);

        $this->assertNotNull($response->json('access_token'));
    }

    // ===== TESTS PROFIL =====
    
    /** @test */
    public function authenticated_user_can_view_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/profile');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id', 'email', 'phone', 'roles'
                 ]);
    }

    /** @test */
    public function user_can_update_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'phone' => '+22990123456'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->putJson('/api/profile', $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'phone' => '+22990123456'
        ]);
    }

    // ===== TESTS PROPRIÉTÉS =====
    
    /** @test */
    public function landlord_can_create_property(): void
    {
        $landlord = Landlord::factory()->create();
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'type' => 'apartment',
            'name' => 'Appartement Cotonou',
            'address' => '123 Rue de la Paix',
            'city' => 'Cotonou',
            'surface' => 75.5,
            'room_count' => 3,
            'rent_amount' => 150000,
            'charges_amount' => 25000
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/properties', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'uuid', 'type', 'name', 'address', 'city'
                 ]);

        $this->assertDatabaseHas('properties', [
            'landlord_id' => $landlord->id,
            'name' => 'Appartement Cotonou'
        ]);
    }

    /** @test */
    public function landlord_can_view_own_properties(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/properties');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data');
    }

    /** @test */
    public function landlord_cannot_access_other_properties(): void
    {
        $landlord1 = Landlord::factory()->create();
        $landlord2 = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord2->id]);
        $user = $landlord1->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/properties/' . $property->id);

        $response->assertStatus(403);
    }

    // ===== TESTS LOCATAIRES =====
    
    /** @test */
    public function landlord_can_invite_tenant(): void
    {
        $landlord = Landlord::factory()->create();
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'email' => 'tenant@example.com',
            'name' => 'Marie Martin'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/tenants/invite', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'invitation' => ['id', 'email', 'name', 'token']
                 ]);

        $this->assertDatabaseHas('tenant_invitations', [
            'email' => 'tenant@example.com',
            'name' => 'Marie Martin',
            'landlord_id' => $landlord->id
        ]);
    }

    // ===== TESTS BAUX =====
    
    /** @test */
    public function landlord_can_create_lease(): void
    {
        $landlord = Landlord::factory()->create();
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);
        $tenant = Tenant::factory()->create();
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'property_id' => $property->id,
            'tenant_id' => $tenant->id,
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'rent_amount' => 150000,
            'charges_amount' => 25000,
            'guarantee_amount' => 300000,
            'billing_day' => 1
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/leases', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'uuid', 'lease_number', 'property_id', 'tenant_id'
                 ]);

        $this->assertDatabaseHas('leases', [
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);
    }

    // ===== TESTS FINANCE =====
    
    /** @test */
    public function can_view_invoices(): void
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

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/invoices');

        $response->assertStatus(200);
    }

    /** @test */
    public function can_view_invoice_details(): void
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

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/invoices/' . $invoice->id);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id', 'invoice_number', 'amount_total', 'status'
                 ]);
    }

    /** @test */
    public function landlord_can_send_payment_reminder(): void
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
            'status' => 'pending'
        ]);
        
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/invoices/' . $invoice->id . '/remind');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Relance envoyée avec succès au locataire.']);
    }

    // ===== TESTS LOCATAIRE =====
    
    /** @test */
    public function tenant_can_view_own_leases(): void
    {
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create(['tenant_id' => $tenant->id]);
        $user = $tenant->user;
        $user->assignRole('tenant');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/tenant/my-leases');

        $response->assertStatus(200);
    }

    /** @test */
    public function tenant_can_view_lease_details(): void
    {
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create([
            'tenant_id' => $tenant->id,
            'uuid' => 'test-uuid-123'
        ]);
        $user = $tenant->user;
        $user->assignRole('tenant');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/tenant/my-leases/' . $lease->uuid);

        $response->assertStatus(200);
    }

    /** @test */
    public function tenant_can_create_ticket(): void
    {
        $tenant = Tenant::factory()->create();
        $lease = Lease::factory()->create(['tenant_id' => $tenant->id]);
        $user = $tenant->user;
        $user->assignRole('tenant');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'lease_id' => $lease->id,
            'subject' => 'Problème de plomberie',
            'description' => 'Le robinet de la cuisine fuit',
            'priority' => 'high'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/tenant/tickets', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'subject', 'priority', 'status'
                 ]);
    }

    // ===== TESTS UPLOAD =====
    
    /** @test */
    public function user_can_upload_file(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->image('document.pdf');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/upload', [
            'file' => $file
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'path', 'url', 'filename'
                 ]);
    }

    // ===== TESTS AUTORISATIONS =====
    
    /** @test */
    public function tenant_cannot_access_landlord_routes(): void
    {
        $tenant = Tenant::factory()->create();
        $user = $tenant->user;
        $user->assignRole('tenant');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/tenants');

        $response->assertStatus(403);
    }

    /** @test */
    public function landlord_cannot_access_tenant_routes(): void
    {
        $landlord = Landlord::factory()->create();
        $user = $landlord->user;
        $user->assignRole('landlord');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/tenant/my-leases');

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_request_denied(): void
    {
        $response = $this->getJson('/api/profile');
        $response->assertStatus(401);
    }

    // ===== TESTS DASHBOARD =====
    
    /** @test */
    public function landlord_can_view_dashboard(): void
    {
        $landlord = Landlord::factory()->create();
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
                     'monthly_revenue'
                 ]);
    }
}
