<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Export des paiements</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0b7dda;
        }
        .header h1 {
            color: #0b7dda;
            font-size: 24px;
            margin: 0 0 5px 0;
        }
        .header p {
            color: #666;
            margin: 5px 0;
            font-size: 12px;
        }
        .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        th {
            background: #0b7dda;
            color: white;
            padding: 10px;
            text-align: left;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        .amount {
            text-align: right;
        }
        .status-approved {
            color: #4CAF50;
            font-weight: bold;
        }
        .status-pending {
            color: #FF9800;
            font-weight: bold;
        }
        .status-cancelled {
            color: #f44336;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        .total-row {
            background: #f0f0f0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>GestiLoc</h1>
        <h2>Export des paiements</h2>
        <p>Généré le {{ $date }}</p>
        <p>Copropriétaire : {{ $user->name ?? 'Non renseigné' }}</p>
    </div>

    <div class="summary">
        <h3>Résumé</h3>
        <table style="width: 100%; margin-bottom: 0;">
            <tr>
                <td><strong>Total des paiements :</strong></td>
                <td class="amount">{{ count($payments) }}</td>
                <td><strong>Montant total :</strong></td>
                <td class="amount">{{ number_format($payments->sum('amount_total'), 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr>
                <td><strong>Paiements approuvés :</strong></td>
                <td class="amount">{{ $payments->where('status', 'approved')->count() }}</td>
                <td><strong>Montant net total :</strong></td>
                <td class="amount">{{ number_format($payments->sum('amount_net'), 0, ',', ' ') }} FCFA</td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Locataire</th>
                <th>Bien</th>
                <th class="amount">Montant</th>
                <th class="amount">Frais</th>
                <th class="amount">Net</th>
                <th>Statut</th>
                <th>Mode</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $payment)
            <tr>
                <td>#{{ str_pad($payment->id, 6, '0', STR_PAD_LEFT) }}</td>
                <td>{{ $payment->paid_at ? $payment->paid_at->format('d/m/Y') : $payment->created_at->format('d/m/Y') }}</td>
                <td>{{ $payment->lease->tenant->user->full_name ?? 'N/A' }}</td>
                <td>{{ $payment->lease->property->name ?? 'N/A' }}</td>
                <td class="amount">{{ number_format($payment->amount_total, 0, ',', ' ') }}</td>
                <td class="amount">{{ number_format($payment->fee_amount, 0, ',', ' ') }}</td>
                <td class="amount">{{ number_format($payment->amount_net, 0, ',', ' ') }}</td>
                <td>
                    @php
                        $statusClass = match($payment->status) {
                            'approved' => 'status-approved',
                            'pending', 'initiated' => 'status-pending',
                            default => 'status-cancelled'
                        };
                        $statusLabel = match($payment->status) {
                            'approved' => 'Approuvé',
                            'pending' => 'En attente',
                            'initiated' => 'Initié',
                            'cancelled' => 'Annulé',
                            'failed' => 'Échoué',
                            'declined' => 'Refusé',
                            default => $payment->status
                        };
                    @endphp
                    <span class="{{ $statusClass }}">{{ $statusLabel }}</span>
                </td>
                <td>
                    @php
                        $method = $payment->provider_payload ? json_decode($payment->provider_payload)->payment_method ?? 'manual' : 'manual';
                        $methodLabel = match($method) {
                            'virement' => 'Virement',
                            'cheque' => 'Chèque',
                            'especes' => 'Espèces',
                            'mobile_money' => 'Mobile Money',
                            'card' => 'Carte',
                            default => 'Virement'
                        };
                    @endphp
                    {{ $methodLabel }}
                </td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td class="amount"><strong>{{ number_format($payments->sum('amount_total'), 0, ',', ' ') }} FCFA</strong></td>
                <td class="amount"><strong>{{ number_format($payments->sum('fee_amount'), 0, ',', ' ') }} FCFA</strong></td>
                <td class="amount"><strong>{{ number_format($payments->sum('amount_net'), 0, ',', ' ') }} FCFA</strong></td>
                <td colspan="2"></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>GestiLoc - Solution de gestion locative</p>
        <p>Document généré automatiquement - {{ date('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
