<?php

namespace App\Services;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\TenantInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AuthService
{
    /**
     * Register a new landlord (user + landlord record)
     *
     * @param array $data
     * @return array
     * @throws \Throwable
     */
    public function registerLandlord(array $data): array
{
    return DB::transaction(function () use ($data) {
        // Create user
        $user = User::create([
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'], // ENLÈVE le ?? null
        ]);

        // Assign role with Spatie
        $user->assignRole('landlord');

        // Create landlord profile
        $landlord = Landlord::create([
            'user_id' => $user->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'company_name' => $data['company_name'] ?? null,
            'address_billing' => $data['address_billing'] ?? null,
            'vat_number' => $data['vat_number'] ?? null,
            'meta' => $data['meta'] ?? null,
        ]);

        return [
            'user' => $user->only(['id', 'email', 'phone']),
            'landlord' => $landlord->only(['id', 'first_name', 'last_name', 'company_name']),
        ];
    });
}

    /**
     * Login user and return personal access token (Sanctum)
     *
     * @param array $data
     * @return array
     * @throws ValidationException
     */
    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Identifiants invalides']]);
        }

        $deviceName = $data['device_name'] ?? ('api-'.Str::random(8));
        
        // Révoquer les tokens existants si demandé
        if (!empty($data['single_session']) && $data['single_session'] === true) {
            $user->tokens()->delete();
        }

        $token = $user->createToken($deviceName)->plainTextToken;
        $roles = $user->getRoleNames()->toArray();

        return [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'phone' => $user->phone,
                'roles' => $roles,
                'default_role' => !empty($roles) ? $roles[0] : null,
            ],
        ];
    }

    /**
     * Logout: revoke current token
     *
     * @param User $user
     * @param string|null $tokenId optional: id of token to revoke (plain id)
     * @return void
     */
    public function logout(User $user, ?string $tokenId = null): void
    {
        if ($tokenId) {
            $user->tokens()->where('id', $tokenId)->delete();
            return;
        }

        // revoke current token
        request()->user()?->currentAccessToken()?->delete();
    }

    /**
     * Create tenant invitation (landlord invites a tenant)
     *
     * @param int $landlordUserId
     * @param string $email
     * @param string|null $name
     * @param array $meta
     * @param int $ttlDays
     * @return TenantInvitation
     * @throws \Throwable
     */
    public function inviteTenant(int $landlordUserId, string $email, ?string $name = null, array $meta = [], int $ttlDays = 7): TenantInvitation
    {
        return DB::transaction(function () use ($landlordUserId, $email, $name, $meta, $ttlDays) {
            // Create invitation record
            $token = $this->generateInvitationToken();
            $inv = TenantInvitation::create([
                'landlord_id' => $landlordUserId,
                'email' => $email,
                'name' => $name,
                'token' => $token,
                'tenant_user_id' => null,
                'used' => false,
                'expires_at' => Carbon::now()->addDays($ttlDays),
                'meta' => $meta,
            ]);

            // Optionally: dispatch notification/email here

            return $inv;
        });
    }

    /**
     * Set password for tenant via invitation token
     *
     * @param array $data
     * @return array
     * @throws ValidationException|\Throwable
     */
    public function setPassword(array $data): array
    {
        $inv = TenantInvitation::where('token', $data['token'])->first();

        if (!$inv) {
            throw ValidationException::withMessages(['token' => ['Token invalid']]);
        }

        if ($inv->used) {
            throw ValidationException::withMessages(['token' => ['Invitation already used']]);
        }

        if ($inv->expires_at && Carbon::now()->greaterThan($inv->expires_at)) {
            throw ValidationException::withMessages(['token' => ['Invitation expired']]);
        }

        // Optional: enforce password rules here or rely on FormRequest
        if (empty($data['password']) || strlen($data['password']) < 8) {
            throw ValidationException::withMessages(['password' => ['Password does not meet minimum requirements']]);
        }

        return DB::transaction(function () use ($inv, $data) {
            // Find or create user
            $user = $inv->tenant_user_id ? User::find($inv->tenant_user_id) : User::where('email', $inv->email)->first();

            if (!$user) {
                $user = User::create([
                    'email' => $inv->email,
                    'password' => Hash::make($data['password']),
                ]);
            } else {
                $user->password = Hash::make($data['password']);
                $user->save();
            }

            // Assign tenant role
            if (!$user->hasRole('tenant')) {
                $user->assignRole('tenant');
            }

            // Create or update tenant profile
            $tenant = Tenant::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'first_name' => $inv->name ? collect(explode(' ', $inv->name))->first() : 'Tenant',
                    'last_name' => $inv->name ? trim(str_replace(collect(explode(' ', $inv->name))->first(), '', $inv->name)) : null,
                    'status' => 'active',
                    'meta' => $inv->meta ?? null,
                ]
            );

            // Mark invitation used
            $inv->tenant_user_id = $user->id;
            $inv->used = true;
            $inv->save();

            return ['message' => 'Password set. You can login now.'];
        });
    }

    /**
     * Generate secure invitation token
     *
     * @return string
     */
    public function generateInvitationToken(): string
    {
        return hash('sha256', Str::random(80) . microtime(true));
    }

    /**
     * Validate invitation token
     *
     * @param string $token
     * @return TenantInvitation|null
     */
    public function validateInvitationToken(string $token): ?TenantInvitation
    {
        $invitation = TenantInvitation::where('token', $token)->first();

        if (!$invitation || $invitation->used) {
            return null;
        }

        if ($invitation->expires_at && Carbon::now()->greaterThan($invitation->expires_at)) {
            return null;
        }

        return $invitation;
    }
}
