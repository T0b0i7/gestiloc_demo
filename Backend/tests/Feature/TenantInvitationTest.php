<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Landlord;
use App\Models\TenantInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TenantInvitationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'landlord']);
        Role::firstOrCreate(['name' => 'tenant']);

        // Disable notifications during testing
        Notification::fake();
    }

    /** @test */
    public function landlord_can_invite_tenant(): void
    {
        // Create landlord user
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);

        $invitationData = [
            'email' => 'tenant@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe'
        ];

        $response = $this->actingAs($landlord, 'sanctum')
            ->postJson('/api/tenants/invite', $invitationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'invitation' => [
                    'id',
                    'email',
                    'expires_at'
                ]
            ]);

        // Verify invitation was created in database
        $this->assertDatabaseHas('tenant_invitations', [
            'email' => 'tenant@example.com',
            'landlord_id' => $landlordProfile->id
        ]);

        // Verify email notification was sent
        Notification::assertSentTo(
            ['tenant@example.com'],
            \App\Notifications\TenantInvitationNotification::class
        );
    }

    /** @test */
    public function tenant_cannot_invite_other_tenants(): void
    {
        // Create tenant user
        $tenant = User::factory()->create();
        $tenant->assignRole('tenant');

        $invitationData = [
            'email' => 'new-tenant@example.com',
            'first_name' => 'Jane',
            'last_name' => 'Smith'
        ];

        $response = $this->actingAs($tenant, 'sanctum')
            ->postJson('/api/tenants/invite', $invitationData);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }

    /** @test */
    public function invitation_token_validation_works(): void
    {
        // Create landlord
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);

        // Create valid invitation
        $invitation = TenantInvitation::create([
            'landlord_id' => $landlordProfile->id,
            'email' => 'tenant@example.com',
            'name' => 'John Doe',
            'token' => 'valid-token-123',
            'expires_at' => now()->addDays(7),
            'used' => false
        ]);

        // Test invalid token
        $response = $this->postJson('/api/auth/tenant/set-password', [
            'token' => 'invalid-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    /** @test */
    public function invitation_can_be_used_only_once(): void
    {
        // Create landlord
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);

        // Create invitation
        $invitation = TenantInvitation::create([
            'landlord_id' => $landlordProfile->id,
            'email' => 'tenant@example.com',
            'name' => 'John Doe',
            'token' => 'valid-token-123',
            'expires_at' => now()->addDays(7),
            'used' => true // Already used
        ]);

        // Try to use invitation again
        $response = $this->postJson('/api/auth/tenant/set-password', [
            'token' => 'valid-token-123',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    /** @test */
    public function invitation_expires_after_expiration_date(): void
    {
        // Create landlord
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);

        // Create expired invitation
        $invitation = TenantInvitation::create([
            'landlord_id' => $landlordProfile->id,
            'email' => 'tenant@example.com',
            'name' => 'John Doe',
            'token' => 'expired-token-123',
            'expires_at' => now()->subDays(1), // Expired
            'used' => false
        ]);

        // Try to use expired invitation
        $response = $this->postJson('/api/auth/tenant/set-password', [
            'token' => 'expired-token-123',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    /** @test */
    public function accepted_invitation_creates_tenant_user(): void
    {
        // Create landlord
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);

        // Create invitation
        $invitation = TenantInvitation::create([
            'landlord_id' => $landlordProfile->id,
            'email' => 'tenant@example.com',
            'name' => 'John Doe',
            'token' => 'valid-token-123',
            'expires_at' => now()->addDays(7),
            'used' => false
        ]);

        // Accept invitation and set password
        $response = $this->postJson('/api/auth/tenant/set-password', [
            'token' => 'valid-token-123',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123'
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Password set. You can login now.']);

        // Verify user was created
        $this->assertDatabaseHas('users', [
            'email' => 'tenant@example.com'
        ]);

        $user = User::where('email', 'tenant@example.com')->first();
        $this->assertTrue($user->hasRole('tenant'));

        // Verify tenant profile was created
        $this->assertDatabaseHas('tenants', [
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Doe'
        ]);

        // Verify invitation was marked as used
        $this->assertTrue($invitation->fresh()->used);
    }

    /** @test */
    public function landlord_can_list_tenants_and_invitations(): void
    {
        // Create landlord
        $landlord = User::factory()->create();
        $landlord->assignRole('landlord');
        $landlordProfile = Landlord::factory()->create(['user_id' => $landlord->id]);

        // Create some invitations
        TenantInvitation::create([
            'landlord_id' => $landlordProfile->id,
            'email' => 'invited1@example.com',
            'name' => 'Invited User 1',
            'token' => 'token1',
            'expires_at' => now()->addDays(7),
            'used' => false
        ]);

        TenantInvitation::create([
            'landlord_id' => $landlordProfile->id,
            'email' => 'invited2@example.com',
            'name' => 'Invited User 2',
            'token' => 'token2',
            'expires_at' => now()->addDays(7),
            'used' => false
        ]);

        $response = $this->actingAs($landlord, 'sanctum')
            ->getJson('/api/tenants');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'tenant_emails_invited',
                'tenant_user_records',
                'leases_tenants'
            ]);

        $data = $response->json();
        $this->assertCount(2, $data['tenant_emails_invited']);
    }
}
