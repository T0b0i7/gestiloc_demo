<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0 0 10px 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-item {
            margin-bottom: 10px;
            padding: 8px;
            background-color: white;
            border-radius: 4px;
            border-left: 3px solid #667eea;
        }
        .label {
            font-weight: bold;
            color: #7f8c8d;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Quittance de loyer</h1>
        <p>Bonjour {{ $tenant_name }},</p>
    </div>

    <div class="content">
        <p>Votre quittance de loyer pour la période de <strong>{{ $periode }}</strong> est disponible.</p>

        <div class="info-item">
            <span class="label">Référence :</span> {{ $reference }}
        </div>

        <div class="info-item">
            <span class="label">Bien :</span> {{ $property_address }}
        </div>

        <div class="info-item">
            <span class="label">Montant :</span> {{ $montant }}
        </div>

        <div class="info-item">
            <span class="label">Date d'émission :</span> {{ $date_emission }}
        </div>
    </div>

    <div style="text-align: center;">
        <p>Vous trouverez la quittance en pièce jointe de cet email au format PDF.</p>
        <p>Conservez ce document comme preuve de paiement.</p>
    </div>

    <div class="footer">
        <p>Cet email a été envoyé automatiquement par le système GESTILOC</p>
        <p>Pour toute question, veuillez contacter votre gestionnaire.</p>
    </div>
</body>
</html>
