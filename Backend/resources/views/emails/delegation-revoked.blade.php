<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Délégation révoquée</title>
    <style>
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .email-header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
        }
        .email-content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .message-box {
            background: #fef2f2;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
            border: 2px solid rgba(239, 68, 68, 0.2);
            text-align: center;
        }
        .message-box p {
            margin: 10px 0;
            color: #991b1b;
        }
        .property-name {
            font-size: 20px;
            font-weight: 700;
            color: #dc2626;
        }
        .button {
            display: inline-block;
            background: #ef4444;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background: #dc2626;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>⚠️ Délégation révoquée</h1>
        </div>
        <div class="email-content">
            <div class="greeting">
                Bonjour <strong>{{ $coOwnerName }}</strong>,
            </div>

            <div class="message-box">
                <p>La délégation pour le bien</p>
                <p class="property-name">"{{ $propertyName }}"</p>
                <p>vous a été retirée.</p>
            </div>

            <p>Vous n'avez désormais plus accès à ce bien dans votre espace.</p>

            <div style="text-align: center;">
                <a href="{{ $dashboardUrl ?? 'http://localhost:8080/coproprietaire/dashboard' }}" class="button">
                    Voir mes biens actuels
                </a>
            </div>
        </div>
    </div>
</body>
</html>
