<?php
// app/Mail/PaymentNotificationMail.php

namespace App\Mail;

use App\Models\Payment;
use App\Models\PropertyDelegation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public string $recipientType;
    public ?PropertyDelegation $delegation;

    public function __construct(Payment $payment, string $recipientType, ?PropertyDelegation $delegation = null)
    {
        $this->payment = $payment;
        $this->recipientType = $recipientType;
        $this->delegation = $delegation;
    }

    public function envelope(): Envelope
    {
        $subject = '💰 Paiement de loyer reçu - ' . config('app.name');

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-notification',
        );
    }
}
