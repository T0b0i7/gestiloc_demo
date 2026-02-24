{{-- resources/views/emails/dossier-shared.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dossier de candidature partagé</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            background: #70AE48;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .section h3 {
            margin: 0 0 15px;
            color: #70AE48;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .info-item strong {
            display: block;
            color: #666;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .info-item span {
            font-size: 15px;
            font-weight: 500;
            color: #333;
        }
        .button {
            display: inline-block;
            background: #70AE48;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background 0.3s;
        }
        .button:hover {
            background: #5a8f3a;
        }
        .button-secondary {
            display: inline-block;
            background: white;
            color: #70AE48;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            border: 2px solid #70AE48;
            margin: 10px 5px;
            transition: all 0.3s;
        }
        .button-secondary:hover {
            background: #70AE48;
            color: white;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
        }
        .dossier-icon {
            width: 60px;
            height: 60px;
            background: #e8f5e9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
        }
        .dossier-icon svg {
            width: 30px;
            height: 30px;
            fill: #70AE48;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #e8f5e9;
            color: #70AE48;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
        .url-box {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
            margin: 20px 0;
            border: 1px dashed #70AE48;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="dossier-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                </svg>
            </div>
            <h1>📋 Dossier de candidature partagé</h1>
            <p>Par {{ $tenant->first_name }} {{ $tenant->last_name }}</p>
        </div>

        <div class="content">
            <p>Bonjour{{ $user ? ' ' . $user->first_name : '' }},</p>

            <p><strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong> vous a partagé son dossier de candidature.</p>

            <!-- Informations personnelles -->
            <div class="section">
                <h3>👤 Informations personnelles</h3>
                <div class="info-grid">
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
            </div>

            <!-- Contact -->
            <div class="section">
                <h3>📧 Contact</h3>
                <div class="info-grid">
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
                <h3>📍 Adresse</h3>
                <div class="info-grid">
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
                    @if($dossier->pays)
                    <div class="info-item">
                        <strong>Pays</strong>
                        <span>{{ $dossier->pays }}</span>
                    </div>
                    @endif
                </div>
            </div>
            @endif

            <!-- Professionnel -->
            @if($dossier->profession || $dossier->revenus_mensuels)
            <div class="section">
                <h3>💼 Situation professionnelle</h3>
                <div class="info-grid">
                    @if($dossier->profession)
                    <div class="info-item">
                        <strong>Profession</strong>
                        <span>{{ $dossier->profession }}</span>
                    </div>
                    @endif
                    @if($dossier->type_activite)
                    <div class="info-item">
                        <strong>Type d'activité</strong>
                        <span>{{ $dossier->type_activite }}</span>
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

            <!-- Lien de partage -->
            @if($dossier->shareable_url)
            <div style="text-align: center; margin: 30px 0;">
                <div class="url-box">
                    {{ $dossier->shareable_url }}
                </div>

                <a href="{{ $dossier->shareable_url }}" class="button" target="_blank">
                    👁️ Voir le dossier complet
                </a>

                <p style="margin-top: 15px; font-size: 14px; color: #666;">
                    Ce lien vous permettra d'accéder à l'ensemble des informations et documents du candidat.
                </p>
            </div>
            @endif
        </div>

        <div class="footer">
            <p>Cet email a été envoyé via {{ config('app.name') }}. Merci de ne pas y répondre.</p>
            <p style="margin-top: 10px; font-size: 12px;">
                © {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>
