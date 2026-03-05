<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\TenantInvitation;
use Illuminate\Notifications\Messages\MailMessage;

class TenantInvitationNotification extends Notification
{
    use Queueable;

    protected TenantInvitation $invitation;
    protected string $signedUrl;

    public function __construct(TenantInvitation $invitation, string $signedUrl)
    {
        $this->invitation = $invitation;
        $this->signedUrl = $signedUrl;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $expires = $this->invitation->expires_at ? $this->invitation->expires_at->toDateTimeString() : 'soon';

        return (new MailMessage)
            ->subject('Invitation pour créer votre compte locataire')
            ->greeting('Bonjour '.($this->invitation->name ?? ''))
            ->line('Vous avez été invité à rejoindre la plateforme en tant que locataire.')
            ->line('Cliquez sur le lien ci-dessous pour accepter l’invitation et définir votre mot de passe. Le lien expire le '.$expires)
            ->action('Accepter l’invitation', $this->signedUrl)
            ->line('Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.');
    }
}
