<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>État des lieux</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 15px;
        }
        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #70AE48;
            padding-bottom: 12px;
        }
        .header h1 {
            color: #70AE48;
            margin: 0;
            font-size: 22px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 13px;
        }
        .section {
            margin-bottom: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #f5f5f5;
            padding: 10px 12px;
            margin: 0;
            font-size: 14px;
            font-weight: bold;
            color: #70AE48;
            border-bottom: 1px solid #e0e0e0;
        }
        .section-content {
            padding: 12px;
        }
        .info-row {
            display: flex;
            margin-bottom: 8px;
            border-bottom: 1px dashed #f0f0f0;
            padding-bottom: 6px;
        }
        .info-label {
            width: 180px;
            font-weight: 600;
            color: #555;
        }
        .info-value {
            flex: 1;
            color: #333;
        }
        .badge {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-entry {
            background-color: #e3f2fd;
            color: #0d47a1;
            border: 1px solid #bbdefb;
        }
        .badge-exit {
            background-color: #fff3e0;
            color: #e65100;
            border: 1px solid #ffe0b2;
        }
        .badge-signed {
            background-color: #e8f5e8;
            color: #1b5e20;
            border: 1px solid #c8e6c9;
        }
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        .photo-item {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            page-break-inside: avoid;
        }
        .photo-item img {
            width: 100%;
            height: auto;
            display: block;
        }
        .photo-caption {
            padding: 5px;
            font-size: 9px;
            text-align: center;
            background-color: #f9f9f9;
            color: #666;
        }
        .signature-area {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            margin-top: 40px;
            border-top: 1px solid #333;
            width: 100%;
            padding-top: 5px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 4px;
        }
        .status-signed {
            background-color: #4caf50;
        }
        .status-draft {
            background-color: #ff9800;
        }
        .status-finalized {
            background-color: #2196f3;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $report->type === 'entry' ? 'ÉTAT DES LIEUX D\'ENTRÉE' : 'ÉTAT DES LIEUX DE SORTIE' }}</h1>
        <p>Référence : {{ $report->uuid }}</p>
        <p>Date d'édition : {{ $date }}</p>
        <div style="margin-top: 8px;">
            @if($report->type === 'entry')
                <span class="badge badge-entry">ENTRÉE</span>
            @else
                <span class="badge badge-exit">SORTIE</span>
            @endif

            @if($report->status === 'signed')
                <span class="badge badge-signed">SIGNÉ</span>
            @endif
        </div>
    </div>

    <!-- Informations générales -->
    <div class="section">
        <div class="section-title">INFORMATIONS GÉNÉRALES</div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Bien :</span>
                <span class="info-value">{{ $property->name ?? 'Non défini' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresse :</span>
                <span class="info-value">{{ $property->address ?? '' }}{{ $property->city ? ', ' . $property->city : '' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date du rapport :</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($report->report_date)->format('d/m/Y H:i') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Créé par :</span>
                <span class="info-value">{{ $report->creator->name ?? $report->created_by_name ?? 'Système' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Statut :</span>
                <span class="info-value">
                    @if($report->status === 'draft') Brouillon
                    @elseif($report->status === 'finalized') Finalisé
                    @elseif($report->status === 'signed') Signé
                    @else {{ $report->status }}
                    @endif
                </span>
            </div>
        </div>
    </div>

    <!-- Signatures -->
    <div class="section">
        <div class="section-title">SIGNATURES</div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Locataire :</span>
                <span class="info-value">
                    @if($report->signature_tenant)
                        <span class="badge badge-signed">Signé le {{ $report->signature_date ? \Carbon\Carbon::parse($report->signature_date)->format('d/m/Y H:i') : '' }}</span>
                    @else
                        <span style="color: #999;">Non signé</span>
                    @endif
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Propriétaire :</span>
                <span class="info-value">
                    @if($report->signature_landlord)
                        <span class="badge badge-signed">Signé</span>
                    @else
                        <span style="color: #999;">Non signé</span>
                    @endif
                </span>
            </div>
        </div>
    </div>

    <!-- Commentaires -->
    @if($report->comments)
    <div class="section">
        <div class="section-title">COMMENTAIRES</div>
        <div class="section-content">
            <p style="white-space: pre-line; margin: 0;">{{ $report->comments }}</p>
        </div>
    </div>
    @endif

    <!-- Photos -->
    @if(isset($report->photos) && count($report->photos) > 0)
    <div class="section">
        <div class="section-title">PHOTOS ({{ count($report->photos) }})</div>
        <div class="section-content">
            <div class="photos-grid">
                @foreach($report->photos as $index => $photo)
                <div class="photo-item">
                    <img src="{{ $photo['url'] }}" alt="Photo {{ $index + 1 }}">
                    @if($photo['caption'] || $photo['room'])
                    <div class="photo-caption">
                        @if($photo['room'])<strong>{{ $photo['room'] }}</strong>@endif
                        @if($photo['caption']) - {{ $photo['caption'] }}@endif
                    </div>
                    @endif
                </div>
                @endforeach
            </div>
        </div>
    </div>
    @endif

    <!-- Signatures -->
    <div class="signature-area">
        <div class="signature-box">
            <p><strong>Le locataire</strong></p>
            <p>{{ $tenant->first_name ?? '' }} {{ $tenant->last_name ?? '' }}</p>
            @if($report->signature_tenant)
                <p style="font-size: 10px; color: #4caf50;">Signé le {{ $report->signature_date ? \Carbon\Carbon::parse($report->signature_date)->format('d/m/Y') : '' }}</p>
            @else
                <div class="signature-line">Signature</div>
            @endif
        </div>
        <div class="signature-box">
            <p><strong>Le propriétaire</strong></p>
            <p>{{ $property->landlord->user->name ?? $property->landlord->first_name ?? 'Propriétaire' }}</p>
            @if($report->signature_landlord)
                <p style="font-size: 10px; color: #4caf50;">Signé</p>
            @else
                <div class="signature-line">Signature</div>
            @endif
        </div>
    </div>

    <div class="footer">
        <p>Document généré automatiquement par {{ config('app.name') }} le {{ $date }}</p>
        <p>Ce document fait foi d'état des lieux. Conservez-le précieusement.</p>
    </div>
</body>
</html>
