<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PropertyManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'landlord']);
        Role::firstOrCreate(['name' => 'tenant']);
    }

    /** @test */
    public function landlord_can_create_property(): void
    {
        // Create landlord user
        $user = User::factory()->create();
        $user->assignRole('landlord');
        $landlord = Landlord::factory()->create(['user_id' => $user->id]);

        $propertyData = [
            'type' => 'apartment',
            'title' => 'Beautiful Apartment',
            'description' => 'A nice place to live',
            'address' => '123 Main Street',
            'city' => 'Paris',
            'surface' => 50.5,
            'rent_amount_default' => 1200.00,
            'reference' => 'APT-001',
            'status' => 'available'
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/properties', $propertyData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'type',
                'title',
                'landlord_id',
                'created_at',
                'updated_at'
            ]);

        $this->assertDatabaseHas('properties', [
            'title' => 'Beautiful Apartment',
            'landlord_id' => $landlord->id
        ]);
    }

    /** @test */
    public function landlord_cannot_access_other_landlord_property(): void
    {
        // Create two landlords
        $landlord1 = User::factory()->create();
        $landlord1->assignRole('landlord');
        $landlord1Profile = Landlord::factory()->create(['user_id' => $landlord1->id]);

        $landlord2 = User::factory()->create();
        $landlord2->assignRole('landlord');
        $landlord2Profile = Landlord::factory()->create(['user_id' => $landlord2->id]);

        // Create property for landlord 2
        $property = Property::factory()->create(['landlord_id' => $landlord2Profile->id]);

        // Landlord 1 tries to access landlord 2's property
        $response = $this->actingAs($landlord1, 'sanctum')
            ->getJson('/api/properties/' . $property->id);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }

    /** @test */
    public function admin_can_access_all_properties(): void
    {
        // Create admin user
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create landlord with property
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);
        $property = Property::factory()->create(['landlord_id' => $landlordProfile->id]);

        // Admin accesses the property
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/properties/' . $property->id);

        $response->assertStatus(200)
            ->assertJson(['id' => $property->id]);
    }

    /** @test */
    public function tenant_cannot_access_properties(): void
    {
        // Create tenant user
        $tenant = User::factory()->create();
        $tenant->assignRole('tenant');

        // Admin creates a property for testing
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $adminProfile = Landlord::factory()->create(['user_id' => $admin->id]);
        $property = Property::factory()->create(['landlord_id' => $adminProfile->id]);

        // Tenant tries to access properties
        $response = $this->actingAs($tenant, 'sanctum')
            ->getJson('/api/properties');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }

    /** @test */
    public function landlord_can_update_their_property(): void
    {
        $user = User::factory()->create();
        $user->assignRole('landlord');
        $landlord = Landlord::factory()->create(['user_id' => $user->id]);
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);

        $updateData = [
            'title' => 'Updated Title',
            'rent_amount_default' => 1500.00
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/properties/' . $property->id, $updateData);

        $response->assertStatus(200)
            ->assertJson(['title' => 'Updated Title']);

        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'title' => 'Updated Title',
            'rent_amount_default' => 1500.00
        ]);
    }

    /** @test */
    public function landlord_can_delete_their_property(): void
    {
        $user = User::factory()->create();
        $user->assignRole('landlord');
        $landlord = Landlord::factory()->create(['user_id' => $user->id]);
        $property = Property::factory()->create(['landlord_id' => $landlord->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/properties/' . $property->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Property deleted']);

        $this->assertDatabaseMissing('properties', ['id' => $property->id]);
    }

    /** @test */
    public function property_listing_respects_user_role(): void
    {
        // Create admin
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create landlord with properties
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);
        Property::factory()->count(3)->create(['landlord_id' => $landlordProfile->id]);

        // Admin sees all properties
        $adminResponse = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/properties');

        $adminResponse->assertStatus(200);
        $adminData = $adminResponse->json();
        $this->assertCount(3, $adminData['data']);

        // Landlord sees only their properties
        $landlordResponse = $this->actingAs($landlord, 'sanctum')
            ->getJson('/api/properties');

        $landlordResponse->assertStatus(200);
        $landlordData = $landlordResponse->json();
        $this->assertCount(3, $landlordData['data']);
    }
}
