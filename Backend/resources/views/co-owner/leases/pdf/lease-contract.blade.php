<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contrat de Bail - {{ $bailNumber }}</title>
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 15px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }

        .contract-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .contract-number {
            font-size: 12px;
            font-weight: bold;
            color: #555;
            margin-bottom: 8px;
        }

        .contract-date {
            font-size: 10px;
            color: #666;
            margin-bottom: 15px;
        }

        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            background-color: #f5f5f5;
            padding: 6px 10px;
            margin-bottom: 12px;
            border-left: 4px solid #333;
        }

        .party-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }

        .party-column {
            width: 48%;
        }

        .party-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #333;
        }

        .info-row {
            margin-bottom: 6px;
            display: flex;
        }

        .info-label {
            font-weight: bold;
            min-width: 150px;
        }

        .info-value {
            flex: 1;
        }

        .article {
            margin-bottom: 12px;
        }

        .article-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 6px;
        }

        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }

        .signature-line {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding-top: 8px;
            border-top: 1px solid #333;
        }

        .signature-block {
            width: 45%;
            text-align: center;
        }

        .signature-space {
            height: 40px;
            border-bottom: 1px solid #333;
            margin-bottom: 8px;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 10px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
        }

        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }

        .checkbox-list {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin: 8px 0;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .checkbox {
            width: 10px;
            height: 10px;
            border: 1px solid #333;
            display: inline-block;
        }

        .checked {
            background-color: #333;
        }

        .equipment-list {
            margin-left: 15px;
            font-size: 10px;
        }

        .equipment-item {
            margin-bottom: 4px;
        }

        .page-break {
            page-break-before: always;
        }

        @media print {
            body {
                font-size: 10px;
            }

            .page-break {
                page-break-before: always;
            }

            .header {
                margin-top: 0;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="contract-title">CONTRAT DE BAIL D'HABITATION</div>
        <div class="contract-number">N° {{ $bailNumber }}</div>
        <div class="contract-date">
            Document généré le {{ $dateGeneration }}<br>
            Fait à Cotonou, le {{ $dateContrat }}<br>
            Conforme aux usages locatifs — exemplaires : 2
        </div>
    </div>

    <div class="section">
        <div class="section-title">ENTRE LES SOUSSIGNÉS - Identité des parties</div>

        <div class="party-info">
            <div class="party-column">
                <div class="party-title">LE BAILLEUR</div>
                <div class="info-row">
                    <div class="info-label">Nom & prénoms :</div>
                    <div class="info-value">{{ $bailleur->user->first_name ?? 'Non renseigné' }} {{ $bailleur->user->last_name ?? '' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Adresse :</div>
                    <div class="info-value">{{ $bailleur->address ?? 'Non renseignée' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Téléphone :</div>
                    <div class="info-value">{{ $bailleur->user->phone ?? 'Non renseigné' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email :</div>
                    <div class="info-value">{{ $bailleur->user->email ?? 'Non renseigné' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Type pièce d'identité :</div>
                    <div class="info-value">........................................</div>
                </div>
                <div class="info-row">
                    <div class="info-label">N° pièce d'identité :</div>
                    <div class="info-value">........................................</div>
                </div>
            </div>

            <div class="party-column">
                <div class="party-title">LE LOCATAIRE</div>
                <div class="info-row">
                    <div class="info-label">Nom & prénoms :</div>
                    <div class="info-value">{{ $locataire->first_name ?? 'Non renseigné' }} {{ $locataire->last_name ?? '' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Adresse :</div>
                    <div class="info-value">{{ $locataire->address ?? 'Non renseignée' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Téléphone :</div>
                    <div class="info-value">{{ $locataire->phone ?? 'Non renseigné' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email :</div>
                    <div class="info-value">{{ $locataire->user->email ?? 'Non renseigné' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Type pièce d'identité :</div>
                    <div class="info-value">........................................</div>
                </div>
                <div class="info-row">
                    <div class="info-label">N° pièce d'identité :</div>
                    <div class="info-value">........................................</div>
                </div>
            </div>
        </div>

        <div class="article">
            <div class="article-title">Les parties conviennent de ce qui suit.</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 1 : OBJET DU CONTRAT - Usage & destination</div>
        <div class="article">
            Le présent contrat a pour objet la mise en location d'un logement {{ $typeBail }} destiné exclusivement à l'habitation.
            Toute activité professionnelle, commerciale ou autre est interdite sauf accord écrit du bailleur.
        </div>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 2 : DESCRIPTION DU LOGEMENT - Bien loué</div>
        <div class="article">
            <div style="margin-bottom: 8px;">Le bailleur donne en location au locataire le logement situé à :</div>
            <table>
                <tr>
                    <th>Adresse</th>
                    <th>Ville</th>
                    <th>Type de logement</th>
                    <th>Superficie</th>
                </tr>
                <tr>
                    <td>{{ $property->address ?? 'Non spécifiée' }}</td>
                    <td>{{ $property->city ?? 'Non spécifiée' }}</td>
                    <td>{{ ucfirst($property->type ?? 'Non spécifié') }}</td>
                    <td>{{ $property->surface ?? 'Non spécifiée' }} m²</td>
                </tr>
            </table>

            <div style="margin: 12px 0;">
                <div style="font-weight: bold; margin-bottom: 8px;">Caractéristiques :</div>
                <div>Désignation : {{ $property->name ?? 'Non spécifié' }}</div>
                <div>Nombre de pièces : {{ $property->room_count ?? 'Non spécifié' }}</div>
                <div>Étage : {{ $property->floor ?? 'Non spécifié' }}</div>
                <div>Garage/Parking : {{ $property->has_parking ? 'OUI' : 'NON' }}</div>
            </div>

            @if($lease->type == 'meuble')
            <div style="margin: 12px 0;">
                <div style="font-weight: bold; margin-bottom: 8px;">Équipements fournis :</div>
                <div class="equipment-list">
                    @foreach(explode("\n", $equipements) as $equipment)
                        @if(trim($equipment))
                            <div class="equipment-item">• {{ trim($equipment) }}</div>
                        @endif
                    @endforeach
                </div>
            </div>
            @endif
        </div>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 3 : ÉTAT DES LIEUX - Entrée & sortie</div>
        <div class="article">
            Un état des lieux d'entrée, incluant l'inventaire des meubles, sera réalisé et signé avant la remise des clés. Un état
            des lieux de sortie sera établi lors de la fin du bail. Les deux documents font partie intégrante du présent contrat.
        </div>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 4 : DURÉE DU BAIL - Période & reconduction</div>
        <div class="article">
            <table>
                <tr>
                    <th>Durée</th>
                    <th>Date de prise d'effet</th>
                    <th>Date de fin</th>
                    <th>Reconduction</th>
                    <th>Préavis (si non-renouvellement)</th>
                </tr>
                <tr>
                    <td>{{ $dureeBail }}</td>
                    <td>{{ $lease->start_date->format('d/m/Y') }}</td>
                    <td>{{ $dateFin }}</td>
                    <td>Tacite (Oui)</td>
                    <td>{{ $lease->notice_period ?? 30 }} jours</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 5 : LOYER - Montants & modalités</div>
        <div class="article">
            <table>
                <tr>
                    <th>Loyer mensuel (hors charges)</th>
                    <th>Charges mensuelles</th>
                    <th>Total mensuel</th>
                    <th>Jour limite de paiement</th>
                    <th>Fréquence de paiement</th>
                </tr>
                <tr>
                    <td>{{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA</td>
                    <td>{{ number_format($lease->charges_amount, 0, ',', ' ') }} FCFA</td>
                    <td>{{ number_format($montantTotal, 0, ',', ' ') }} FCFA</td>
                    <td>Au plus tard le {{ $lease->billing_day ?? 5 }} de chaque période</td>
                    <td>{{ $frequencePaiement }}</td>
                </tr>
            </table>

            <div style="margin: 12px 0;">
                <div style="font-weight: bold; margin-bottom: 8px;">Ce loyer inclut ou non (cocher) :</div>
                <div class="checkbox-list">
                    @php
                        $chargesArray = explode(', ', $chargesIncluses);
                    @endphp

                    <div class="checkbox-item">
                        <div class="checkbox {{ in_array('Eau', $chargesArray) ? 'checked' : '' }}"></div>
                        <span>Eau</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox {{ in_array('Électricité', $chargesArray) ? 'checked' : '' }}"></div>
                        <span>Électricité</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox {{ in_array('Internet', $chargesArray) ? 'checked' : '' }}"></div>
                        <span>Internet</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox {{ in_array('Gardiennage', $chargesArray) ? 'checked' : '' }}"></div>
                        <span>Gardiennage</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox {{ in_array('Entretien des espaces communs', $chargesArray) ? 'checked' : '' }}"></div>
                        <span>Entretien des espaces communs</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 12px;">
                <div style="font-weight: bold; margin-bottom: 8px;">Mode de paiement :</div>
                <div class="checkbox-list">
                    @php
                        $modePaiement = strtolower($modePaiement);
                    @endphp

                    <div class="checkbox-item">
                        <div class="checkbox {{ strpos($modePaiement, 'espèces') !== false ? 'checked' : '' }}"></div>
                        <span>Espèces</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox {{ strpos($modePaiement, 'mobile') !== false ? 'checked' : '' }}"></div>
                        <span>Mobile money</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox {{ strpos($modePaiement, 'virement') !== false ? 'checked' : '' }}"></div>
                        <span>Virement bancaire</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 6 : CAUTION / DÉPÔT DE GARANTIE - Garantie</div>
        <div class="article">
            <table>
                <tr>
                    <th>Dépôt de garantie</th>
                    <th>Équivalent</th>
                    <th>Restitution</th>
                </tr>
                <tr>
                    <td>{{ number_format($lease->guarantee_amount, 0, ',', ' ') }} FCFA</td>
                    <td>{{ $lease->guarantee_amount > 0 ? round($lease->guarantee_amount / $lease->rent_amount, 1) : 0 }} mois de loyer</td>
                    <td>Au plus tard sous 30 jours, déduction faite des réparations si nécessaire</td>
                </tr>
            </table>
            <div style="margin-top: 8px;">
                Il couvre : impayés de loyer, dégradations du logement, détériorations ou disparition de meubles et équipements.
            </div>
        </div>
    </div>

    <!-- Continuez avec les autres articles... -->

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">ARTICLE 14 : LITIGES - Juridiction</div>
        <div class="article">
            Les parties s'efforceront de résoudre à l'amiable tout différend. À défaut d'accord, elles pourront saisir les
            juridictions compétentes du Bénin.
        </div>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 15 : SIGNATURES - Lu et approuvé</div>
        <div class="article">
            Fait à Cotonou, le {{ $dateContrat }}
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-line">
            <div class="signature-block">
                <div style="font-weight: bold; margin-bottom: 4px;">LE BAILLEUR</div>
                <div>{{ $bailleur->user->first_name ?? '' }} {{ $bailleur->user->last_name ?? '' }}</div>
                <div class="signature-space"></div>
                <div>Signature précédée de « Lu et approuvé » + cachet</div>
            </div>

            <div class="signature-block">
                <div style="font-weight: bold; margin-bottom: 4px;">LE LOCATAIRE</div>
                <div>{{ $locataire->first_name ?? '' }} {{ $locataire->last_name ?? '' }}</div>
                <div class="signature-space"></div>
                <div>Signature précédée de « Lu et approuvé »</div>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <div style="font-weight: bold; margin-bottom: 12px;">Garants (facultatif)</div>
            <div style="display: flex; justify-content: space-between;">
                <div style="width: 48%;">
                    <div style="margin-bottom: 8px;"><strong>Garant 1</strong></div>
                    <div>Nom : ......................................</div>
                    <div style="margin-top: 25px; border-bottom: 1px solid #333; height: 15px;"></div>
                    <div>Signature : ......................................</div>
                </div>
                <div style="width: 48%;">
                    <div style="margin-bottom: 8px;"><strong>Garant 2</strong></div>
                    <div>Nom : ......................................</div>
                    <div style="margin-top: 25px; border-bottom: 1px solid #333; height: 15px;"></div>
                    <div>Signature : ......................................</div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        Document généré automatiquement par Gestiloc<br>
        Ce contrat a été établi en deux exemplaires. Chaque partie en conserve un.<br>
        Pour toute question, contactez votre gestionnaire locative via la plateforme Gestiloc
    </div>
</body>
</html>
