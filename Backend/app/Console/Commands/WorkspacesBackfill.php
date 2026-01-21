<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class WorkspacesBackfill extends Command
{
    protected $signature = 'workspaces:backfill {--dry-run}';
    protected $description = 'Crée workspaces + members owner + remplit workspace_id dans landlords/properties';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $landlords = DB::table('landlords')
            ->select('id','user_id','first_name','last_name','company_name','workspace_id')
            ->orderBy('id')
            ->get();

        foreach ($landlords as $l) {
            if (!$l->user_id) {
                $this->warn("Skip landlord #{$l->id}: user_id manquant");
                continue;
            }

            if ($l->workspace_id) {
                // déjà OK
                continue;
            }

            $name = trim(($l->company_name ?? '') !== ''
                ? $l->company_name
                : trim(($l->first_name ?? '') . ' ' . ($l->last_name ?? ''))
            );
            if ($name === '') $name = 'Mon portefeuille';

            if ($dry) {
                $this->line("[DRY] create workspace '{$name}' for landlord #{$l->id}");
                continue;
            }

            DB::transaction(function () use ($l, $name) {
                $now = now();

                $workspaceId = DB::table('workspaces')->insertGetId([
                    'name' => $name,
                    'created_by_user_id' => $l->user_id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('landlords')->where('id', $l->id)->update([
                    'workspace_id' => $workspaceId,
                ]);

                DB::table('workspace_members')->updateOrInsert(
                    ['workspace_id' => $workspaceId, 'user_id' => $l->user_id],
                    [
                        'role' => 'owner',
                        'permissions' => json_encode(['view']),
                        'status' => 'active',
                        'joined_at' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );

                DB::table('properties')
                    ->where('landlord_id', $l->id)
                    ->whereNull('workspace_id')
                    ->update(['workspace_id' => $workspaceId]);
            });

            $this->info("OK landlord #{$l->id} => workspace created");
        }

        $this->info('Backfill terminé.');
        return self::SUCCESS;
    }
}
