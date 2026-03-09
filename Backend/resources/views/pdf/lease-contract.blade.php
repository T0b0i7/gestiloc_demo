<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Contrat de bail</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #70AE48;
            padding-bottom: 15px;
        }
        .header h1 {
            color: #70AE48;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .section-title {
            background-color: #f5f5f5;
            padding: 12px 15px;
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            color: #70AE48;
            border-bottom: 1px solid #e0e0e0;
        }
        .section-content {
            padding: 15px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
            border-bottom: 1px dashed #f0f0f0;
            padding-bottom: 8px;
        }
        .info-label {
            width: 200px;
            font-weight: 600;
            color: #555;
        }
        .info-value {
            flex: 1;
            color: #333;
        }
        .signature-area {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            margin-top: 50px;
            border-top: 1px solid #333;
            width: 100%;
            padding-top: 5px;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }
        .badge-active {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .badge-pending {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }
        .badge-terminated {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        .amount {
            font-weight: bold;
            color: #70AE48;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONTRAT DE LOCATION</h1>
        <p>Référence : {{ $lease->uuid }}</p>
        <p>Date d'édition : {{ $date }}</p>
        <div style="margin-top: 10px;">
            @if($lease->status === 'active')
                <span class="badge badge-active">BAIL ACTIF</span>
            @elseif($lease->status === 'pending')
                <span class="badge badge-pending">BAIL EN ATTENTE</span>
            @else
                <span class="badge badge-terminated">BAIL RÉSILIÉ</span>
            @endif
        </div>
    </div>

    <!-- Informations du bien -->
    <div class="section">
        <div class="section-title">INFORMATIONS SUR LE BIEN</div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Nom / Adresse :</span>
                <span class="info-value">{{ $property->name ?? 'Non défini' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresse complète :</span>
                <span class="info-value">{{ $property->address ?? '' }}{{ $property->city ? ', ' . $property->city : '' }}{{ $property->country ? ', ' . $property->country : '' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type de bien :</span>
                <span class="info-value">{{ $property->type ?? 'Non spécifié' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Surface :</span>
                <span class="info-value">{{ $property->area ?? 'Non spécifiée' }} m²</span>
            </div>
        </div>
    </div>

    <!-- Informations du locataire -->
    <div class="section">
        <div class="section-title">INFORMATIONS SUR LE LOCATAIRE</div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Nom et prénoms :</span>
                <span class="info-value">{{ $tenant->first_name ?? '' }} {{ $tenant->last_name ?? '' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email :</span>
                <span class="info-value">{{ $tenant->user->email ?? $tenant->email ?? 'Non renseigné' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Téléphone :</span>
                <span class="info-value">{{ $tenant->phone ?? 'Non renseigné' }}</span>
            </div>
            @if($tenant->emergency_contact_name)
            <div class="info-row">
                <span class="info-label">Contact d'urgence :</span>
                <span class="info-value">{{ $tenant->emergency_contact_name }} ({{ $tenant->emergency_contact_phone }})</span>
            </div>
            @endif
        </div>
    </div>

    <!-- Détails du bail -->
    <div class="section">
        <div class="section-title">DÉTAILS DU BAIL</div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Date de début :</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($lease->start_date)->format('d/m/Y') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date de fin :</span>
                <span class="info-value">{{ $lease->end_date ? \Carbon\Carbon::parse($lease->end_date)->format('d/m/Y') : 'Indéterminée' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type de bail :</span>
                <span class="info-value">
                    @if($lease->type === 'residential') Bail d'habitation
                    @elseif($lease->type === 'commercial') Bail commercial
                    @elseif($lease->type === 'professional') Bail professionnel
                    @elseif($lease->type === 'furnished') Bail meublé
                    @elseif($lease->type === 'empty') Bail vide
                    @else {{ $lease->type }}
                    @endif
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Statut :</span>
                <span class="info-value">
                    @if($lease->status === 'active') Actif
                    @elseif($lease->status === 'pending') En attente
                    @elseif($lease->status === 'terminated') Résilié
                    @else {{ $lease->status }}
                    @endif
                </span>
            </div>
        </div>
    </div>

    <!-- Conditions financières -->
    <div class="section">
        <div class="section-title">CONDITIONS FINANCIÈRES</div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Loyer mensuel :</span>
                <span class="info-value amount">{{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA</span>
            </div>
            <div class="info-row">
                <span class="info-label">Dépôt de garantie :</span>
                <span class="info-value">{{ number_format($lease->guarantee_amount ?? 0, 0, ',', ' ') }} FCFA</span>
            </div>
            @if($lease->charges_amount > 0)
            <div class="info-row">
                <span class="info-label">Charges :</span>
                <span class="info-value">{{ number_format($lease->charges_amount, 0, ',', ' ') }} FCFA</span>
            </div>
            @endif
            <div class="info-row">
                <span class="info-label">Total mensuel :</span>
                <span class="info-value amount">{{ number_format(($lease->rent_amount + ($lease->charges_amount ?? 0)), 0, ',', ' ') }} FCFA</span>
            </div>
        </div>
    </div>

    <!-- Conditions générales -->
    @if($lease->terms)
    <div class="section">
        <div class="section-title">CONDITIONS GÉNÉRALES</div>
        <div class="section-content">
            @if(is_array($lease->terms) || is_object($lease->terms))
                @foreach($lease->terms as $key => $value)
                    @if(!is_null($value) && $value !== '')
                        <div class="info-row">
                            <span class="info-label">{{ ucfirst(str_replace('_', ' ', $key)) }} :</span>
                            <span class="info-value">
                                @if(is_array($value) || is_object($value))
                                    {{ json_encode($value, JSON_UNESCAPED_UNICODE) }}
                                @else
                                    {{ $value }}
                                @endif
                            </span>
                        </div>
                    @endif
                @endforeach
            @else
                <p style="white-space: pre-line;">{{ $lease->terms }}</p>
            @endif
        </div>
    </div>
    @endif

    <!-- Signatures -->
    <div class="signature-area">
        <div class="signature-box">
            <p><strong>Le locataire</strong></p>
            <p>{{ $tenant->first_name ?? '' }} {{ $tenant->last_name ?? '' }}</p>
            <div class="signature-line">Signature</div>
        </div>
        <div class="signature-box">
            <p><strong>Le bailleur</strong></p>
            <p>
                @if(isset($property->landlord) && $property->landlord)
                    {{ $property->landlord->first_name ?? '' }} {{ $property->landlord->last_name ?? '' }}
                @else
                    Propriétaire
                @endif
            </p>
            <div class="signature-line">Signature</div>
        </div>
    </div>

    <div class="footer">
        <p>Document généré automatiquement par {{ config('app.name') }} le {{ $date }}</p>
        <p>Ce document fait office de contrat de location. Conservez-le précieusement.</p>
    </div>
</body>
</html>
