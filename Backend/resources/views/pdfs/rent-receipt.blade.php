<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color:#111; }
    .title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
    .box { border:1px solid #ddd; padding:12px; border-radius:8px; margin-bottom: 12px; }
    .muted { color:#666; }
    table { width:100%; border-collapse: collapse; }
    td { padding:6px 0; vertical-align: top; }
    .right { text-align:right; }
  </style>
</head>
<body>
  <div class="title">Quittance de loyer</div>

  <div class="box">
    <div><strong>Numéro :</strong> {{ $receipt->receipt_number }}</div>
    <div><strong>Date :</strong> {{ $receipt->issued_date->format('d/m/Y') }}</div>
    <div><strong>Mois payé :</strong> {{ $receipt->paid_month ?? '-' }}</div>
  </div>

  <div class="box">
    <table>
      <tr>
        <td>
          <div><strong>Propriétaire</strong></div>
          <div class="muted">{{ $landlordName }}</div>
          <div class="muted">{{ $landlordEmail }}</div>
        </td>
        <td class="right">
          <div><strong>Locataire</strong></div>
          <div class="muted">{{ $tenantName }}</div>
          <div class="muted">{{ $tenantEmail }}</div>
        </td>
      </tr>
    </table>
  </div>

  <div class="box">
    <div><strong>Logement</strong></div>
    <div class="muted">{{ $propertyAddress }}</div>
  </div>

  <div class="box">
    <table>
      <tr>
        <td><strong>Montant payé</strong></td>
        <td class="right"><strong>{{ number_format((float)$receipt->amount_paid, 0, ',', ' ') }} XOF</strong></td>
      </tr>
      <tr>
        <td class="muted">Facture</td>
        <td class="right" class="muted">{{ $invoiceNumber }}</td>
      </tr>
    </table>
  </div>

  <p class="muted">
    Cette quittance atteste que le loyer dû a été payé pour la période indiquée.
  </p>
</body>
</html>
