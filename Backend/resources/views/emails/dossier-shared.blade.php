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
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        .header {
            background: linear-gradient(135deg, rgba(82, 157, 33, 0.95) 0%, rgba(62, 127, 23, 0.98) 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -20px -20px 20px -20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .info-section {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .button {
            display: inline-block;
            background: #7CB342;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Dossier de candidature</h1>
        </div>

        <p>Bonjour{{ $user ? ' ' . $user->first_name : '' }},</p>

        <p><strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong> vous a partagé son dossier de candidature.</p>

        <div class="info-section">
            <h3>Informations du candidat</h3>
            <div class="info-grid">
                <div>
                    <p><strong>Nom :</strong> {{ $dossier->nom }}</p>
                    <p><strong>Prénoms :</strong> {{ $dossier->prenoms }}</p>
                    @if($dossier->date_naissance)
                        <p><strong>Date naissance :</strong> {{ $dossier->date_naissance->format('d/m/Y') }}</p>
                    @endif
                </div>
                <div>
                    <p><strong>Email :</strong> {{ $dossier->email }}</p>
                    <p><strong>Téléphone :</strong> {{ $dossier->telephone ?: 'Non renseigné' }}</p>
                    <p><strong>Mobile :</strong> {{ $dossier->mobile ?: 'Non renseigné' }}</p>
                </div>
            </div>

            @if($dossier->profession)
                <p><strong>Profession :</strong> {{ $dossier->profession }}</p>
            @endif
            @if($dossier->revenus_mensuels)
                <p><strong>Revenus mensuels :</strong> {{ number_format($dossier->revenus_mensuels, 0, ',', ' ') }} FCFA</p>
            @endif
        </div>

        <p>
            <a href="{{ $dossier->shareable_url }}" class="button" target="_blank">
                Voir le dossier complet
            </a>
        </p>

        <p>Ce lien vous permettra d'accéder à l'ensemble des informations et documents du candidat.</p>

        <div class="footer">
            <p>Cet email a été envoyé via {{ config('app.name') }}. Merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
