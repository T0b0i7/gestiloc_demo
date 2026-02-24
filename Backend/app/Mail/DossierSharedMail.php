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
    public string $frontendUrl;

    public function __construct(Dossier $dossier, Tenant $tenant, ?User $user = null, ?string $externalEmail = null, string $frontendUrl = 'http://localhost:8080')
    {
        $this->dossier = $dossier;
        $this->tenant = $tenant;
        $this->user = $user;
        $this->externalEmail = $externalEmail;
        $this->frontendUrl = $frontendUrl;
    }

    public function envelope(): Envelope
    {
        $subject = '📋 Dossier de candidature partagé : ' . $this->tenant->first_name . ' ' . $this->tenant->last_name . ' - ' . config('app.name');

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.dossier-shared',
        );
    }
}
