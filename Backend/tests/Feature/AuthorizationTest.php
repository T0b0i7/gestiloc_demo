<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Lease;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthorizationTest extends TestCase
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
    public function roles_can_be_assigned_and_verified(): void
    {
        $user = User::factory()->create();

        // Test role assignment
        $user->assignRole('admin');
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->isAdmin());

        // Remove admin role and assign landlord
        $user->removeRole('admin');
        $user->assignRole('landlord');
        $this->assertTrue($user->hasRole('landlord'));
        $this->assertTrue($user->isLandlord());
        $this->assertFalse($user->isAdmin());

        // Test tenant role
        $user->assignRole('tenant');
        $this->assertTrue($user->hasRole('tenant'));
        $this->assertTrue($user->isTenant());
        $this->assertFalse($user->isLandlord());
        $this->assertFalse($user->isAdmin());
    }

    /** @test */
    public function policies_allow_correct_access(): void
    {
        // Create admin user
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create landlord with property
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);
        $property = Property::factory()->create(['landlord_id' => $landlordProfile->id]);

        // Create tenant
        $tenant = User::factory()->create();
        $tenant->assignRole('tenant');

        // Admin can access all properties
        $this->assertTrue($admin->can('view', $property));
        $this->assertTrue($admin->can('update', $property));
        $this->assertTrue($admin->can('delete', $property));

        // Landlord can access own properties
        $this->assertTrue($landlord->can('view', $property));
        $this->assertTrue($landlord->can('update', $property));
        $this->assertTrue($landlord->can('delete', $property));

        // Tenant cannot access properties
        $this->assertFalse($tenant->can('view', $property));
        $this->assertFalse($tenant->can('update', $property));
        $this->assertFalse($tenant->can('delete', $property));
    }

    /** @test */
    public function landlord_cannot_access_other_landlord_resources(): void
    {
        // Create two landlords
        $landlord1 = User::factory()->create();
        $landlord1->assignRole('landlord');
        $landlord1Profile = Landlord::factory()->create(['user_id' => $landlord1->id]);
        $property1 = Property::factory()->create(['landlord_id' => $landlord1Profile->id]);

        $landlord2 = User::factory()->create();
        $landlord2->assignRole('landlord');
        $landlord2Profile = Landlord::factory()->create(['user_id' => $landlord2->id]);
        $property2 = Property::factory()->create(['landlord_id' => $landlord2Profile->id]);

        // Landlord 1 cannot access landlord 2's property
        $this->assertFalse($landlord1->can('view', $property2));
        $this->assertFalse($landlord1->can('update', $property2));
        $this->assertFalse($landlord1->can('delete', $property2));

        // Landlord 2 cannot access landlord 1's property
        $this->assertFalse($landlord2->can('view', $property1));
        $this->assertFalse($landlord2->can('update', $property1));
        $this->assertFalse($landlord2->can('delete', $property1));
    }

    /** @test */
    public function lease_authorization_works_correctly(): void
    {
        // Create admin
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create landlord with property and tenant
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);
        $property = Property::factory()->create(['landlord_id' => $landlordProfile->id]);

        $tenant = User::factory()->create();
        $tenant->assignRole('tenant');
        $tenantProfile = Tenant::factory()->create(['user_id' => $tenant->id]);

        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenantProfile->id
        ]);

        // Admin can access all leases
        $this->assertTrue($admin->can('view', $lease));
        $this->assertTrue($admin->can('create', Lease::class));

        // Landlord can access their own leases
        $this->assertTrue($landlord->can('view', $lease));
        $this->assertTrue($landlord->can('create', Lease::class));

        // Tenant cannot access leases (they don't have lease policy methods)
        $this->assertFalse($tenant->can('view', $lease));
    }

    /** @test */
    public function middleware_restricts_access_based_on_roles(): void
    {
        // Create users with different roles
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');

        $tenant = User::factory()->create();
        $tenant->assignRole('tenant');

        // Test protected routes are accessible with proper tokens
        $adminToken = $admin->createToken('admin-device')->plainTextToken;
        $landlordToken = $landlord->createToken('landlord-device')->plainTextToken;
        $tenantToken = $tenant->createToken('tenant-device')->plainTextToken;

        // Admin and landlord can access properties (both have access)
        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson('/api/properties')
            ->assertStatus(200);

        $this->withHeader('Authorization', 'Bearer ' . $landlordToken)
            ->getJson('/api/properties')
            ->assertStatus(200);

        // Tenant should be forbidden
        $this->withHeader('Authorization', 'Bearer ' . $tenantToken)
            ->getJson('/api/properties')
            ->assertStatus(403);
    }

    /** @test */
    public function unauthorized_access_is_properly_handled(): void
    {
        // Create landlord
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);

        // Create property for another landlord
        $otherLandlord = User::factory()->create();
        $otherLandlord->assignRole('landlord');
        $otherLandlordProfile = Landlord::factory()->create(['user_id' => $otherLandlord->id]);
        $otherProperty = Property::factory()->create(['landlord_id' => $otherLandlordProfile->id]);

        // Try to access other landlord's property
        $response = $this->actingAs($landlord, 'sanctum')
            ->getJson('/api/properties/' . $otherProperty->id);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }

    /** @test */
    public function token_authentication_works_correctly(): void
    {
        // Create user and token
        $user = User::factory()->create();
        $user->assignRole('landlord');

        $token = $user->createToken('test-device')->plainTextToken;

        // Authenticated request should work
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/properties');

        // Status depends on user role (landlord can access properties)
        $this->assertContains($response->status(), [200, 403]);

        // Unauthenticated request should fail
        $response = $this->getJson('/api/properties');
        $response->assertStatus(401);
    }
}
