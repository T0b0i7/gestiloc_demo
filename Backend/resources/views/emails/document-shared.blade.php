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
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #70AE48;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-box h3 {
            margin: 0 0 10px;
            color: #70AE48;
            font-size: 18px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .info-item strong {
            display: block;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-item span {
            font-size: 16px;
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
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
        }
        .document-icon {
            width: 60px;
            height: 60px;
            background: #e8f5e9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
        }
        .document-icon svg {
            width: 30px;
            height: 30px;
            fill: #70AE48;
        }
        .meta {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="document-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
            </div>
            <h1>📄 Un document vous a été partagé</h1>
            <p>Par {{ $tenant->first_name }} {{ $tenant->last_name }}</p>
        </div>

        <div class="content">
            <p>Bonjour{{ $user ? ' ' . $user->first_name : '' }},</p>

            <p><strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong> vous a partagé un document.</p>

            <div class="info-box">
                <h3>{{ $document->name }}</h3>

                <div class="info-grid">
                    @if($document->type)
                    <div class="info-item">
                        <strong>Type</strong>
                        <span>
                            @switch($document->type)
                                @case('acte_vente') Acte de vente @break
                                @case('bail') Bail @break
                                @case('quittance') Quittance @break
                                @case('dpe') DPE @break
                                @case('diagnostic') Diagnostic @break
                                @default Autre
                            @endswitch
                        </span>
                    </div>
                    @endif

                    @if($document->bien)
                    <div class="info-item">
                        <strong>Bien</strong>
                        <span>{{ $document->bien }}</span>
                    </div>
                    @endif

                    @if($document->file_size_formatted)
                    <div class="info-item">
                        <strong>Taille</strong>
                        <span>{{ $document->file_size_formatted }}</span>
                    </div>
                    @endif

                    @if($document->created_at)
                    <div class="info-item">
                        <strong>Date</strong>
                        <span>{{ $document->created_at->format('d/m/Y') }}</span>
                    </div>
                    @endif
                </div>

                @if($document->description)
                <div class="meta" style="margin-top: 20px;">
                    <strong>Description :</strong>
                    <p style="margin: 5px 0 0;">{{ $document->description }}</p>
                </div>
                @endif
            </div>

            <div style="text-align: center;">
                <a href="{{ $document->file_url }}" class="button" target="_blank">
                    📥 Télécharger le document
                </a>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Vous pouvez également accéder à ce document directement depuis votre espace personnel.
            </p>
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
