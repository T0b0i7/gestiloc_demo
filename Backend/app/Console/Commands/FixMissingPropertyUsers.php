<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lease;
use App\Models\PropertyUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixMissingPropertyUsers extends Command
{
    protected $signature = 'fix:property-users';
    protected $description = 'Crée les enregistrements manquants dans property_user pour tous les baux existants';

    public function handle(): int
    {
        $this->info('Recherche des baux sans attribution property_user...');

        $leases = Lease::with(['property', 'tenant'])
            ->whereIn('status', ['active', 'pending'])
            ->get();

        $createdCount = 0;
        $errorCount = 0;

        foreach ($leases as $lease) {
            // Vérifier si une attribution existe déjà
            $existing = PropertyUser::where('lease_id', $lease->id)
                ->orWhere(function($query) use ($lease) {
                    $query->where('property_id', $lease->property_id)
                          ->where('tenant_id', $lease->tenant_id)
                          ->where('status', 'active');
                })
                ->exists();

            if ($existing) {
                $this->line("✓ Attribution existe déjà pour le bail {$lease->id}");
                continue;
            }

            try {
                DB::transaction(function () use ($lease, &$createdCount) {
                    $propertyUser = PropertyUser::create([
                        'property_id' => $lease->property_id,
                        'user_id' => $lease->tenant->user_id,
                        'tenant_id' => $lease->tenant_id,
                        'lease_id' => $lease->id,
                        'landlord_id' => $lease->property->landlord_id,
                        'role' => 'tenant',
                        'share_percentage' => 100,
                        'start_date' => $lease->start_date,
                        'end_date' => $lease->end_date,
                        'status' => $lease->status === 'terminated' ? 'terminated' : 'active',
                    ]);

                    $createdCount++;
                    $this->info("✓ Créé property_user #{$propertyUser->id} pour le bail {$lease->id}");

                    Log::info('PropertyUser créé via fix command', [
                        'lease_id' => $lease->id,
                        'property_user_id' => $propertyUser->id,
                    ]);
                });
            } catch (\Exception $e) {
                $errorCount++;
                $this->error("✗ Erreur pour le bail {$lease->id}: " . $e->getMessage());
                Log::error('Erreur création PropertyUser', [
                    'lease_id' => $lease->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("Terminé ! {$createdCount} attributions créées, {$errorCount} erreurs");

        return 0;
    }
}
