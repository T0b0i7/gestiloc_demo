<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Note partagée</title>
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
            background: linear-gradient(135deg, #70AE48 0%, #8BC34A 100%);
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
        .note-box {
            background: white;
            border-left: 4px solid #70AE48;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .note-box h3 {
            margin-top: 0;
            color: #70AE48;
        }
        .button {
            display: inline-block;
            background: #70AE48;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin: 20px 0;
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
        .file-list {
            margin-top: 15px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        .file-list ul {
            margin: 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Gestiloc</h1>
            <p>Une note a été partagée avec vous</p>
        </div>

        <div class="content">
            <h2>Bonjour {{ $recipient->first_name }} {{ $recipient->last_name }},</h2>

            <p>Votre locataire <strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong> a partagé une note avec vous.</p>

            <div class="tenant-info">
                <p><strong>Locataire :</strong> {{ $tenant->first_name }} {{ $tenant->last_name }}</p>
                <p><strong>Email :</strong> {{ $tenant->user->email }}</p>
            </div>

            <div class="note-box">
                <h3>{{ $note->title }}</h3>
                <p>{{ $note->content }}</p>

                @if($note->property)
                    <p><strong>Bien :</strong> {{ $note->property->name }}</p>
                @endif

                @if($note->files && count($note->files) > 0)
                    <div class="file-list">
                        <p><strong>Fichiers joints :</strong></p>
                        <ul>
                            @foreach($note->file_urls as $file)
                                <li><a href="{{ $file }}" target="_blank">{{ basename($file) }}</a></li>
                            @endforeach
                        </ul>
                    </div>
                @endif
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url') }}/notes" class="button">
                    Voir toutes mes notes
                </a>
            </div>
        </div>

        <div class="footer">
            <p>Cet email vous a été envoyé via Gestiloc.</p>
            <p>© {{ date('Y') }} Gestiloc. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
