<?php

namespace App\Mail;

use App\Models\Note;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NoteSharedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $note;
    public $tenant;
    public $recipient;

    public function __construct(Note $note, Tenant $tenant, User $recipient)
    {
        $this->note = $note;
        $this->tenant = $tenant;
        $this->recipient = $recipient;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Une note vous a été partagée - Gestiloc',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.note-shared',
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        if ($this->note->files) {
            foreach ($this->note->files as $file) {
                $attachments[] = storage_path('app/public/' . $file);
            }
        }

        return $attachments;
    }
}
