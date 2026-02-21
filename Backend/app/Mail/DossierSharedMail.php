<?php
// app/Mail/DossierSharedMail.php

namespace App\Mail;

use App\Models\Dossier;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DossierSharedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Dossier $dossier;
    public Tenant $tenant;
    public ?User $user;
    public ?string $externalEmail;

    public function __construct(Dossier $dossier, Tenant $tenant, ?User $user = null, ?string $externalEmail = null)
    {
        $this->dossier = $dossier;
        $this->tenant = $tenant;
        $this->user = $user;
        $this->externalEmail = $externalEmail;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Un dossier de candidature vous a été partagé - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.dossier-shared',
        );
    }
}
