<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invoice;
    public $url;

    public function __construct($invoice, $url)
    {
        $this->invoice = $invoice;
        $this->url = $url;
    }

    public function build()
    {
        return $this->subject('Paiement de votre facture')
            ->view('emails.payment_link')
            ->with(['invoice' => $this->invoice, 'url' => $this->url]);
    }
}
