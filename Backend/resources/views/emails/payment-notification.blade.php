{{-- resources/views/emails/payment-notification.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paiement de loyer reçu</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            background: #70AE48;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .payment-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #666;
        }
        .detail-value {
            font-weight: 500;
            color: #333;
        }
        .amount {
            font-size: 20px;
            color: #70AE48;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
        }
        .button {
            display: inline-block;
            background: #70AE48;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Paiement de loyer reçu</h1>
        </div>

        <div class="content">
            <p>Bonjour,</p>

            <p><strong>{{ $payment->tenant->first_name }} {{ $payment->tenant->last_name }}</strong> vient d'effectuer un paiement de loyer.</p>

            <div class="payment-details">
                <h3 style="margin-top: 0;">Détails du paiement</h3>

                <div class="detail-row">
                    <span class="detail-label">Locataire :</span>
                    <span class="detail-value">{{ $payment->tenant->first_name }} {{ $payment->tenant->last_name }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Email :</span>
                    <span class="detail-value">{{ $payment->tenant->user->email }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Bien :</span>
                    <span class="detail-value">{{ $payment->lease->property->name }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Adresse :</span>
                    <span class="detail-value">{{ $payment->lease->property->address }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Montant :</span>
                    <span class="detail-value amount">{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Date de paiement :</span>
                    <span class="detail-value">{{ $payment->paid_at ? \Carbon\Carbon::parse($payment->paid_at)->format('d/m/Y H:i') : now()->format('d/m/Y H:i') }}</span>
                </div>

                @if($payment->invoice)
                <div class="detail-row">
                    <span class="detail-label">N° Facture :</span>
                    <span class="detail-value">{{ $payment->invoice->invoice_number }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Mois concerné :</span>
                    <span class="detail-value">
                        @if($payment->invoice->month && $payment->invoice->year)
                            {{ \Carbon\Carbon::create()->month($payment->invoice->month)->format('F') }} {{ $payment->invoice->year }}
                        @else
                            {{ \Carbon\Carbon::parse($payment->paid_at)->format('F Y') }}
                        @endif
                    </span>
                </div>
                @endif

                <div class="detail-row">
                    <span class="detail-label">Mode de paiement :</span>
                    <span class="detail-value">Carte bancaire (FEDAPAY)</span>
                </div>
            </div>

            @if($recipientType === 'co_owner' && $delegation)
            <p><strong>Note :</strong> Vous recevez cette notification en tant que copropriétaire délégué sur ce bien.</p>
            @endif

            <p>Vous pouvez consulter les détails de ce paiement dans votre espace GestiLoc.</p>

            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url', 'http://localhost:8080') }}/{{ $recipientType === 'landlord' ? 'proprietaire' : 'coproprietaire' }}/paiements" class="button">
                    Voir les paiements
                </a>
            </div>
        </div>

        <div class="footer">
            <p>Cet email a été envoyé automatiquement par {{ config('app.name') }}.</p>
            <p>Merci de ne pas répondre à cet email.</p>
        </div>
    </div>
</body>
</html>
