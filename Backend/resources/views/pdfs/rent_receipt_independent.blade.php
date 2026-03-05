{{-- resources/views/pdfs/rent_receipt_independent.blade.php --}}
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Quittance {{ $receipt->reference }}</title>
  <style>
    @page { margin: 10px; }
    * { box-sizing: border-box; }
    body {
      font-family: DejaVu Sans, Arial, sans-serif;
      font-size: 11px;
      color: #111827;
      margin: 0;
    }

    .wrap { padding: 6px; }

    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .brand { font-weight: 800; font-size: 12px; }
    .muted { color: #6b7280; font-size: 10px; line-height: 1.35; }

    .title {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: .3px;
      margin: 8px 0 4px;
    }

    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border: 1px solid #e5e7eb;
      border-radius: 999px;
      background: #f9fafb;
      white-space: nowrap;
    }

    .grid {
      display: flex;
      gap: 10px;
      margin: 10px 0 10px;
    }

    .card {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 8px;
    }

    .card h3 {
      margin: 0 0 6px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .9px;
      color: #6b7280;
    }

    .kv { display: flex; gap: 8px; margin: 2px 0; }
    .k { width: 72px; color: #6b7280; }
    .v { flex: 1; font-weight: 800; }

    .section {
      border: 1px dashed #e5e7eb;
      border-radius: 10px;
      padding: 8px;
      margin-top: 10px;
      background: #fcfcfd;
    }

    .sectionTitle {
      display:flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 6px;
    }
    .sectionTitle .left { font-weight: 900; font-size: 11px; }
    .sectionTitle .right { font-size: 10px; color: #6b7280; }

    table { width: 100%; border-collapse: collapse; background: #fff; }
    thead th {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: #6b7280;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      padding: 6px 0;
    }
    tbody td {
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    tbody tr:last-child td { border-bottom: none; }

    .right { text-align: right; }
    .strong { font-weight: 900; }

    .total {
      display:flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
      font-weight: 900;
    }

    .note {
      margin-top: 10px;
      font-size: 9.5px;
      color: #6b7280;
      text-align: center;
      line-height: 1.35;
    }
  </style>
</head>
<body>
@php
  $monthMap = [
    1=>'janvier',2=>'février',3=>'mars',4=>'avril',5=>'mai',6=>'juin',
    7=>'juillet',8=>'août',9=>'septembre',10=>'octobre',11=>'novembre',12=>'décembre'
  ];

  // ✅ On calcule une période FR stable (pas DecemberDecember)
  $year  = (int) ($receipt->year ?: 0);
  $month = (int) ($receipt->month ?: 0);

  if ((!$year || !$month) && !empty($receipt->paid_month) && preg_match('/^(\d{4})-(\d{2})$/', $receipt->paid_month, $m)) {
    $year  = (int) $m[1];
    $month = (int) $m[2];
  }

  $periodLabel = ($month >= 1 && $month <= 12 && $year) ? ($monthMap[$month].' '.$year) : '—';

  $money = function($n){
    if ($n === null) return '—';
    return number_format((float)$n, 0, ',', ' ');
  };

  // ✅ On récupère les bons détails (fallbacks)
  $landlordFirst = data_get($receipt,'landlord.first_name') ?? data_get($receipt,'lease.property.landlord.user.first_name') ?? data_get($receipt,'lease.property.landlord.first_name');
  $landlordLast  = data_get($receipt,'landlord.last_name')  ?? data_get($receipt,'lease.property.landlord.user.last_name')  ?? data_get($receipt,'lease.property.landlord.last_name');
  $landlordName  = trim(($landlordFirst ?? '').' '.($landlordLast ?? '')) ?: (data_get($receipt,'landlord.name') ?? '—');
  $landlordPhone = data_get($receipt,'landlord.phone') ?? data_get($receipt,'lease.property.landlord.user.phone') ?? data_get($receipt,'lease.property.landlord.phone');

  $tenantFirst = data_get($receipt,'tenant.first_name') ?? data_get($receipt,'lease.tenant.user.first_name') ?? data_get($receipt,'lease.tenant.first_name');
  $tenantLast  = data_get($receipt,'tenant.last_name')  ?? data_get($receipt,'lease.tenant.user.last_name')  ?? data_get($receipt,'lease.tenant.last_name');
  $tenantName  = trim(($tenantFirst ?? '').' '.($tenantLast ?? '')) ?: (data_get($receipt,'tenant.name') ?? '—');
  $tenantPhone = data_get($receipt,'tenant.phone') ?? data_get($receipt,'lease.tenant.user.phone') ?? data_get($receipt,'lease.tenant.phone');

  $propertyName = data_get($receipt,'property.name') ?? data_get($receipt,'lease.property.name');
  $propertyAddr = data_get($receipt,'property.address') ?? data_get($receipt,'lease.property.address');
  $propertyCity = data_get($receipt,'property.city') ?? data_get($receipt,'lease.property.city');

  $issuedAt = $receipt->issued_date ? $receipt->issued_date->format('d/m/Y') : now()->format('d/m/Y');
@endphp

<div class="wrap">

  <div class="top">
    <div>
      <div class="brand">{{ config('app.name','Laravel') }}</div>
      <div class="muted">Document généré le {{ now()->format('d/m/Y à H:i') }}</div>
      <div class="title">QUITTANCE DE LOYER</div>
      <div class="muted">Référence : <span class="strong" style="color:#111827">{{ $receipt->reference }}</span></div>
    </div>

    <div style="text-align:right">
      <div class="badge">Date d’édition : {{ $issuedAt }}</div><br>
      <div class="badge" style="margin-top:6px">Période : {{ $periodLabel }}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Bailleur</h3>
      <div class="kv"><div class="k">Nom</div><div class="v">{{ $landlordName }}</div></div>
      <div class="kv"><div class="k">Téléphone</div><div class="v">{{ $landlordPhone ?: '—' }}</div></div>
    </div>

    <div class="card">
      <h3>Locataire</h3>
      <div class="kv"><div class="k">Nom</div><div class="v">{{ $tenantName }}</div></div>
      <div class="kv"><div class="k">Téléphone</div><div class="v">{{ $tenantPhone ?: '—' }}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="sectionTitle">
      <div class="left">Bien</div>
      <div class="right">{{ $propertyCity ?: '' }}</div>
    </div>
    <div class="strong">{{ $propertyName ?: '—' }}</div>
    <div class="muted">{{ $propertyAddr ?: '—' }}</div>
  </div>

  <div class="section">
    <div class="sectionTitle">
      <div class="left">Détail du paiement</div>
      <div class="right">{{ $periodLabel }}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Période</th>
          <th class="right">Montant (FCFA)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="strong">Loyer</td>
          <td>{{ $periodLabel }}</td>
          <td class="right strong">{{ $money($receipt->amount_paid) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="total">
      <div>TOTAL PAYÉ</div>
      <div>{{ $money($receipt->amount_paid) }} FCFA</div>
    </div>
  </div>

  <div class="note">
    Cette quittance atteste que le montant indiqué a été réglé pour la période mentionnée.
    <br>{{ config('app.name','GestiLoc') }} • Système de gestion locative
  </div>
</div>

</body>
</html>
