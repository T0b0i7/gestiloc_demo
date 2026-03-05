{{-- resources/views/pdf/document.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $document->name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 30px;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #70AE48;
        }
        .header h1 {
            color: #70AE48;
            font-size: 28px;
            margin: 0 0 10px;
        }
        .header p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .document-info {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .info-item {
            margin: 10px 0;
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
        .info-item p {
            margin: 5px 0 0;
            font-size: 14px;
            color: #333;
        }
        .shared-with {
            margin-top: 30px;
            padding: 20px;
            background: #f0f7f0;
            border-radius: 8px;
            border-left: 4px solid #70AE48;
        }
        .shared-with h3 {
            color: #70AE48;
            margin: 0 0 15px;
            font-size: 18px;
        }
        .shared-with ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .shared-with li {
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .shared-with li:last-child {
            border-bottom: none;
        }
        .footer {
            margin-top: 50px;
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
        .document-content {
            margin-top: 30px;
            padding: 20px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        @page {
            margin: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 DOCUMENT</h1>
        <p>Généré le {{ $date }}</p>
        <p>Réf: DOC-{{ str_pad((string)$document->id, 6, '0', STR_PAD_LEFT) }}</p>
    </div>

    <div class="document-info">
        <h2 style="color: #70AE48; margin-top: 0;">{{ $document->name }}</h2>

        <div class="info-grid">
            @if($document->type)
            <div class="info-item">
                <strong>Type de document</strong>
                <span>
                    @switch($document->type)
                        @case('acte_vente') Acte de vente @break
                        @case('bail') Bail @break
                        @case('quittance') Quittance de loyer @break
                        @case('dpe') Diagnostic de Performance Énergétique (DPE) @break
                        @case('diagnostic') Diagnostic technique @break
                        @default Autre document
                    @endswitch
                </span>
            </div>
            @endif

            @if($document->bien)
            <div class="info-item">
                <strong>Bien concerné</strong>
                <span>{{ $document->bien }}</span>
            </div>
            @endif

            @if($document->property && $document->property->name)
            <div class="info-item">
                <strong>Propriété</strong>
                <span>{{ $document->property->name }}</span>
            </div>
            @endif

            <div class="info-item">
                <strong>Date d'ajout</strong>
                <span>{{ \Carbon\Carbon::parse($document->created_at)->format('d/m/Y H:i') }}</span>
            </div>

            <div class="info-item">
                <strong>Taille du fichier</strong>
                <span>{{ $document->file_size_formatted }}</span>
            </div>

            <div class="info-item">
                <strong>Statut</strong>
                <span>
                    @if($document->status === 'actif')
                        <span class="badge">Actif</span>
                    @else
                        <span class="badge" style="background: #fff3e0; color: #f57c00;">Archivé</span>
                    @endif
                </span>
            </div>
        </div>

        @if($document->description)
        <div class="document-content">
            <strong style="display: block; margin-bottom: 10px; color: #666;">Description :</strong>
            <p style="margin: 0;">{{ $document->description }}</p>
        </div>
        @endif

        @if($document->document_date)
        <div class="info-item" style="margin-top: 20px;">
            <strong>Date du document</strong>
            <span>{{ \Carbon\Carbon::parse($document->document_date)->format('d/m/Y') }}</span>
        </div>
        @endif
    </div>

    @if($document->is_shared && count($document->shared_with_users) > 0)
    <div class="shared-with">
        <h3>👥 Partagé avec</h3>
        <ul>
            @foreach($document->shared_with_users as $user)
            <li>
                <strong>{{ $user['name'] }}</strong>
                <span style="color: #666; font-size: 14px;">({{ $user['email'] }})</span>
            </li>
            @endforeach
        </ul>
    </div>
    @endif

    @if($document->is_shared && count($document->shared_with_emails) > 0)
    <div class="shared-with">
        <h3>📧 Partagé avec (emails externes)</h3>
        <ul>
            @foreach($document->shared_with_emails as $email)
            <li>
                <span style="color: #666;">{{ $email }}</span>
            </li>
            @endforeach
        </ul>
    </div>
    @endif

    <!-- Cachet numérique -->
    <div style="margin-top: 40px; text-align: right;">
        <div style="display: inline-block; padding: 10px 20px; border: 2px solid #70AE48; border-radius: 8px;">
            <span style="color: #70AE48; font-weight: bold;">✅ Cachet numérique</span>
        </div>
        <p style="font-size: 11px; color: #666; margin-top: 10px;">
            Document généré numériquement par GestiLoc - {{ $date }}
        </p>
    </div>

    <div class="footer">
        <p>Ce document a été généré automatiquement par {{ config('app.name') }}.</p>
        <p>Document officiel - Valable sans signature physique</p>
        <p style="margin-top: 10px; font-size: 10px;">
            © {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.
        </p>
    </div>
</body>
</html>
