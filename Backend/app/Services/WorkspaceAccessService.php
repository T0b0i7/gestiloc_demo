<?php

namespace App\Services;

use App\Models\User;
use App\Models\WorkspaceMember;

class WorkspaceAccessService
{
    public function member(User $user, ?int $workspaceId = null): ?WorkspaceMember
    {
        $q = WorkspaceMember::query()->where('user_id', $user->id)->active();
        if ($workspaceId) $q->where('workspace_id', $workspaceId);
        return $q->first();
    }

    public function can(User $user, string $ability, ?int $workspaceId = null): bool
    {
        $member = $this->member($user, $workspaceId);
        if (!$member) return false;

        $perms = $member->effectivePermissions();
        if (in_array('*', $perms, true)) return true;

        // owner = view only
        return $ability === 'view';
    }
}
