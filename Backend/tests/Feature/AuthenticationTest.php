<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Landlord;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationTest extends TestCase
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
    public function landlord_can_register(): void
    {
        $authService = new AuthService();

        $data = [
            'email' => 'landlord@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'phone' => '+33123456789',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'company_name' => 'Test Company',
            'address_billing' => '123 Main St',
        ];

        $result = $authService->registerLandlord($data);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('landlord', $result);
        $this->assertEquals('landlord@example.com', $result['user']['email']);

        $user = User::where('email', 'landlord@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('landlord'));

        $landlord = Landlord::where('user_id', $user->id)->first();
        $this->assertNotNull($landlord);
        $this->assertEquals('John', $landlord->first_name);
    }

    /** @test */
    public function landlord_can_login(): void
    {
        $user = User::factory()->create();
        $user->assignRole('landlord');

        $authService = new AuthService();

        $data = [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'landlord',
        ];

        $result = $authService->login($data);

        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('token_type', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertEquals('Bearer', $result['token_type']);
        $this->assertTrue(in_array('landlord', $result['user']['roles']));
    }

    /** @test */
    public function cannot_login_with_wrong_credentials(): void
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $authService = new AuthService();

        $data = [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
            'role' => 'landlord',
        ];

        $authService->login($data);
    }

    /** @test */
    public function cannot_login_with_wrong_role(): void
    {
        $user = User::factory()->create();
        $user->assignRole('landlord');

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $authService = new AuthService();

        $data = [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'tenant', // Wrong role
        ];

        $authService->login($data);
    }

    /** @test */
    public function tenant_can_set_password_via_invitation(): void
    {
        $invitation = \App\Models\TenantInvitation::factory()->create([
            'email' => 'tenant@example.com',
            'token' => 'test-token-123',
            'used' => false,
        ]);

        $authService = new AuthService();

        $data = [
            'token' => 'test-token-123',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ];

        $result = $authService->setPassword($data);

        $this->assertArrayHasKey('message', $result);

        $user = User::where('email', 'tenant@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('tenant'));

        $this->assertTrue($invitation->fresh()->used);
    }

    /** @test */
    public function cannot_set_password_with_invalid_token(): void
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $authService = new AuthService();

        $data = [
            'token' => 'invalid-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ];

        $authService->setPassword($data);
    }
}
