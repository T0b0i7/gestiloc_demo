<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contrat de Bail - {{ $lease->lease_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            margin: 15px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }
        .contract-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .contract-number {
            color: #666;
            font-size: 12px;
        }
        .parties-section {
            margin: 25px 0;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
        }
        .party {
            margin-bottom: 20px;
        }
        .party-title {
            font-weight: bold;
            color: #007bff;
            margin-bottom: 8px;
            font-size: 13px;
        }
        .property-section {
            margin: 25px 0;
            border: 1px solid #dee2e6;
            padding: 20px;
            border-radius: 5px;
        }
        .section-title {
            font-weight: bold;
            color: #007bff;
            margin-bottom: 15px;
            font-size: 14px;
            border-bottom: 1px solid #007bff;
            padding-bottom: 5px;
        }
        .terms-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10px;
        }
        .terms-table th,
        .terms-table td {
            padding: 6px 8px;
            border: 1px solid #ddd;
            text-align: left;
        }
        .terms-table th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
        }
        .terms-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .conditions-section {
            margin: 20px 0;
        }
        .condition-item {
            margin-bottom: 12px;
            text-align: justify;
        }
        .condition-number {
            font-weight: bold;
            color: #007bff;
        }
        .signatures {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .signature-container {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }
        .signature-box {
            width: 45%;
            border: 1px solid #dee2e6;
            padding: 20px;
            border-radius: 5px;
        }
        .signature-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
            color: #007bff;
        }
        .signature-line {
            border-top: 2px solid #333;
            margin-top: 40px;
            padding-top: 5px;
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #dee2e6;
            padding-top: 15px;
        }
        .date-place {
            text-align: center;
            margin-bottom: 30px;
            font-style: italic;
            color: #666;
        }
        .amount-highlight {
            font-weight: bold;
            color: #007bff;
            font-size: 12px;
        }
        @media print {
            body { margin: 10px; }
            .header { margin-bottom: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="contract-title">CONTRAT DE BAIL</div>
        <div class="contract-number">N° {{ $lease->lease_number }} - Généré le {{ $generated_at->format('d/m/Y') }}</div>
    </div>

    <div class="date-place">
        Fait à Cotonou, le {{ $generated_at->format('d/m/Y') }}
    </div>

    <div class="parties-section">
        <div class="section-title">I. PARTIES AU CONTRAT</div>
        
        <div class="party">
            <div class="party-title">LE BAILLEUR (Propriétaire) :</div>
            <p>
                <strong>{{ $landlord->first_name }} {{ $landlord->last_name }}</strong><br>
                @if($landlord->company_name)
                    <strong>Dénomination :</strong> {{ $landlord->company_name }}<br>
                @endif
                <strong>Adresse :</strong> {{ $landlord->address_billing ?? 'Non renseignée' }}<br>
                <strong>Email :</strong> {{ $landlord->user->email }}<br>
                <strong>Téléphone :</strong> {{ $landlord->user->phone ?? 'Non renseigné' }}
            </p>
        </div>

        <div class="party">
            <div class="party-title">LE LOCATAIRE :</div>
            <p>
                <strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong><br>
                <strong>Email :</strong> {{ $tenant->user->email }}<br>
                <strong>Téléphone :</strong> {{ $tenant->user->phone ?? 'Non renseigné' }}
            </p>
        </div>
    </div>

    <div class="property-section">
        <div class="section-title">II. OBJET DU BAIL - DESCRIPTION DU BIEN</div>
        
        <table class="terms-table">
            <tr>
                <th>Type de bien</th>
                <td>{{ ucfirst($property->type) }}</td>
            </tr>
            <tr>
                <th>Désignation</th>
                <td>{{ $property->name ?? 'Non nommé' }}</td>
            </tr>
            <tr>
                <th>Adresse</th>
                <td>{{ $property->address }}, {{ $property->city }}</td>
            </tr>
            <tr>
                <th>Quartier</th>
                <td>{{ $property->district ?? 'Non renseigné' }}</td>
            </tr>
            <tr>
                <th>Surface</th>
                <td>{{ $property->surface ?? 'Non renseignée' }} m²</td>
            </tr>
            <tr>
                <th>Nombre de pièces</th>
                <td>{{ $property->room_count ?? 'Non renseigné' }}</td>
            </tr>
        </table>

        <p><strong>Description :</strong> {{ $property->description ?? 'Aucune description fournie' }}</p>
    </div>

    <div class="conditions-section">
        <div class="section-title">III. CONDITIONS FINANCIÈRES</div>
        
        <table class="terms-table">
            <tr>
                <th>Condition</th>
                <th>Montant</th>
            </tr>
            <tr>
                <td>Loyer mensuel hors charges</td>
                <td class="amount-highlight">{{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr>
                <td>Charges mensuelles</td>
                <td class="amount-highlight">{{ number_format($lease->charges_amount, 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr>
                <td><strong>TOTAL MENSUEL</strong></td>
                <td class="amount-highlight"><strong>{{ number_format($lease->total_rent, 0, ',', ' ') }} FCFA</strong></td>
            </tr>
            <tr>
                <td>Caution (garantie)</td>
                <td class="amount-highlight">{{ number_format($lease->guarantee_amount, 0, ',', ' ') }} FCFA</td>
            </tr>
            @if($lease->prepaid_rent_months > 0)
            <tr>
                <td>Mois d'avance payés</td>
                <td class="amount-highlight">{{ $lease->prepaid_rent_months }} mois ({{ number_format($lease->rent_amount * $lease->prepaid_rent_months, 0, ',', ' ') }} FCFA)</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="conditions-section">
        <div class="section-title">IV. DURÉE ET CONDITIONS GÉNÉRALES</div>
        
        <table class="terms-table">
            <tr>
                <th>Élément</th>
                <th>Détail</th>
            </tr>
            <tr>
                <td>Date de début</td>
                <td>{{ $lease->start_date->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Date de fin</td>
                <td>{{ $lease->end_date ? $lease->end_date->format('d/m/Y') : 'Durée indéterminée' }}</td>
            </tr>
            <tr>
                <td>Type de bail</td>
                <td>{{ ucfirst($lease->type) }}</td>
            </tr>
            <tr>
                <td>Renouvellement tacite</td>
                <td>{{ $lease->tacit_renewal ? 'Oui' : 'Non' }}</td>
            </tr>
            <tr>
                <td>Jour de paiement</td>
                <td>Le {{ $lease->billing_day }} de chaque mois</td>
            </tr>
            <tr>
                <td>Fréquence de paiement</td>
                <td>{{ ucfirst($lease->payment_frequency) }}</td>
            </tr>
        </table>
    </div>

    <div class="conditions-section">
        <div class="section-title">V. CONDITIONS PARTICULIÈRES</div>
        
        @if($lease->terms && is_array($lease->terms))
            @foreach($lease->terms as $key => $value)
            <div class="condition-item">
                <span class="condition-number">{{ $loop->iteration }}.</span>
                <strong>{{ ucfirst(str_replace('_', ' ', $key)) }} :</strong> {{ is_array($value) ? implode(', ', $value) : $value }}
            </div>
            @endforeach
        @else
            <p>Aucune condition particulière spécifiée.</p>
        @endif
    </div>

    <div class="conditions-section">
        <div class="section-title">VI. OBLIGATIONS DES PARTIES</div>
        
        <div class="condition-item">
            <span class="condition-number">1.</span>
            <strong>Obligations du Bailleur :</strong> Mettre à disposition le bien en bon état d'habitation, effectuer les réparations normalement incombant au propriétaire.
        </div>
        
        <div class="condition-item">
            <span class="condition-number">2.</span>
            <strong>Obligations du Locataire :</strong> Payer le loyer aux échéances convenues, user paisiblement des lieux, maintenir le bien en bon état.
        </div>
        
        <div class="condition-item">
            <span class="condition-number">3.</span>
            <strong>Résiliation :</strong> Le bail peut être résilié conformément à la législation en vigueur et aux conditions prévues au présent contrat.
        </div>
    </div>

    <div class="signatures">
        <div class="signature-container">
            <div class="signature-box">
                <div class="signature-title">LE BAILLEUR</div>
                <p style="text-align: center; font-size: 10px; margin-bottom: 20px;">
                    {{ $landlord->first_name }} {{ $landlord->last_name }}<br>
                    @if($landlord->company_name)
                        {{ $landlord->company_name }}<br>
                    @endif
                </p>
                <div class="signature-line">
                    Signature et cachet
                </div>
            </div>
            
            <div class="signature-box">
                <div class="signature-title">LE LOCATAIRE</div>
                <p style="text-align: center; font-size: 10px; margin-bottom: 20px;">
                    {{ $tenant->first_name }} {{ $tenant->last_name }}
                </p>
                <div class="signature-line">
                    Signature
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Document généré automatiquement par {{ config('app.name', 'GestiLoc') }}</strong></p>
        <p>Ce contrat a été établi en deux exemplaires. Chaque partie en conserve un.</p>
        <p>Pour toute question, contactez votre gestionnaire locative via la plateforme {{ config('app.name', 'GestiLoc') }}</p>
    </div>
</body>
</html>
