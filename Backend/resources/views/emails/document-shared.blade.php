{{-- resources/views/emails/document-shared.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document partagé</title>
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
        .document-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .document-info p {
            margin: 5px 0;
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
            <h1>📄 Document partagé</h1>
        </div>

        <p>Bonjour{{ $user ? ' ' . $user->first_name : '' }},</p>

        <p><strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong> vous a partagé un document.</p>

        <div class="document-info">
            <h3>{{ $document->name }}</h3>
            <p><strong>Type :</strong> {{ $document->type }}</p>
            @if($document->bien)
                <p><strong>Bien :</strong> {{ $document->bien }}</p>
            @endif
            @if($document->description)
                <p><strong>Description :</strong> {{ $document->description }}</p>
            @endif
        </div>

        <p>
            <a href="{{ $document->file_url }}" class="button" target="_blank">
                Télécharger le document
            </a>
        </p>

        <p>Vous pouvez également accéder à ce document depuis votre espace personnel.</p>

        <div class="footer">
            <p>Cet email a été envoyé via {{ config('app.name') }}. Merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
