<?php

namespace App\Events;

use App\Models\TenantInvitation;
use App\Models\Landlord;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TenantInvited
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TenantInvitation $invitation,
        public Landlord $landlord,
        public string $signedUrl
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('tenant-invitations'),
        ];
    }
}
