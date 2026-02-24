{{-- resources/views/pdf/dossier.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dossier de candidature - {{ $dossier->nom }} {{ $dossier->prenoms }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #70AE48;
        }
        .header h1 {
            color: #70AE48;
            font-size: 28px;
            margin: 0;
        }
        .header p {
            color: #666;
            font-size: 16px;
            margin: 5px 0 0;
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .section h2 {
            color: #70AE48;
            font-size: 20px;
            margin: 0 0 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #70AE48;
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            margin: 10px 0;
        }
        .info-item strong {
            display: block;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
        }
        .info-item span {
            font-size: 16px;
            font-weight: 500;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #70AE48;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #e8f5e9;
            color: #70AE48;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .document-list {
            margin-top: 15px;
        }
        .document-item {
            padding: 10px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 DOSSIER DE CANDIDATURE</h1>
        <p>Généré le {{ $date }}</p>
    </div>

    <!-- Informations personnelles -->
    <div class="section">
        <h2>👤 Informations personnelles</h2>
        <div class="grid">
            <div class="info-item">
                <strong>Nom</strong>
                <span>{{ $dossier->nom }}</span>
            </div>
            <div class="info-item">
                <strong>Prénoms</strong>
                <span>{{ $dossier->prenoms }}</span>
            </div>
            @if($dossier->date_naissance)
            <div class="info-item">
                <strong>Date de naissance</strong>
                <span>{{ \Carbon\Carbon::parse($dossier->date_naissance)->format('d/m/Y') }}</span>
            </div>
            @endif
        </div>
        @if($dossier->a_propos)
        <div class="info-item">
            <strong>À propos</strong>
            <p>{{ $dossier->a_propos }}</p>
        </div>
        @endif
    </div>

    <!-- Contact -->
    <div class="section">
        <h2>📧 Contact</h2>
        <div class="grid">
            <div class="info-item">
                <strong>Email</strong>
                <span>{{ $dossier->email }}</span>
            </div>
            @if($dossier->telephone)
            <div class="info-item">
                <strong>Téléphone</strong>
                <span>{{ $dossier->telephone }}</span>
            </div>
            @endif
            @if($dossier->mobile)
            <div class="info-item">
                <strong>Mobile</strong>
                <span>{{ $dossier->mobile }}</span>
            </div>
            @endif
        </div>
    </div>

    <!-- Adresse -->
    @if($dossier->adresse || $dossier->ville || $dossier->pays)
    <div class="section">
        <h2>📍 Adresse</h2>
        <div class="grid">
            @if($dossier->adresse)
            <div class="info-item">
                <strong>Adresse</strong>
                <span>{{ $dossier->adresse }}</span>
            </div>
            @endif
            @if($dossier->ville)
            <div class="info-item">
                <strong>Ville</strong>
                <span>{{ $dossier->ville }}</span>
            </div>
            @endif
            @if($dossier->region)
            <div class="info-item">
                <strong>Région</strong>
                <span>{{ $dossier->region }}</span>
            </div>
            @endif
            @if($dossier->pays)
            <div class="info-item">
                <strong>Pays</strong>
                <span>{{ $dossier->pays }}</span>
            </div>
            @endif
        </div>
    </div>
    @endif

    <!-- Situation professionnelle -->
    @if($dossier->profession || $dossier->type_activite || $dossier->revenus_mensuels)
    <div class="section">
        <h2>💼 Situation professionnelle</h2>
        <div class="grid">
            @if($dossier->type_activite)
            <div class="info-item">
                <strong>Type d'activité</strong>
                <span>{{ $dossier->type_activite }}</span>
            </div>
            @endif
            @if($dossier->profession)
            <div class="info-item">
                <strong>Profession</strong>
                <span>{{ $dossier->profession }}</span>
            </div>
            @endif
            @if($dossier->revenus_mensuels)
            <div class="info-item">
                <strong>Revenus mensuels</strong>
                <span>{{ number_format($dossier->revenus_mensuels, 0, ',', ' ') }} FCFA</span>
            </div>
            @endif
        </div>
    </div>
    @endif

    <!-- Garant -->
    @if($dossier->has_garant)
    <div class="section">
        <h2>👥 Garant</h2>
        <div class="grid">
            @if($dossier->garant_type)
            <div class="info-item">
                <strong>Type de garant</strong>
                <span>
                    @switch($dossier->garant_type)
                        @case('personne_physique') Personne physique @break
                        @case('organisme') Organisme ou société @break
                        @case('bancaire') Garantie bancaire @break
                        @default {{ $dossier->garant_type }}
                    @endswitch
                </span>
            </div>
            @endif
            @if($dossier->garant_description)
            <div class="info-item">
                <strong>Description</strong>
                <p>{{ $dossier->garant_description }}</p>
            </div>
            @endif
        </div>
    </div>
    @endif

    <!-- Documents -->
    @if(count($documents) > 0)
    <div class="section">
        <h2>📎 Documents joints</h2>
        <div class="document-list">
            @foreach($documents as $doc)
            <div class="document-item">
                <strong>{{ $doc->name }}</strong>
                @if($doc->description)
                <p style="margin: 5px 0 0; font-size: 12px; color: #666;">{{ $doc->description }}</p>
                @endif
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Cachet -->
    <div style="margin-top: 50px; text-align: right;">
        <p style="font-size: 12px; color: #666;">Document généré numériquement par GestiLoc</p>
        <div style="margin-top: 10px; padding: 10px; border: 1px solid #70AE48; display: inline-block;">
            <span style="color: #70AE48; font-weight: bold;">✅ Cachet numérique</span>
        </div>
    </div>

    <div class="footer">
        <p>Ce document a été généré automatiquement par {{ config('app.name') }}.</p>
        <p>Les informations fournies sont sous la responsabilité du candidat.</p>
    </div>
</body>
</html>
