<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Invitation à rejoindre {{ config('app.name') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invitation à rejoindre {{ config('app.name') }}</h1>
            <p>Créez votre compte locataire</p>
        </div>

        <div class="content">
            <p>Bonjour <strong>{{ $invitation->name }}</strong>,</p>

            <p>Vous avez été invité(e) à rejoindre la plateforme <strong>{{ config('app.name') }}</strong> en tant que locataire.</p>

            <div class="info-box">
                <p><strong>Vos informations :</strong></p>
                <ul>
                    <li>Nom : {{ $invitation->name }}</li>
                    <li>Email : {{ $invitation->email }}</li>
                    <li>Invitation envoyée par : {{ $coOwner->first_name }} {{ $coOwner->last_name }}</li>
                </ul>
            </div>

            <p>Pour finaliser votre inscription et accéder à votre espace locataire, cliquez sur le bouton ci-dessous :</p>

            <div style="text-align: center;">
                <a href="{{ $signedUrl }}" class="button">
                    Créer mon compte locataire
                </a>
            </div>

            <p>Ce lien d'activation est valable pendant 7 jours. Après cette date, vous devrez demander une nouvelle invitation.</p>

            <p>Une fois votre compte créé, vous pourrez :</p>
            <ul>
                <li>Consulter vos contrats de location</li>
                <li>Payer votre loyer en ligne</li>
                <li>Signaler des problèmes de maintenance</li>
                <li>Communiquer avec votre gestionnaire</li>
            </ul>

            <p>Si vous n'êtes pas concerné(e) par cette invitation, vous pouvez ignorer cet email.</p>
        </div>

        <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
