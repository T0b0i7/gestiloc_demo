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

    public function __construct(Document $document, Tenant $tenant, ?User $user = null, ?string $externalEmail = null)
    {
        $this->document = $document;
        $this->tenant = $tenant;
        $this->user = $user;
        $this->externalEmail = $externalEmail;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Un document vous a été partagé - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document-shared',
        );
    }
}
