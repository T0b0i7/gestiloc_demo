<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quittance de loyer</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: #333;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0b7dda;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #0b7dda;
            font-size: 28px;
            margin: 0 0 5px 0;
        }
        .header h2 {
            color: #666;
            font-size: 20px;
            margin: 0;
            font-weight: normal;
        }
        .header p {
            color: #999;
            font-size: 12px;
            margin-top: 10px;
        }
        .quittance-title {
            text-align: center;
            margin: 30px 0;
            font-size: 24px;
            font-weight: bold;
            color: #0b7dda;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            width: 35%;
            font-weight: bold;
            color: #555;
            padding: 8px 0;
        }
        .info-value {
            display: table-cell;
            width: 65%;
            color: #333;
            padding: 8px 0;
        }
        .amount-box {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 10px;
            margin: 30px 0;
            border-left: 5px solid #0b7dda;
        }
        .amount-title {
            font-size: 14px;
            color: #0b7dda;
            margin-bottom: 5px;
        }
        .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #0b7dda;
        }
        .amount-detail {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #0b7dda;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 14px;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px dashed #ccc;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        .signature {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
        }
        .signature-line {
            border-bottom: 1px solid #333;
            width: 100%;
            margin-bottom: 5px;
        }
        .badge {
            display: inline-block;
            padding: 5px 15px;
            background: #4CAF50;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(11, 125, 218, 0.1);
            font-weight: bold;
            text-transform: uppercase;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="watermark">GESTILOC</div>

    <div class="header">
        <h1>GestiLoc</h1>
        <h2>Quittance de loyer</h2>
        <p>N° {{ str_pad($payment->id, 6, '0', STR_PAD_LEFT) }} - Émise le {{ date('d/m/Y') }}</p>
    </div>

    <div class="quittance-title">
        QUITTANCE DE LOYER
    </div>

    <div class="info-box">
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Période concernée :</div>
                <div class="info-value">{{ $payment->paid_at ? $payment->paid_at->format('F Y') : now()->format('F Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date de paiement :</div>
                <div class="info-value">{{ $payment->paid_at ? $payment->paid_at->format('d/m/Y') : '-' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Mode de paiement :</div>
                <div class="info-value">
                    @php
                        $method = $payment->provider_payload ? json_decode($payment->provider_payload)->payment_method ?? 'manual' : 'manual';
                        $methodLabel = match($method) {
                            'virement' => 'Virement bancaire',
                            'cheque' => 'Chèque',
                            'especes' => 'Espèces',
                            'mobile_money' => 'Mobile Money',
                            'card' => 'Carte bancaire',
                            default => 'Virement bancaire'
                        };
                    @endphp
                    {{ $methodLabel }}
                </div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Bailleur</th>
                <th>Locataire</th>
                <th>Bien</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $user->name ?? 'GestiLoc' }}</strong><br>
                    <small>Copropriétaire</small>
                </td>
                <td>
                    <strong>{{ $payment->lease->tenant->user->full_name ?? 'Non renseigné' }}</strong><br>
                    <small>{{ $payment->lease->tenant->user->email ?? '' }}</small>
                </td>
                <td>
                    <strong>{{ $payment->lease->property->name ?? 'Non renseigné' }}</strong><br>
                    <small>{{ $payment->lease->property->address ?? '' }}</small>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="amount-box">
        <div class="amount-title">MONTANT TOTAL RÉGLÉ</div>
        <div class="amount-value">{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</div>
        <div class="amount-detail">
            Frais de gestion (5%) : {{ number_format($payment->fee_amount, 0, ',', ' ') }} FCFA<br>
            Net perçu : {{ number_format($payment->amount_net, 0, ',', ' ') }} FCFA
        </div>
    </div>

    <div style="margin: 30px 0;">
        <p>Je soussigné(e), <strong>{{ $user->name ?? 'Le copropriétaire' }}</strong>, déclare avoir reçu de la part de <strong>{{ $payment->lease->tenant->user->full_name ?? 'M. le locataire' }}</strong> la somme de <strong>{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</strong> correspondant au paiement du loyer pour la période du <strong>{{ $payment->paid_at ? $payment->paid_at->startOfMonth()->format('d/m/Y') : '-' }}</strong> au <strong>{{ $payment->paid_at ? $payment->paid_at->endOfMonth()->format('d/m/Y') : '-' }}</strong>.</p>
        <p>Cette quittance est délivrée pour valoir reçu et ne dispense pas du paiement des loyers et charges à échoir.</p>
    </div>

    <div class="badge">
        PAIEMENT CONFIRMÉ
    </div>

    <div class="signature">
        <div class="signature-box">
            <p><strong>Date :</strong> {{ $payment->paid_at ? $payment->paid_at->format('d/m/Y') : now()->format('d/m/Y') }}</p>
            <p><strong>Signature du bailleur :</strong></p>
            <div style="height: 60px;"></div>
            <div class="signature-line"></div>
            <p style="font-size: 11px; color: #666;">GestiLoc - Copropriétaire</p>
        </div>
        <div class="signature-box">
            <p><strong>Reçu le :</strong> {{ now()->format('d/m/Y') }}</p>
            <p><strong>Cachet :</strong></p>
            <div style="height: 60px;"></div>
            <div class="signature-line"></div>
            <p style="font-size: 11px; color: #666;">GestiLoc</p>
        </div>
    </div>

    <div class="footer">
        <p>Document généré automatiquement par GestiLoc - {{ date('d/m/Y H:i') }}</p>
        <p>Cette quittance fait office de justificatif de paiement. À conserver pendant 3 ans.</p>
        <p style="margin-top: 15px;">GestiLoc - Créer de meilleures relations entre propriétaires et locataires</p>
    </div>
</body>
</html>
