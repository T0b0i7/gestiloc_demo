<?php
// app/Mail/DocumentSharedMail.php

namespace App\Mail;

use App\Models\Document;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentSharedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Document $document;
    public Tenant $tenant;
    public ?User $user;
    public ?string $externalEmail;
    public string $frontendUrl;

    public function __construct(Document $document, Tenant $tenant, ?User $user = null, ?string $externalEmail = null, string $frontendUrl = 'http://localhost:8080')
    {
        $this->document = $document;
        $this->tenant = $tenant;
        $this->user = $user;
        $this->externalEmail = $externalEmail;
        $this->frontendUrl = $frontendUrl;
    }

    public function envelope(): Envelope
    {
        $subject = '📄 Document partagé : ' . $this->document->name . ' - ' . config('app.name');

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document-shared',
        );
    }
}
