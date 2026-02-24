<!-- resources/views/pdf/quittance.blade.php -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quittance de loyer</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #70AE48;
            padding-bottom: 15px;
        }
        .header h1 {
            color: #70AE48;
            font-size: 24px;
            margin: 0 0 5px 0;
        }
        .header p {
            color: #666;
            margin: 0;
            font-size: 14px;
        }
        .reference {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .section {
            margin-bottom: 25px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        .section-title {
            background-color: #70AE48;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 14px;
        }
        .section-content {
            padding: 15px;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-row {
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 120px;
        }
        .info-value {
            display: inline-block;
            color: #333;
        }
        .amount-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .amount-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        .amount-table td:last-child {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            font-size: 16px;
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .total-row td {
            border-top: 2px solid #70AE48;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .badge-paid {
            background-color: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>QUITTANCE DE LOYER</h1>
        <p>Reçu de paiement - {{ $date }}</p>
    </div>

    <div class="reference">
        Référence : {{ $reference }} | Paiement n°{{ $payment->id }}
    </div>

    <div class="grid-2">
        <!-- Bailleur -->
        <div class="section">
            <div class="section-title">BAILLEUR</div>
            <div class="section-content">
                @php
                    $landlord = \App\Models\User::find($payment->landlord_user_id);
                    $landlordDetails = $landlord?->owner;
                @endphp
                @if($landlordDetails)
                    <div class="info-row">
                        <span class="info-label">Nom :</span>
                        <span class="info-value">{{ $landlordDetails->first_name ?? '' }} {{ $landlordDetails->last_name ?? '' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email :</span>
                        <span class="info-value">{{ $landlordDetails->email ?? $landlord->email ?? '' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Téléphone :</span>
                        <span class="info-value">{{ $landlordDetails->phone ?? '' }}</span>
                    </div>
                @else
                    <div class="info-row">
                        <span class="info-value">Informations non disponibles</span>
                    </div>
                @endif
            </div>
        </div>

        <!-- Locataire -->
        <div class="section">
            <div class="section-title">LOCATAIRE</div>
            <div class="section-content">
                <div class="info-row">
                    <span class="info-label">Nom :</span>
                    <span class="info-value">{{ $tenant->first_name }} {{ $tenant->last_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email :</span>
                    <span class="info-value">{{ $tenant->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Téléphone :</span>
                    <span class="info-value">{{ $tenant->phone }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Bien loué -->
    <div class="section">
        <div class="section-title">BIEN LOUÉ</div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Bien :</span>
                <span class="info-value">{{ $property->name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresse :</span>
                <span class="info-value">{{ $property->address }}, {{ $property->city }} {{ $property->postal_code }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bail n° :</span>
                <span class="info-value">{{ $lease->lease_number }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Période :</span>
                <span class="info-value">
                    @if($invoice && $invoice->period_start && $invoice->period_end)
                        Du {{ \Carbon\Carbon::parse($invoice->period_start)->format('d/m/Y') }}
                        au {{ \Carbon\Carbon::parse($invoice->period_end)->format('d/m/Y') }}
                    @else
                        {{ $payment->paid_at ? \Carbon\Carbon::parse($payment->paid_at)->format('F Y') : '' }}
                    @endif
                </span>
            </div>
        </div>
    </div>

    <!-- Détails du paiement -->
    <div class="section">
        <div class="section-title">DÉTAILS DU PAIEMENT</div>
        <div class="section-content">
            <table class="amount-table">
                <tr>
                    <td>Loyer mensuel</td>
                    <td>{{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA</td>
                </tr>
                @if($lease->charges_amount > 0)
                <tr>
                    <td>Charges</td>
                    <td>{{ number_format($lease->charges_amount, 0, ',', ' ') }} FCFA</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td>TOTAL PAYÉ</td>
                    <td>{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</td>
                </tr>
            </table>

            <div style="margin-top: 15px; text-align: center;">
                <span class="badge-paid">PAYÉ LE {{ $payment->paid_at ? \Carbon\Carbon::parse($payment->paid_at)->format('d/m/Y à H:i') : '' }}</span>
            </div>

            <div style="margin-top: 15px;">
                <div class="info-row">
                    <span class="info-label">Mode de paiement :</span>
                    <span class="info-value">Carte bancaire (FEDAPAY)</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Transaction :</span>
                    <span class="info-value">{{ $payment->fedapay_transaction_id ?? 'N/A' }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Quittance de loyer établie le {{ $date }} - Fait à Cotonou</p>
        <p>Cette quittance tient lieu de reçu pour le paiement du loyer. À conserver pendant 3 ans.</p>
    </div>
</body>
</html>
