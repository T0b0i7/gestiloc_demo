<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Avis d'échéance - {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #dc3545;
            padding-bottom: 20px;
        }
        .urgent {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            color: #856404;
        }
        .company-info {
            float: left;
            width: 50%;
        }
        .document-info {
            float: right;
            width: 45%;
            text-align: right;
        }
        .clear {
            clear: both;
        }
        .parties {
            margin: 30px 0;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
        }
        .party {
            width: 45%;
            float: left;
            margin: 10px 2.5%;
        }
        .invoice-details {
            margin: 30px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #dc3545;
            color: white;
        }
        .total-row {
            font-weight: bold;
            background-color: #f8d7da;
            color: #721c24;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .reminder {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature-section {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AVIS D'ÉCHÉANCE</h1>
        <p>Document généré le {{ $generated_at->format('d/m/Y à H:i') }}</p>
    </div>

    @if($invoice->due_date < $generated_at)
    <div class="urgent">
        ⚠️ ÉCHÉANCE DÉPASSÉE - PRIORITÉ ABSOLUE
    </div>
    @endif

    <div class="company-info">
        <h3>{{ config('app.name', 'GestiLoc') }}</h3>
        <p>
            <strong>Locataire :</strong> {{ $tenant->first_name }} {{ $tenant->last_name }}<br>
            <strong>Email :</strong> {{ $tenant->user->email }}
        </p>
    </div>

    <div class="document-info">
        <p>
            <strong>N° Facture :</strong> {{ $invoice->invoice_number }}<br>
            <strong>Date d'édition :</strong> {{ $generated_at->format('d/m/Y') }}<br>
            <strong>Échéance :</strong> {{ $invoice->due_date->format('d/m/Y') }}<br>
            <strong>Période :</strong> 
            {{ $invoice->period_start->format('d/m/Y') }} - {{ $invoice->period_end->format('d/m/Y') }}
        </p>
    </div>

    <div class="clear"></div>

    <div class="parties">
        <h3>Propriétaire</h3>
        <p>
            <strong>{{ $landlord->first_name }} {{ $landlord->last_name }}</strong><br>
            @if($landlord->company_name)
                {{ $landlord->company_name }}<br>
            @endif
            {{ $landlord->user->email }}<br>
            @if($landlord->address_billing)
                {{ $landlord->address_billing }}
            @endif
        </p>
    </div>

    <div class="invoice-details">
        <h3>Détail de la facture</h3>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Période</th>
                    <th style="text-align: right;">Montant (FCFA)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Loyer - {{ $property->name ?? $property->address }}</td>
                    <td>{{ $invoice->period_start->format('d/m/Y') }} - {{ $invoice->period_end->format('d/m/Y') }}</td>
                    <td style="text-align: right;">{{ number_format($lease->rent_amount, 0, ',', ' ') }}</td>
                </tr>
                @if($lease->charges_amount > 0)
                <tr>
                    <td>Charges</td>
                    <td>{{ $invoice->period_start->format('d/m/Y') }} - {{ $invoice->period_end->format('d/m/Y') }}</td>
                    <td style="text-align: right;">{{ number_format($lease->charges_amount, 0, ',', ' ') }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td colspan="2"><strong>MONTANT DÛ</strong></td>
                    <td style="text-align: right;"><strong>{{ number_format($invoice->amount_total, 0, ',', ' ') }} FCFA</strong></td>
                </tr>
                @if($invoice->amount_paid > 0)
                <tr>
                    <td colspan="2">Déjà payé</td>
                    <td style="text-align: right;">- {{ number_format($invoice->amount_paid, 0, ',', ' ') }}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2"><strong>RESTE À PAYER</strong></td>
                    <td style="text-align: right;"><strong>{{ number_format($invoice->balance_due, 0, ',', ' ') }} FCFA</strong></td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <div class="reminder">
        <h4>📅 MODALITÉS DE PAIEMENT</h4>
        <p>
            <strong>Date d'échéance :</strong> {{ $invoice->due_date->format('d/m/Y') }}<br>
            <strong>Moyen de paiement acceptés :</strong> Virement bancaire, Mobile Money, Espèces<br>
            <strong>Référence à mentionner :</strong> {{ $invoice->invoice_number }}
        </p>
        
        @if($invoice->due_date < $generated_at)
        <p style="color: #721c24; font-weight: bold;">
            ⚠️ ATTENTION : Cette facture est en retard. Des pénalités peuvent s'appliquer selon les conditions du bail.
        </p>
        @endif
    </div>

    <div class="signature">
        <div class="signature-section">
            <strong>Le Propriétaire</strong>
            <div class="signature-line">
                {{ $landlord->first_name }} {{ $landlord->last_name }}
            </div>
        </div>
        <div class="signature-section">
            <strong>Le Locataire</strong>
            <div class="signature-line">
                {{ $tenant->first_name }} {{ $tenant->last_name }}
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Cet avis d'échéance doit être réglé à la date indiquée. En cas de retard, des pénalités peuvent être appliquées.</p>
        <p>{{ config('app.name', 'GestiLoc') }} - Système de gestion locative</p>
    </div>
</body>
</html>
