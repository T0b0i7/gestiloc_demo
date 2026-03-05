<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Contrat de Bail - {{ $lease->lease_number }}</title>
  <style>
    /* =========================================================
       CONTRAT DE BAIL - VERSION VISUELLE PRO (PDF friendly)
       - Compatible DOMPDF / wkhtmltopdf
       - Pas de position fixed exotique
       - Tables propres, styles sobres, sections claires
    ========================================================== */

    :root{
      --ink:#111827;
      --muted:#6b7280;
      --line:#e5e7eb;
      --soft:#f8fafc;
      --brand:#1f4ed8;      /* bleu pro */
      --brand2:#0ea5e9;     /* accent */
      --danger:#b91c1c;
    }

    *{ box-sizing:border-box; }

    body{
      font-family: "DejaVu Sans", Arial, sans-serif;
      font-size: 11px;
      color: var(--ink);
      margin: 18px 18px 22px;
      line-height: 1.45;
      background: #fff;
    }

    /* ====== Helpers ====== */
    .muted{ color: var(--muted); }
    .small{ font-size: 10px; }
    .tiny{ font-size: 9px; }
    .bold{ font-weight: 700; }
    .center{ text-align:center; }
    .right{ text-align:right; }
    .nowrap{ white-space: nowrap; }

    /* ====== Header ====== */
    .top{
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 14px;
    }
    .topbar{
      padding: 14px 16px;
      background: linear-gradient(135deg, rgba(31,78,216,.10), rgba(14,165,233,.08));
      border-bottom: 1px solid var(--line);
    }
    .title{
      font-size: 16px;
      font-weight: 800;
      letter-spacing: .2px;
      margin: 0;
      text-transform: uppercase;
    }
    .subtitle{
      margin-top: 2px;
      font-size: 10px;
      color: var(--muted);
    }
    .topmeta{
      padding: 10px 16px 12px;
      display: table;
      width: 100%;
    }
    .topmeta .col{
      display: table-cell;
      width: 50%;
      vertical-align: top;
    }
    .badge{
      display:inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(31,78,216,.20);
      background: rgba(31,78,216,.06);
      color: var(--brand);
      font-size: 10px;
      font-weight: 700;
    }

    /* ====== Sections ====== */
    .section{
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 14px;
      margin: 12px 0;
      background: #fff;
    }
    .section-head{
      display: table;
      width: 100%;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dashed var(--line);
    }
    .section-head .h{
      display: table-cell;
      vertical-align: middle;
      font-weight: 800;
      color: var(--brand);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .section-head .chip{
      display: table-cell;
      vertical-align: middle;
      text-align: right;
    }
    .chip span{
      display:inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
      background: var(--soft);
      border: 1px solid var(--line);
    }

    /* ====== Two columns blocks ====== */
    .grid2{
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px 0;
    }
    .grid2 .card{
      display: table-cell;
      width: 50%;
      vertical-align: top;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 12px;
      background: var(--soft);
    }
    .card-title{
      font-weight: 800;
      color: var(--brand);
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .4px;
    }
    .kv p{
      margin: 2px 0;
    }
    .kv b{
      color: #0f172a;
    }

    /* ====== Tables ====== */
    table{
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 0;
    }
    th, td{
      border: 1px solid var(--line);
      padding: 7px 8px;
      vertical-align: top;
    }
    th{
      background: rgba(31,78,216,.08);
      color: #0f172a;
      font-weight: 800;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .4px;
      width: 35%;
    }
    td{
      background: #fff;
    }
    .t2 th{ width: 45%; }
    .row-soft td{ background: var(--soft); }
    .amount{
      font-weight: 900;
      color: var(--brand);
    }
    .total{
      background: rgba(31,78,216,.08);
      font-weight: 900;
    }

    /* ====== Article blocks ====== */
    .article{
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--line);
    }
    .article:first-child{
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
    .article-title{
      margin: 0 0 6px 0;
      font-weight: 900;
      color: #0f172a;
      font-size: 11px;
    }
    .article-title .n{
      color: var(--brand);
      font-weight: 900;
      margin-right: 6px;
    }
    .p{
      margin: 4px 0;
      text-align: justify;
    }
    .list{
      margin: 6px 0 0 16px;
      padding: 0;
    }
    .list li{
      margin: 3px 0;
    }

    /* ====== Checkboxes (PDF friendly) ====== */
    .checks{
      margin-top: 6px;
      border: 1px dashed var(--line);
      background: #fff;
      border-radius: 10px;
      padding: 8px 10px;
    }
    .check-row{
      display: table;
      width: 100%;
    }
    .check{
      display: table-cell;
      width: 25%;
      padding: 2px 6px 2px 0;
      vertical-align: top;
      font-size: 10px;
    }
    .box{
      display:inline-block;
      width: 10px;
      height: 10px;
      border: 1px solid #9ca3af;
      border-radius: 2px;
      margin-right: 6px;
      vertical-align: -1px;
    }

    /* ====== Signatures ====== */
    .sign{
      page-break-inside: avoid;
      margin-top: 14px;
    }
    .sign-grid{
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px 0;
    }
    .sign-box{
      display: table-cell;
      width: 50%;
      vertical-align: top;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
      background: #fff;
    }
    .sign-head{
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .4px;
      color: var(--brand);
      font-size: 11px;
      text-align: center;
      margin-bottom: 10px;
    }
    .sign-line{
      margin-top: 46px;
      border-top: 2px solid #111827;
      padding-top: 6px;
      text-align: center;
      font-size: 10px;
      color: var(--muted);
    }

    .guarantors{
      margin-top: 10px;
      border: 1px dashed var(--line);
      border-radius: 12px;
      padding: 10px 12px;
      background: var(--soft);
    }
    .guarantors .g-row{
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px 0;
      margin-top: 6px;
    }
    .guarantors .g{
      display: table-cell;
      width: 50%;
      vertical-align: top;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px;
      background: #fff;
    }

    /* ====== Footer ====== */
    .footer{
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid var(--line);
      text-align: center;
      color: var(--muted);
      font-size: 9px;
    }

    @media print{
      body{ margin: 12px; }
    }
  </style>
</head>

<body>

  <!-- ================= HEADER ================= -->
  <div class="top">
    <div class="topbar">
      <p class="title">CONTRAT DE BAIL D’HABITATION</p>

    </div>

    <div class="topmeta">
      <div class="col">
        <div class="badge">N° {{ $lease->lease_number }}</div>
        <div class="tiny muted" style="margin-top:6px;">
          Document généré le {{ $generated_at->format('d/m/Y') }}
        </div>
      </div>
      <div class="col right">
        <div class="tiny muted">Fait à <span class="bold">Cotonou</span>, le {{ $generated_at->format('d/m/Y') }}</div>
        <div class="tiny muted">Conforme aux usages locatifs — exemplaires : 2</div>
      </div>
    </div>
  </div>

  <!-- ================= ARTICLE 0: PARTIES ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">Entre les soussignés</div>
      <div class="chip"><span>Identité des parties</span></div>
    </div>

    <div class="grid2">
      <div class="card">
        <p class="card-title">Le bailleur</p>
        <div class="kv">
          <p><b>Nom & prénoms :</b> {{ $landlord->first_name }} {{ $landlord->last_name }}</p>
          @if($landlord->company_name)
            <p><b>Dénomination :</b> {{ $landlord->company_name }}</p>
          @endif
          <p><b>Adresse :</b> {{ $landlord->address_billing ?? 'Non renseignée' }}</p>
          <p><b>Téléphone :</b> {{ $landlord->user->phone ?? 'Non renseigné' }}</p>
          <p><b>Email :</b> {{ $landlord->user->email }}</p>

          <!-- Champs optionnels (si tu les ajoutes plus tard) -->
          <p><b>Type pièce d’identité :</b> {{ $landlord->id_type ?? '........................................' }}</p>
          <p><b>N° pièce d’identité :</b> {{ $landlord->id_number ?? '........................................' }}</p>
        </div>
      </div>

      <div class="card">
        <p class="card-title">Le locataire</p>
        <div class="kv">
          <p><b>Nom & prénoms :</b> {{ $tenant->first_name }} {{ $tenant->last_name }}</p>
          <p><b>Adresse :</b> {{ $tenant->address_billing ?? '........................................' }}</p>
          <p><b>Téléphone :</b> {{ $tenant->user->phone ?? 'Non renseigné' }}</p>
          <p><b>Email :</b> {{ $tenant->user->email }}</p>

          <!-- Champs optionnels (si tu les ajoutes plus tard) -->
          <p><b>Type pièce d’identité :</b> {{ $tenant->id_type ?? '........................................' }}</p>
          <p><b>N° pièce d’identité :</b> {{ $tenant->id_number ?? '........................................' }}</p>
        </div>
      </div>
    </div>

    <p class="p" style="margin-top:10px;">
      Les parties conviennent de ce qui suit.
    </p>
  </div>

  <!-- ================= ARTICLE 1 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 1 : OBJET DU CONTRAT</div>
      <div class="chip"><span>Usage & destination</span></div>
    </div>

    <p class="p">
      Le présent contrat a pour objet la mise en location d’un logement meublé destiné exclusivement à l’habitation.
      Toute activité professionnelle, commerciale ou autre est interdite sauf accord écrit du bailleur.
    </p>
  </div>

  <!-- ================= ARTICLE 2 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 2 : DESCRIPTION DU LOGEMENT</div>
      <div class="chip"><span>Bien loué</span></div>
    </div>

    <p class="p">
      Le bailleur donne en location au locataire le logement situé à :
      <span class="bold">{{ $property->address }}, {{ $property->city }}</span>
      @if($property->district)
        (Quartier : <span class="bold">{{ $property->district }}</span>)
      @endif
    </p>

    <table class="t2">
      <tr>
        <th>Type de logement</th>
        <td>{{ ucfirst($property->type) }}</td>
      </tr>
      <tr>
        <th>Désignation</th>
        <td>{{ $property->name ?? 'Non nommé' }}</td>
      </tr>
      <tr>
        <th>Superficie</th>
        <td>{{ $property->surface ?? 'Non renseignée' }} m²</td>
      </tr>
      <tr>
        <th>Nombre de pièces</th>
        <td>{{ $property->room_count ?? 'Non renseigné' }}</td>
      </tr>
      <tr>
        <th>Étage</th>
        <td>{{ $property->floor ?? '………………' }}</td>
      </tr>
      <tr>
        <th>Garage / Parking</th>
        <td>{{ isset($property->has_parking) ? ($property->has_parking ? 'OUI' : 'NON') : 'OUI / NON' }}</td>
      </tr>
    </table>

    <div class="article">
      <p class="article-title"><span class="n">Caractéristiques & équipements fournis</span></p>

      <!-- Si tu as une liste d’équipements (amenities) côté property, on l’affiche propre -->
      @if(!empty($property->amenities) && is_array($property->amenities))
        <ul class="list">
          @foreach($property->amenities as $it)
            <li>{{ $it }}</li>
          @endforeach
        </ul>
        <p class="tiny muted" style="margin-top:6px;">
          La liste détaillée annexée au présent contrat tient lieu d’inventaire obligatoire.
        </p>
      @else
        <!-- Sinon on garde la forme “template” de ton modèle -->
        <table class="t2" style="margin-top:8px;">
          <tr><th>Lit</th><td>..............................................................</td></tr>
          <tr><th>Matelas</th><td>......................................................</td></tr>
          <tr><th>Armoire / penderie</th><td>.....................................</td></tr>
          <tr><th>Table + chaises</th><td>............................................</td></tr>
          <tr><th>Réfrigérateur</th><td>................................................</td></tr>
          <tr><th>Cuisinière / plaque</th><td>.......................................</td></tr>
          <tr><th>Télévision</th><td>.....................................................</td></tr>
          <tr><th>Climatisation / ventilateur</th><td>...........................</td></tr>
          <tr><th>Ustensiles de cuisine</th><td>....................................</td></tr>
          <tr><th>Autres équipements</th><td>..........................................</td></tr>
        </table>
        <p class="tiny muted" style="margin-top:6px;">
          La liste détaillée annexée au présent contrat tient lieu d’inventaire obligatoire.
        </p>
      @endif
    </div>

    <div class="article">
      <p class="article-title"><span class="n">Description libre</span></p>
      <p class="p">{{ $property->description ?? 'Aucune description fournie.' }}</p>
    </div>
  </div>

  <!-- ================= ARTICLE 3 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 3 : ÉTAT DES LIEUX</div>
      <div class="chip"><span>Entrée & sortie</span></div>
    </div>

    <p class="p">
      Un état des lieux d’entrée, incluant l’inventaire des meubles, sera réalisé et signé avant la remise des clés.
      Un état des lieux de sortie sera établi lors de la fin du bail. Les deux documents font partie intégrante du présent contrat.
    </p>
  </div>

  <!-- ================= ARTICLE 4 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 4 : DURÉE DU BAIL</div>
      <div class="chip"><span>Période & reconduction</span></div>
    </div>

    <table class="t2">
      <tr>
        <th>Durée</th>
        <td>{{ $lease->duration ?? '……………………………' }}</td>
      </tr>
      <tr>
        <th>Date de prise d’effet</th>
        <td>{{ $lease->start_date->format('d/m/Y') }}</td>
      </tr>
      <tr>
        <th>Date de fin</th>
        <td>{{ $lease->end_date ? $lease->end_date->format('d/m/Y') : 'Durée indéterminée' }}</td>
      </tr>
      <tr>
        <th>Reconduction</th>
        <td>{{ $lease->tacit_renewal ? 'Tacite (Oui)' : 'Non' }}</td>
      </tr>
      <tr>
        <th>Préavis (si non-renouvellement)</th>
        <td>{{ $lease->notice_period_months ?? '……' }} mois</td>
      </tr>
    </table>
  </div>

  <!-- ================= ARTICLE 5 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 5 : LOYER</div>
      <div class="chip"><span>Montants & modalités</span></div>
    </div>

    <table>
      <tr>
        <th>Loyer mensuel (hors charges)</th>
        <td class="amount">{{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA</td>
      </tr>
      <tr>
        <th>Charges mensuelles</th>
        <td class="amount">{{ number_format($lease->charges_amount, 0, ',', ' ') }} FCFA</td>
      </tr>
      <tr>
        <th>Total mensuel</th>
        <td class="amount total">{{ number_format($lease->total_rent, 0, ',', ' ') }} FCFA</td>
      </tr>
      @if(!empty($lease->prepaid_rent_months) && $lease->prepaid_rent_months > 0)
      <tr>
        <th>Mois d’avance payés</th>
        <td class="amount">
          {{ $lease->prepaid_rent_months }} mois
          ({{ number_format($lease->rent_amount * $lease->prepaid_rent_months, 0, ',', ' ') }} FCFA)
        </td>
      </tr>
      @endif
      <tr>
        <th>Jour limite de paiement</th>
        <td>Au plus tard le <b>{{ $lease->billing_day }}</b> de chaque période</td>
      </tr>
      <tr>
        <th>Fréquence de paiement</th>
        <td>{{ ucfirst($lease->payment_frequency) }}</td>
      </tr>
    </table>

    <!-- Checkboxes template (si tu veux garder la forme) -->
    <div class="checks">
      <div class="tiny bold" style="margin-bottom:4px;">Ce loyer inclut ou non (cocher) :</div>
      <div class="check-row">
        <div class="check"><span class="box"></span>Eau</div>
        <div class="check"><span class="box"></span>Électricité</div>
        <div class="check"><span class="box"></span>Internet</div>
        <div class="check"><span class="box"></span>Gardiennage</div>
      </div>
      <div class="check-row">
        <div class="check" style="width:100%;"><span class="box"></span>Entretien des espaces communs</div>
      </div>
    </div>

    <div class="checks" style="margin-top:8px;">
      <div class="check-row">
        <div class="check" style="width:33%;"><span class="box"></span>Mensuel</div>
        <div class="check" style="width:33%;"><span class="box"></span>Trimestriel</div>
        <div class="check" style="width:34%;"></div>
      </div>
      <div class="tiny bold" style="margin:6px 0 4px;">Mode de paiement :</div>
      <div class="check-row">
        <div class="check"><span class="box"></span>Espèces</div>
        <div class="check"><span class="box"></span>Mobile money</div>
        <div class="check"><span class="box"></span>Virement bancaire</div>
        <div class="check"></div>
      </div>
    </div>
  </div>

  <!-- ================= ARTICLE 6 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 6 : CAUTION / DÉPÔT DE GARANTIE</div>
      <div class="chip"><span>Garantie</span></div>
    </div>

    <table class="t2">
      <tr>
        <th>Dépôt de garantie</th>
        <td class="amount">{{ number_format($lease->guarantee_amount, 0, ',', ' ') }} FCFA</td>
      </tr>
      <tr>
        <th>Équivalent</th>
        <td>{{ $lease->guarantee_months ?? '……' }} mois de loyer</td>
      </tr>
      <tr>
        <th>Restitution</th>
        <td>Au plus tard sous {{ $lease->guarantee_return_days ?? '……' }} jours, déduction faite des réparations si nécessaire.</td>
      </tr>
    </table>

    <p class="p" style="margin-top:8px;">
      Il couvre : impayés de loyer, dégradations du logement, détériorations ou disparition de meubles et équipements.
    </p>
  </div>

  <!-- ================= ARTICLE 7 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 7 : CHARGES</div>
      <div class="chip"><span>Répartition</span></div>
    </div>

    <div class="grid2">
      <div class="card">
        <p class="card-title">À la charge du locataire</p>
        <ul class="list">
          <li>Consommation d’eau (si non incluse)</li>
          <li>Consommation électrique (si non incluse)</li>
          <li>Gaz domestique</li>
          <li>Entretien courant</li>
          <li>Petites réparations</li>
        </ul>
      </div>
      <div class="card">
        <p class="card-title">À la charge du bailleur</p>
        <ul class="list">
          <li>Réparations importantes</li>
          <li>Impôts relatifs au bien</li>
          <li>Pannes non imputables au locataire</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ================= ARTICLE 8 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 8 : OBLIGATIONS DU LOCATAIRE</div>
      <div class="chip"><span>Engagements</span></div>
    </div>

    <ul class="list">
      <li>Payer régulièrement le loyer et charges.</li>
      <li>Maintenir les meubles et équipements en bon état.</li>
      <li>Utiliser le logement conformément à sa destination d’habitation.</li>
      <li>Ne pas déplacer, retirer ou remplacer les meubles sans autorisation.</li>
      <li>Ne pas sous-louer, même partiellement, sauf accord écrit.</li>
      <li>Respecter le règlement de la résidence (si applicable).</li>
      <li>Prévenir immédiatement en cas de panne, fuite ou incident.</li>
      <li>En cas de détérioration d’un meuble, le locataire devra prendre en charge la réparation ou le remplacement.</li>
    </ul>
  </div>

  <!-- ================= ARTICLE 9 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 9 : OBLIGATIONS DU BAILLEUR</div>
      <div class="chip"><span>Engagements</span></div>
    </div>

    <ul class="list">
      <li>Livrer un logement meublé en bon état et propre.</li>
      <li>Assurer le bon fonctionnement des équipements principaux.</li>
      <li>Garantir la jouissance paisible du locataire.</li>
      <li>Effectuer les réparations majeures.</li>
    </ul>
  </div>

  <!-- ================= ARTICLE 10 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 10 : ENTRETIEN ET RÉPARATIONS</div>
      <div class="chip"><span>Responsabilités</span></div>
    </div>

    <div class="grid2">
      <div class="card">
        <p class="card-title">À la charge du locataire</p>
        <ul class="list">
          <li>Petites réparations (ampoules, robinets, serrures, entretien normal).</li>
          <li>Entretien du mobilier fourni.</li>
          <li>Nettoyage courant.</li>
        </ul>
      </div>
      <div class="card">
        <p class="card-title">À la charge du bailleur</p>
        <ul class="list">
          <li>Réparations structurelles.</li>
          <li>Remplacement des équipements non fonctionnels (hors négligence du locataire).</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ================= ARTICLE 11 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 11 : RÉSILIATION DU BAIL</div>
      <div class="chip"><span>Fin de contrat</span></div>
    </div>

    <div class="article">
      <p class="article-title"><span class="n">Résiliation par le locataire</span></p>
      <p class="p">Le locataire peut résilier le présent contrat avec un préavis de {{ $lease->notice_period_months ?? '……' }} mois.</p>
    </div>

    <div class="article">
      <p class="article-title"><span class="n">Résiliation par le bailleur (motifs légitimes)</span></p>
      <ul class="list">
        <li>Impayés répétés</li>
        <li>Dégradation du mobilier</li>
        <li>Activités interdites</li>
        <li>Nuisance grave au voisinage</li>
      </ul>
      <p class="p">Le locataire reste redevable des loyers jusqu’à la fin du préavis.</p>
    </div>
  </div>

  <!-- ================= ARTICLE 12 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 12 : VISITES ET ACCÈS AU LOGEMENT</div>
      <div class="chip"><span>Accès encadré</span></div>
    </div>

    <p class="p">
      Le bailleur pourra accéder au logement pour inspections, réparations ou visites, sous réserve :
    </p>
    <ul class="list">
      <li>d’un délai de prévenance de 24 à 48 heures,</li>
      <li>du respect de la tranquillité du locataire.</li>
    </ul>
  </div>

  <!-- ================= ARTICLE 13 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 13 : INVENTAIRE DU MOBILIER</div>
      <div class="chip"><span>Annexe</span></div>
    </div>

    <p class="p">
      La liste complète du mobilier, avec son état, sa valeur estimée et sa localisation, est jointe en annexe.
      Elle a valeur contractuelle.
    </p>
  </div>

  <!-- ================= ARTICLE 14 ================= -->
  <div class="section">
    <div class="section-head">
      <div class="h">ARTICLE 14 : LITIGES</div>
      <div class="chip"><span>Juridiction</span></div>
    </div>

    <p class="p">
      Les parties s’efforceront de résoudre à l’amiable tout différend.
      À défaut d’accord, elles pourront saisir les juridictions compétentes du Bénin.
    </p>
  </div>

  <!-- ================= ARTICLE 15 ================= -->
  <div class="section sign">
    <div class="section-head">
      <div class="h">ARTICLE 15 : SIGNATURES</div>
      <div class="chip"><span>Lu et approuvé</span></div>
    </div>

    <p class="p">
      Fait à ......................................... le ............................................
    </p>

    <div class="sign-grid">
      <div class="sign-box">
        <div class="sign-head">Le Bailleur</div>
        <p class="center small" style="margin:0;">
          {{ $landlord->first_name }} {{ $landlord->last_name }}
          @if($landlord->company_name)
            <br>{{ $landlord->company_name }}
          @endif
        </p>
        <div class="sign-line">Signature précédée de « Lu et approuvé » + cachet</div>
      </div>

      <div class="sign-box">
        <div class="sign-head">Le Locataire</div>
        <p class="center small" style="margin:0;">
          {{ $tenant->first_name }} {{ $tenant->last_name }}
        </p>
        <div class="sign-line">Signature précédée de « Lu et approuvé »</div>
      </div>
    </div>

    <div class="guarantors">
      <div class="bold">Garants (facultatif)</div>

      <div class="g-row">
        <div class="g">
          <div class="bold">Garant 1</div>
          <div class="tiny muted">Nom : ......................................</div>
          <div class="tiny muted" style="margin-top:6px;">Signature : ......................................</div>
        </div>
        <div class="g">
          <div class="bold">Garant 2</div>
          <div class="tiny muted">Nom : ......................................</div>
          <div class="tiny muted" style="margin-top:6px;">Signature : ......................................</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= FOOTER ================= -->
  <div class="footer">
    <div><b>Document généré automatiquement par {{ config('app.name', 'GestiLoc') }}</b></div>
    <div>Ce contrat a été établi en deux exemplaires. Chaque partie en conserve un.</div>
    <div>Pour toute question, contactez votre gestionnaire locative via la plateforme {{ config('app.name', 'GestiLoc') }}.</div>
  </div>

</body>
</html>
