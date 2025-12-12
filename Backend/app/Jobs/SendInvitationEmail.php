<?php

namespace App\Jobs;

use App\Models\TenantInvitation;
use App\Notifications\TenantInvitationNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class SendInvitationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public TenantInvitation $invitation,
        public string $signedUrl
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Send the invitation email
        Notification::route('mail', $this->invitation->email)
            ->notify(new TenantInvitationNotification($this->invitation, $this->signedUrl));
    }

    /**
     * The job failed to process.
     */
    public function failed(\Throwable $exception): void
    {
        // Log the failure or take other appropriate action
        logger()->error('Failed to send invitation email', [
            'invitation_id' => $this->invitation->id,
            'email' => $this->invitation->email,
            'error' => $exception->getMessage()
        ]);
    }
}
