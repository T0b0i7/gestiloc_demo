<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CoOwnerInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $invitation;
    public $token;
    public $inviterName;

    public function __construct($invitation, $token, $inviterName)
    {
        $this->invitation = $invitation;
        $this->token = $token;
        $this->inviterName = $inviterName;
    }

public function build()
{
    // Redirige vers React sur le port 8080 - VERSION CORRIGÉE
    $acceptUrl = 'http://localhost:8080/activation/coproprietaire?token=' . $this->token . '&email=' . urlencode($this->invitation->email);

    return $this->subject('Invitation à rejoindre ImmoLab en tant que co-propriétaire')
                ->view('emails.co-owner-invitation')
                ->with([
                    'acceptUrl' => $acceptUrl,
                    'inviterName' => $this->inviterName,
                    'email' => $this->invitation->email,
                    'expiresAt' => \Carbon\Carbon::parse($this->invitation->expires_at)->format('d/m/Y')
                ]);
}
}
