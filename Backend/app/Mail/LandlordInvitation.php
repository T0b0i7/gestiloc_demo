<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LandlordInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $landlordName;
    public $invitationMessage;
    public $tenantInfo;

    /**
     * Create a new message instance.
     */
    public function __construct(string $landlordName, string $invitationMessage, array $tenantInfo)
    {
        $this->landlordName = $landlordName;
        $this->invitationMessage = $invitationMessage;
        $this->tenantInfo = (object) $tenantInfo; // Convertir en objet pour faciliter l'accès dans la vue
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invitation à rejoindre Gestiloc',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.landlord-invitation',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
