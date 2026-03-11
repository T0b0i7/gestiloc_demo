<?php

namespace App\Services;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Agency;
use App\Models\TenantInvitation;
use App\Models\CoOwnerInvitation;
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
    $user = User::with(['landlord', 'tenant'])->where('email', $data['email'])->first();

    if (!$user || !Hash::check($data['password'], $user->password)) {
        throw ValidationException::withMessages(['email' => ['Identifiants invalides']]);
    }

    $deviceName = $data['device_name'] ?? ('api-'.Str::random(8));
    
    if (!empty($data['single_session']) && $data['single_session'] === true) {
        $user->tokens()->delete();
    }

    $token = $user->createToken($deviceName)->plainTextToken;
    $roles = $user->getRoleNames()->toArray();

    // Récupérer les infos depuis landlord ou tenant
    $profile = $user->landlord ?? $user->tenant;
    $firstName = $profile->first_name ?? null;
    $lastName = $profile->last_name ?? null;
    $address = $user->landlord->address_billing ?? null;
    $companyName = $user->landlord->company_name ?? null;

    return [
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => [
            'id' => $user->id,
            'email' => $user->email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $user->phone,
            'address' => $address,
            'company_name' => $companyName,
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
            throw ValidationException::withMessages(['token' => ["Jeton d'invitation invalide"]]);
        }

        if ($inv->used) {
            throw ValidationException::withMessages(['token' => ["L'invitation a déjà été utilisée"]]);
        }

        if ($inv->expires_at && Carbon::now()->greaterThan($inv->expires_at)) {
            throw ValidationException::withMessages(['token' => ["L'invitation a expiré"]]);
        }

        // Optional: enforce password rules here or rely on FormRequest
        if (empty($data['password']) || strlen($data['password']) < 8) {
            throw ValidationException::withMessages(['password' => ["Le mot de passe ne respecte pas les critères minimum"]]);
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

            return ['message' => 'Le mot de passe a été défini. Vous pouvez maintenant vous connecter.'];
        });
    }

    /**
     * Generate secure invitation token
     *
     * @return string
     */
    public function generateInvitationToken(): string
    {
        return hash('sha256', Str::random(60) . microtime(true));
    }

    /**
     * Register a new co-owner (utilise landlords ou agencies selon le type)
     *
     * @param array $data
     * @return array
     */
    public function registerCoOwner(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // Create user
            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'],
            ]);

            // Assign role with Spatie
            $user->assignRole('co_owner');

            // Créer le profil selon le type (particulier vs agence)
            if ($data['is_professional'] ?? false) {
                // Co-owner agence → table agencies
                $coOwner = Agency::create([
                    'user_id' => $user->id,
                    'agency_type' => 'co_owner_agency',
                    'company_name' => $data['company_name'] ?? null,
                    'license_number' => $data['license_number'] ?? null,
                    'address' => $data['address'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'email' => $data['email'] ?? null,
                    'is_professional' => true,
                    'id_type' => $data['id_type'] ?? null,
                    'id_number' => $data['id_number'] ?? null,
                    'ifu' => $data['ifu'] ?? null,
                    'rccm' => $data['rccm'] ?? null,
                    'vat_number' => $data['vat_number'] ?? null,
                    'meta' => $data['meta'] ?? null,
                ]);

                return [
                    'user' => $user->only(['id', 'email', 'phone']),
                    'co_owner' => [
                        'type' => 'agency',
                        'data' => $coOwner->only(['id', 'company_name', 'license_number', 'ifu', 'rccm']),
                    ],
                ];
            } else {
                // Co-owner particulier → table landlords
                $coOwner = Landlord::create([
                    'user_id' => $user->id,
                    'owner_type' => 'co_owner',
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'company_name' => $data['company_name'] ?? null,
                    'address_billing' => $data['address_billing'] ?? null,
                    'vat_number' => $data['vat_number'] ?? null,
                    'meta' => $data['meta'] ?? null,
                ]);

                return [
                    'user' => $user->only(['id', 'email', 'phone']),
                    'co_owner' => [
                        'type' => 'landlord',
                        'data' => $coOwner->only(['id', 'first_name', 'last_name', 'company_name']),
                    ],
                ];
            }
        });
    }

    /**
     * Invite a co-owner
     *
     * @param int $landlordUserId
     * @param string $email
     * @param string|null $name
     * @param array $meta
     * @param int $ttlDays
     * @return CoOwnerInvitation
     * @throws \Throwable
     */
    public function inviteCoOwner(int $landlordUserId, string $email, ?string $name = null, array $meta = [], int $ttlDays = 7): CoOwnerInvitation
    {
        return DB::transaction(function () use ($landlordUserId, $email, $name, $meta, $ttlDays) {
            // Create invitation record
            $token = $this->generateInvitationToken();
            $inv = CoOwnerInvitation::create([
                'landlord_id' => $landlordUserId,
                'email' => $email,
                'name' => $name,
                'token' => $token,
                'co_owner_user_id' => null,
                'used' => false,
                'expires_at' => Carbon::now()->addDays($ttlDays),
                'meta' => $meta,
            ]);

            // Optionally: dispatch notification/email here

            return $inv;
        });
    }

    /**
     * Set password for co-owner via invitation token
     *
     * @param array $data
     * @return array
     * @throws ValidationException|\Throwable
     */
    public function setCoOwnerPassword(array $data): array
    {
        $inv = CoOwnerInvitation::where('token', $data['token'])->first();

        if (!$inv) {
            throw ValidationException::withMessages(['token' => ["Jeton d'invitation invalide"]]);
        }

        if ($inv->used) {
            throw ValidationException::withMessages(['token' => ["L'invitation a déjà été utilisée"]]);
        }

        if ($inv->expires_at && Carbon::now()->greaterThan($inv->expires_at)) {
            throw ValidationException::withMessages(['token' => ["L'invitation a expiré"]]);
        }

        // Optional: enforce password rules here or rely on FormRequest
        if (empty($data['password']) || strlen($data['password']) < 8) {
            throw ValidationException::withMessages(['password' => ["Le mot de passe ne respecte pas les critères minimum"]]);
        }

        return DB::transaction(function () use ($inv, $data) {
            // Find or create user
            $user = $inv->co_owner_user_id ? User::find($inv->co_owner_user_id) : User::where('email', $inv->email)->first();

            if (!$user) {
                $user = User::create([
                    'email' => $inv->email,
                    'password' => Hash::make($data['password']),
                    'phone' => $data['phone'] ?? null,
                ]);
            } else {
                $user->password = Hash::make($data['password']);
                if (isset($data['phone'])) {
                    $user->phone = $data['phone'];
                }
                $user->save();
            }

            // Assign co-owner role
            if (!$user->hasRole('co_owner')) {
                $user->assignRole('co_owner');
            }

            // Create or update co-owner profile
            $coOwner = Landlord::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'owner_type' => 'co_owner',
                    'first_name' => $inv->meta['first_name'] ?? collect(explode(' ', $inv->name))->first() ?? 'Co-owner',
                    'last_name' => $inv->meta['last_name'] ?? trim(str_replace(collect(explode(' ', $inv->name))->first(), '', $inv->name)) ?? null,
                    'company_name' => $inv->meta['company_name'] ?? null,
                    'address_billing' => $inv->meta['address_billing'] ?? null,
                    'license_number' => $inv->meta['license_number'] ?? null,
                    'is_professional' => $inv->meta['is_professional'] ?? false,
                    'ifu' => $inv->meta['ifu'] ?? null,
                    'rccm' => $inv->meta['rccm'] ?? null,
                    'vat_number' => $inv->meta['vat_number'] ?? null,
                    'meta' => $inv->meta ?? null,
                ]
            );

            // Mark invitation used
            $inv->co_owner_user_id = $user->id;
            $inv->used = true;
            $inv->accepted_at = now();
            $inv->save();

            return ['message' => 'Le mot de passe a été défini. Vous pouvez maintenant vous connecter.'];
        });
    }

    /**
     * Validate co-owner invitation token
     *
     * @param string $token
     * @return CoOwnerInvitation|null
     */
    public function validateCoOwnerInvitationToken(string $token): ?CoOwnerInvitation
    {
        $invitation = CoOwnerInvitation::where('token', $token)->first();

        if (!$invitation || $invitation->used) {
            return null;
        }

        if ($invitation->expires_at && Carbon::now()->greaterThan($invitation->expires_at)) {
            return null;
        }

        return $invitation;
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

    /**
     * Generate a password reset token for a user
     *
     * @param string $email
     * @return string|null
     */
    public function createPasswordResetToken(string $email): ?string
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            return null;
        }

        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        return $token;
    }

    /**
     * Reset the user's password using a valid token
     *
     * @param array $data
     * @return void
     * @throws ValidationException
     */
    public function resetPassword(array $data): void
    {
        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (!$record || !Hash::check($data['token'], $record->token)) {
            throw ValidationException::withMessages(['token' => ['Le jeton de réinitialisation est invalide.']]);
        }

        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            throw ValidationException::withMessages(['token' => ['Le jeton de réinitialisation a expiré.']]);
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            throw ValidationException::withMessages(['email' => ['Utilisateur non trouvé.']]);
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
    }
}
