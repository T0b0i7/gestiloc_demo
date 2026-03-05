<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quittance de loyer - {{ $receipt->reference }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
        }

        /* En-tête avec logo et titre */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin: -40px -40px 30px -40px;
            border-radius: 0 0 15px 15px;
        }

        .header-content {
            display: table;
            width: 100%;
        }

        .header-left {
            display: table-cell;
            vertical-align: middle;
            width: 60%;
        }

        .header-right {
            display: table-cell;
            vertical-align: middle;
            width: 40%;
            text-align: right;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .company-tagline {
            font-size: 12px;
            opacity: 0.9;
        }

        .document-title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .reference-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
        }

        .reference-box strong {
            color: #667eea;
            font-size: 13px;
        }

        /* Informations en colonnes */
        .info-section {
            margin: 25px 0;
        }

        .section-title {
            background: #667eea;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 15px;
            border-radius: 5px;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .info-column {
            display: table-cell;
            width: 50%;
            padding: 15px;
            vertical-align: top;
        }

        .info-column.left {
            background: #f8f9fa;
            border-radius: 8px 0 0 8px;
        }

        .info-column.right {
            background: #e9ecef;
            border-radius: 0 8px 8px 0;
        }

        .info-row {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #dee2e6;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: bold;
            color: #667eea;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .info-value {
            color: #333;
            font-size: 12px;
        }

        /* Tableau du bien */
        .property-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .property-table thead {
            background: #667eea;
            color: white;
        }

        .property-table th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        .property-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }

        .property-table tr:last-child td {
            border-bottom: none;
        }

        .property-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        /* Section montant */
        .amount-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin: 30px 0;
            border-radius: 10px;
            text-align: center;
        }

        .amount-label {
            font-size: 14px;
            margin-bottom: 10px;
            opacity: 0.9;
        }

        .amount-value {
            font-size: 36px;
            font-weight: bold;
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .amount-words {
            font-size: 13px;
            font-style: italic;
            margin-top: 15px;
            padding: 15px;
            background: rgba(255,255,255,0.2);
            border-radius: 5px;
        }

        /* Détails de paiement */
        .payment-details {
            display: table;
            width: 100%;
            margin: 20px 0;
        }

        .payment-detail {
            display: table-cell;
            width: 33.33%;
            padding: 15px;
            text-align: center;
            background: #f8f9fa;
            border-right: 1px solid white;
        }

        .payment-detail:last-child {
            border-right: none;
        }

        .payment-detail-label {
            font-size: 10px;
            color: #667eea;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .payment-detail-value {
            font-size: 13px;
            color: #333;
            font-weight: bold;
        }

        /* Notes */
        .notes-section {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
        }

        .notes-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 8px;
        }

        .notes-content {
            color: #856404;
            font-size: 11px;
        }

        /* Signatures */
        .signature-section {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px dashed #dee2e6;
        }

        .signature-grid {
            display: table;
            width: 100%;
            margin-top: 30px;
        }

        .signature-box {
            display: table-cell;
            width: 50%;
            padding: 20px;
            text-align: center;
        }

        .signature-label {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 40px;
            font-size: 12px;
        }

        .signature-line {
            border-top: 2px solid #333;
            width: 70%;
            margin: 0 auto 10px auto;
        }

        .signature-name {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .signature-date {
            font-size: 10px;
            color: #666;
        }

        /* Pied de page */
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #667eea;
            text-align: center;
        }

        .footer-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
            font-size: 12px;
        }

        .footer-text {
            font-size: 10px;
            color: #666;
            line-height: 1.8;
        }

        .footer-logo {
            margin-top: 15px;
            color: #667eea;
            font-weight: bold;
            font-size: 14px;
        }

        /* Badge de statut */
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #28a745;
            color: white;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
        }

        /* Encadré important */
        .important-box {
            background: #e7f3ff;
            border: 2px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }

        .important-box-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- En-tête -->
        <div class="header">
            <div class="header-content">
                <div class="header-left">
                    <div class="company-name">{{ config('app.name', 'GESTILOC') }}</div>
                    <div class="company-tagline">Système de Gestion Locative Professionnelle</div>
                </div>
                <div class="header-right">
                    <div style="font-size: 11px; margin-bottom: 5px;">Date d'émission</div>
                    <div style="font-size: 16px; font-weight: bold;">{{ $date_emission }}</div>
                    <div style="margin-top: 10px;">
                        <span class="status-badge">PAYÉ</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Titre du document -->
        <div class="document-title">Quittance de Loyer</div>

        <!-- Référence -->
        <div class="reference-box">
            <strong>RÉFÉRENCE :</strong> {{ $receipt->reference }}
            <span style="float: right; color: #666;">
                <strong>Période :</strong> {{ $periode }}
            </span>
        </div>

        <!-- Informations Bailleur et Locataire -->
        <div class="info-section">
            <div class="section-title">
                👤 PARTIES CONTRACTANTES
            </div>
            <div class="info-grid">
                <div class="info-column left">
                    <div style="font-weight: bold; color: #667eea; margin-bottom: 15px; font-size: 13px;">
                        LE BAILLEUR
                    </div>
                    <div class="info-row">
                        <div class="info-label">Nom complet</div>
                        <div class="info-value">{{ $landlord->first_name ?? '' }} {{ $landlord->last_name ?? '' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value">{{ $landlord->email ?? 'Non renseigné' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Téléphone</div>
                        <div class="info-value">{{ $landlord->phone ?? 'Non renseigné' }}</div>
                    </div>
                </div>
                <div class="info-column right">
                    <div style="font-weight: bold; color: #667eea; margin-bottom: 15px; font-size: 13px;">
                        LE LOCATAIRE
                    </div>
                    <div class="info-row">
                        <div class="info-label">Nom complet</div>
                        <div class="info-value">{{ $tenant->first_name ?? '' }} {{ $tenant->last_name ?? '' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value">{{ $tenant->email ?? 'Non renseigné' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Téléphone</div>
                        <div class="info-value">{{ $tenant->phone ?? 'Non renseigné' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Adresse</div>
                        <div class="info-value">{{ $tenant->address ?? '' }}, {{ $tenant->zip_code ?? '' }} {{ $tenant->city ?? '' }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Informations du bien -->
        <div class="info-section">
            <div class="section-title">
                🏠 BIEN LOUÉ
            </div>
            <table class="property-table">
                <thead>
                    <tr>
                        <th>Type de bien</th>
                        <th>Référence</th>
                        <th>Surface</th>
                        <th>Loyer mensuel</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>{{ ucfirst($property->type ?? 'Appartement') }}</strong></td>
                        <td>{{ $property->reference_code ?? 'N/A' }}</td>
                        <td>{{ $property->surface ?? 'N/A' }} m²</td>
                        <td><strong>{{ number_format($lease->rent_amount ?? 0, 0, ',', ' ') }} FCFA</strong></td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top: 10px; padding: 12px; background: #f8f9fa; border-radius: 5px;">
                <div class="info-label">📍 Adresse complète du bien</div>
                <div class="info-value" style="font-size: 13px; margin-top: 5px;">
                    <strong>{{ $property->address ?? '' }}, {{ $property->zip_code ?? '' }} {{ $property->city ?? '' }}</strong>
                </div>
            </div>
        </div>

        <!-- Montant reçu -->
        <div class="amount-section">
            <div class="amount-label">MONTANT TOTAL REÇU</div>
            <div class="amount-value">{{ number_format($receipt->amount_paid, 0, ',', ' ') }} FCFA</div>
            <div class="amount-words">{{ $montant_lettres }}</div>
        </div>

        <!-- Détails de paiement -->
        <div class="payment-details">
            <div class="payment-detail">
                <div class="payment-detail-label">Date de paiement</div>
                <div class="payment-detail-value">{{ date('d/m/Y', strtotime($receipt->issued_date)) }}</div>
            </div>
            <div class="payment-detail">
                <div class="payment-detail-label">Mode de paiement</div>
                <div class="payment-detail-value">{{ $receipt->payment_method ?? 'Espèces' }}</div>
            </div>
            <div class="payment-detail">
                <div class="payment-detail-label">Période couverte</div>
                <div class="payment-detail-value">{{ $periode }}</div>
            </div>
        </div>

        <!-- Notes si présentes -->
        @if($receipt->notes)
        <div class="notes-section">
            <div class="notes-title">📝 NOTES ET OBSERVATIONS</div>
            <div class="notes-content">{{ $receipt->notes }}</div>
        </div>
        @endif

        <!-- Encadré important -->
        <div class="important-box">
            <div class="important-box-title">ℹ️ INFORMATIONS IMPORTANTES</div>
            <div style="font-size: 10px; color: #333;">
                • Cette quittance certifie le paiement intégral du loyer pour la période indiquée<br>
                • Elle constitue un document légal et doit être conservée comme preuve de paiement<br>
                • Aucun duplicata ne sera émis en cas de perte<br>
                • Le locataire peut réclamer cette quittance dans les 30 jours suivant le paiement
            </div>
        </div>

        <!-- Section signatures -->
        <div class="signature-section">
            <div style="text-align: center; margin-bottom: 30px; color: #667eea; font-weight: bold; font-size: 13px;">
                SIGNATURES DES PARTIES
            </div>
            <div class="signature-grid">
                <div class="signature-box">
                    <div class="signature-label">Le Bailleur</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">{{ $landlord->first_name ?? '' }} {{ $landlord->last_name ?? '' }}</div>
                    <div class="signature-date">Fait à {{ $property->city ?? 'Cotonou' }}, le {{ date('d/m/Y') }}</div>
                </div>
                <div class="signature-box">
                    <div class="signature-label">Le Locataire</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">{{ $tenant->first_name ?? '' }} {{ $tenant->last_name ?? '' }}</div>
                    <div class="signature-date">Fait à {{ $tenant->city ?? 'Cotonou' }}, le __/__/____</div>
                </div>
            </div>
        </div>

        <!-- Pied de page -->
        <div class="footer">
            <div class="footer-title">DOCUMENT OFFICIEL</div>
            <div class="footer-text">
                Ce document a été généré électroniquement par le système {{ config('app.name', 'GESTILOC') }}<br>
                Le {{ date('d/m/Y à H:i') }}<br>
                Cette quittance fait foi de paiement du loyer pour la période indiquée ci-dessus<br>
                En cas de litige, seul le tribunal compétent pourra statuer
            </div>
            <div class="footer-logo">
                ⚡ Powered by GESTILOC - Gestion Locative Intelligente
            </div>
        </div>
    </div>
</body>
</html>
