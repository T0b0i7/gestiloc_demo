<!DOCTYPE html>
<html lang="fr">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Contrat de Location</title>
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 18px;
            text-decoration: underline;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-weight: bold;
            margin: 15px 0 10px 0;
            text-decoration: underline;
        }
        .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .party {
            width: 48%;
        }
        .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature-block {
            width: 45%;
            text-align: center;
        }
        .page-break {
            page-break-before: always;
        }
        .text-center {
            text-align: center;
        }
        .text-underline {
            text-decoration: underline;
        }
        .mt-4 {
            margin-top: 1.5rem;
        }
        .mb-4 {
            margin-bottom: 1.5rem;
        }
        .equipment-list {
            margin-left: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONTRAT DE BAIL D'HABITATION</h1>
        <div>(Logement meublé – Usage exclusif d'habitation)</div>
    </div>

    <div class="section">
        <p>Entre les soussignés :</p>

        <div class="parties">
            <div class="party">
                <div class="section-title">Le Bailleur</div>
                <p>Nom et prénoms : <span class="text-underline">{{ $landlord['name'] ?? '' }}</span></p>
                <p>Adresse : <span class="text-underline">{{ $landlord['address'] ?? '' }}</span></p>
                <p>Téléphone : <span class="text-underline">{{ $landlord['phone'] ?? '' }}</span></p>
                <p>Email : <span class="text-underline">{{ $landlord['email'] ?? '' }}</span></p>
                <p>Type pièce d'identité : <span class="text-underline">{{ $landlord['id_type'] ?? '' }}</span></p>
                <p>N° pièce d'identité : <span class="text-underline">{{ $landlord['id_number'] ?? '' }}</span></p>
            </div>

            <div class="party">
                <div class="section-title">Le Locataire</div>
                <p>Nom et prénoms : <span class="text-underline">{{ $tenant['name'] ?? '' }}</span></p>
                <p>Adresse : <span class="text-underline">{{ $tenant['address'] ?? '' }}</span></p>
                <p>Téléphone : <span class="text-underline">{{ $tenant['phone'] ?? '' }}</span></p>
                <p>Email : <span class="text-underline">{{ $tenant['email'] ?? '' }}</span></p>
                <p>Type pièce d'identité : <span class="text-underline">{{ $tenant['id_type'] ?? '' }}</span></p>
                <p>N° pièce d'identité : <span class="text-underline">{{ $tenant['id_number'] ?? '' }}</span></p>
            </div>
        </div>
    </div>

    <div class="section">
        <p>Les parties conviennent de ce qui suit :</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 1 : OBJET DU CONTRAT</div>
        <p>Le présent contrat a pour objet la mise en location d'un logement meublé destiné exclusivement à l'habitation. Toute activité professionnelle, commerciale ou autre est interdite sauf accord écrit du bailleur.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 2 : DESCRIPTION DU LOGEMENT</div>
        <p>Le bailleur donne en location au locataire le logement situé à :</p>
        <p class="text-underline">{{ $property['address'] ?? '' }}</p>

        <p>Caractéristiques du logement :</p>
        <p>Étage : <span class="text-underline">{{ $property['floor'] ?? '' }}</span></p>
        <p>Type de logement : <span class="text-underline">{{ $property['type'] ?? '' }}</span></p>
        <p>Superficie : <span class="text-underline">{{ $property['area'] ?? '' }} m²</span></p>
        <p>Nombre de pièces : <span class="text-underline">{{ $property['rooms'] ?? '' }}</span></p>
        <p>Parking : <span class="text-underline">{{ isset($property['has_parking']) ? 'OUI' : 'NON' }}</span></p>

        <p>Équipements fournis :</p>
        <ul class="equipment-list">
            @if(!empty($property['equipment']))
                @foreach($property['equipment'] as $item)
                    <li>{{ $item }}</li>
                @endforeach
            @else
                <li>Aucun équipement spécifié</li>
            @endif
        </ul>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 3 : ÉTAT DES LIEUX</div>
        <p>Un état des lieux d'entrée, incluant l'inventaire des meubles, sera réalisé et signé avant la remise des clés. Un état des lieux de sortie sera établi lors de la fin du bail. Les deux documents font partie intégrante du présent contrat.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 4 : DURÉE DU BAIL</div>
        <p>Le bail est conclu pour une durée de : <span class="text-underline">{{ $contract['duration'] ?? '12 mois' }}</span></p>
        <p>Date de prise d'effet : <span class="text-underline">{{ $contract['start_date'] ?? '' }}</span></p>
        <p>Date de fin : <span class="text-underline">{{ $contract['end_date'] ?? '' }}</span></p>
        <p>Le bail peut être reconduit par accord mutuel. En cas de non-renouvellement, un préavis de {{ $contract['notice_period'] ?? 1 }} mois devra être respecté.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 5 : LOYER</div>
        <p>Le loyer mensuel est fixé à :</p>
        <p>Montant en chiffres : <span class="text-underline">{{ number_format($contract['rent_amount'] ?? 0, 0, ',', ' ') }} FCFA</span></p>

        <p>Ce loyer inclut :</p>
        <ul class="equipment-list">
            @if(!empty($contract['included_charges']))
                @foreach($contract['included_charges'] as $charge)
                    <li>{{ ucfirst($charge) }}</li>
                @endforeach
            @else
                <li>Aucune charge incluse</li>
            @endif
        </ul>

        <p>Modalité de paiement : <span class="text-underline">{{ $contract['payment_frequency'] == 'monthly' ? 'Mensuel' : 'Trimestriel' }}</span></p>
        <p>Mode de paiement : <span class="text-underline">
            @if($contract['payment_method'] == 'cash')
                Espèces
            @elseif($contract['payment_method'] == 'mobile_money')
                Mobile Money
            @else
                Virement bancaire
            @endif
        </span></p>
        <p>Le paiement doit intervenir au plus tard le <span class="text-underline">{{ date('d') }}</span> de chaque mois.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 6 : CAUTION / DÉPÔT DE GARANTIE</div>
        <p>Compte tenu de la présence de mobilier, le dépôt de garantie est fixé à :</p>
        <p>1 mois de loyer, soit <span class="text-underline">{{ number_format($contract['deposit_amount'] ?? 0, 0, ',', ' ') }} FCFA</span>.</p>
        <p>Il couvre :</p>
        <ul class="equipment-list">
            <li>Les impayés de loyer,</li>
            <li>Les dégradations du logement,</li>
            <li>Les détériorations ou disparition de meubles et équipements.</li>
        </ul>
        <p>Le dépôt sera restitué dans un délai maximal de 30 jours, déduction faite des réparations si nécessaire.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 7 : CHARGES</div>
        <p><strong>À la charge du locataire :</strong></p>
        <ul class="equipment-list">
            <li>Consommation d'eau (si non incluse)</li>
            <li>Consommation électrique (si non incluse)</li>
            <li>Gaz domestique</li>
            <li>Entretien courant</li>
            <li>Petites réparations</li>
        </ul>

        <p class="mt-4"><strong>À la charge du bailleur :</strong></p>
        <ul class="equipment-list">
            <li>Réparations importantes</li>
            <li>Impôts relatifs au bien</li>
            <li>Pannes non imputables au locataire</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 8 : OBLIGATIONS DU LOCATAIRE</div>
        <p>Le locataire s'engage à :</p>
        <ul class="equipment-list">
            <li>Payer régulièrement le loyer et charges.</li>
            <li>Maintenir les meubles et équipements en bon état.</li>
            <li>Utiliser le logement conformément à sa destination d'habitation.</li>
            <li>Ne pas déplacer, retirer ou remplacer les meubles sans autorisation.</li>
            <li>Ne pas sous-louer, même partiellement, sauf accord écrit.</li>
            <li>Respecter le règlement de la résidence (si applicable).</li>
            <li>Prévenir immédiatement en cas de panne, fuite ou incident.</li>
        </ul>
        <p>En cas de détérioration d'un meuble, le locataire devra prendre en charge la réparation ou le remplacement.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 9 : OBLIGATIONS DU BAILLEUR</div>
        <p>Le bailleur s'engage à :</p>
        <ul class="equipment-list">
            <li>Livrer un logement meublé en bon état et propre.</li>
            <li>Assurer le bon fonctionnement des équipements principaux.</li>
            <li>Garantir la jouissance paisible du locataire.</li>
            <li>Effectuer les réparations majeures.</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 10 : ENTRETIEN ET RÉPARATIONS</div>
        <p><strong>À la charge du locataire :</strong></p>
        <ul class="equipment-list">
            <li>Petites réparations (ampoules, robinets, serrures, entretien normal).</li>
            <li>Entretien du mobilier fourni.</li>
            <li>Nettoyage courant.</li>
        </ul>

        <p class="mt-4"><strong>À la charge du bailleur :</strong></p>
        <ul class="equipment-list">
            <li>Réparations structurelles.</li>
            <li>Remplacement des équipements non fonctionnels (hors négligence du locataire).</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 11 : RÉSILIATION DU BAIL</div>
        <p>Le contrat peut être résilié :</p>
        <ul class="equipment-list">
            <li>Par le locataire avec un préavis de {{ $contract['notice_period'] ?? 1 }} mois.</li>
            <li>Par le bailleur pour motifs légitimes :
                <ul>
                    <li>impayés répétés,</li>
                    <li>dégradation du mobilier,</li>
                    <li>activités interdites,</li>
                    <li>nuisance grave au voisinage.</li>
                </ul>
            </li>
        </ul>
        <p>Le locataire reste redevable des loyers jusqu'à la fin du préavis.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 12 : VISITES ET ACCÈS AU LOGEMENT</div>
        <p>Le bailleur pourra accéder au logement pour inspections, réparations ou visites, sous réserve :</p>
        <ul class="equipment-list">
            <li>d'un délai de prévenance de 24 à 48 heures,</li>
            <li>du respect de la tranquillité du locataire.</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 13 : INVENTAIRE DU MOBILIER</div>
        <p>La liste complète du mobilier, avec son état, sa valeur estimée et sa localisation, est jointe en annexe. Elle a valeur contractuelle.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 14 : LITIGES</div>
        <p>Les parties s'efforceront de résoudre à l'amiable tout différend. À défaut d'accord, elles pourront saisir les juridictions compétentes.</p>
    </div>

    <div class="section">
        <div class="section-title">ARTICLE 15 : SIGNATURES</div>
        <p>Fait à ......................................... le {{ $current_date }}</p>

        <div class="signature">
            <div class="signature-block">
                <p>Le Bailleur</p>
                <p>Signature précédée de « Lu et approuvé »</p>
                <p>............................................................</p>
            </div>

            <div class="signature-block">
                <p>Le Locataire</p>
                <p>Signature précédée de « Lu et approuvé »</p>
                <p>............................................................</p>
            </div>
        </div>

        <div class="signature mt-4">
            <div class="signature-block">
                <p>Garant 1 (facultatif)</p>
                <p>Nom : ......................................</p>
                <p>Signature : .....................</p>
            </div>

            <div class="signature-block">
                <p>Garant 2 (facultatif)</p>
                <p>Nom : ......................................</p>
                <p>Signature : .....................</p>
            </div>
        </div>
    </div>
</body>
</html>
