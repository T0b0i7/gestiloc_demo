<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à rejoindre Gestiloc</title>
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
            margin: 0 auto;
            background: #ffffff;
        }

        .header {
            background: linear-gradient(135deg, #529D21 0%, #F5A623 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }

        .content {
            padding: 30px 20px;
            background: #f9f9f9;
        }

        .message-box {
            background: white;
            border-left: 4px solid #529D21;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .message-box p {
            margin: 0;
            white-space: pre-line;
            font-style: italic;
            color: #555;
        }

        .button {
            display: inline-block;
            background: #529D21;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(82, 157, 33, 0.2);
        }

        .button:hover {
            background: #3f7a1a;
        }

        .footer {
            background: #f0f0f0;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }

        .tenant-info {
            background: #e8f5e9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .tenant-info p {
            margin: 5px 0;
        }

        .tenant-info strong {
            color: #2e7d32;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Gestiloc</h1>
            <p>Votre solution de gestion locative</p>
        </div>

        <div class="content">
            <h2>Bonjour {{ $landlordName }},</h2>

            <p>Le locataire <strong>{{ $tenantInfo->first_name }} {{ $tenantInfo->last_name }}</strong> vous invite à
                rejoindre <strong>Gestiloc</strong>, la plateforme qui simplifie la gestion locative.</p>

            <div class="tenant-info">
                <p><strong>Locataire :</strong> {{ $tenantInfo->first_name }} {{ $tenantInfo->last_name }}</p>
                <p><strong>Email :</strong> {{ $tenantInfo->email }}</p>
                @if ($tenantInfo->phone)
                    <p><strong>Téléphone :</strong> {{ $tenantInfo->phone }}</p>
                @endif
            </div>

            <h3>Message du locataire :</h3>
            <div class="message-box">
                <p>{{ $invitationMessage }}</p>
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url') }}/register" class="button"
                    style="color: white; text-decoration: none;">
                    Créer mon compte propriétaire
                </a>
            </div>


            <p><strong>Pourquoi rejoindre Gestiloc ?</strong></p>
            <ul>
                <li>✅ Gérez vos biens en toute simplicité</li>
                <li>✅ Suivez les paiements de loyer</li>
                <li>✅ Communiquez facilement avec votre locataire</li>
                <li>✅ Accédez à tous vos documents (baux, quittances)</li>
                <li>✅ Gratuit pour les propriétaires</li>
            </ul>
        </div>

        <div class="footer">
            <p>Cet email a été envoyé à la demande de {{ $tenantInfo->first_name }} {{ $tenantInfo->last_name }}.</p>
            <p>© {{ date('Y') }} Gestiloc. Tous droits réservés.</p>

        </div>
    </div>
</body>

</html>
