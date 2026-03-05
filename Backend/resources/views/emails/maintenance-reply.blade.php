<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réponse à votre demande de maintenance</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .message-box {
            background-color: #f0f9ff;
            border-left: 4px solid #4f46e5;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            font-style: italic;
        }
        .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-label {
            font-weight: 600;
            width: 40%;
            color: #64748b;
        }
        .info-value {
            width: 60%;
            color: #0f172a;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-open {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge-in_progress {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .badge-resolved {
            background-color: #dcfce7;
            color: #166534;
        }
        .badge-cancelled {
            background-color: #f1f5f9;
            color: #475569;
        }
        .badge-emergency {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .badge-high {
            background-color: #fed7aa;
            color: #92400e;
        }
        .badge-medium {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .badge-low {
            background-color: #dcfce7;
            color: #166534;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
        }
        .button:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Réponse à votre demande de maintenance</h1>
            <p>Demande #{{ $maintenance->id }}</p>
        </div>

        <div class="content">
            <p>Bonjour <strong>{{ $tenant->first_name ?? $tenantUser->name ?? 'Locataire' }}</strong>,</p>

            <p><strong>{{ $coOwnerUser->name ?? 'Votre copropriétaire' }}</strong> vous a envoyé un message concernant votre demande de maintenance.</p>

         <div class="message-box">
    <strong>Message :</strong><br>
    {{ $replyMessage }}  
</div>

            <h3 style="margin-top: 30px; color: #0f172a;">Récapitulatif de votre demande</h3>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Titre :</span>
                    <span class="info-value"><strong>{{ $maintenance->title }}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Statut :</span>
                    <span class="info-value">
                        @php
                            $statusLabels = [
                                'open' => 'En attente',
                                'in_progress' => 'En cours',
                                'resolved' => 'Résolu',
                                'cancelled' => 'Annulé'
                            ];
                            $statusClasses = [
                                'open' => 'badge-open',
                                'in_progress' => 'badge-in_progress',
                                'resolved' => 'badge-resolved',
                                'cancelled' => 'badge-cancelled'
                            ];
                        @endphp
                        <span class="badge {{ $statusClasses[$maintenance->status] ?? '' }}">
                            {{ $statusLabels[$maintenance->status] ?? $maintenance->status }}
                        </span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Priorité :</span>
                    <span class="info-value">
                        @php
                            $priorityLabels = [
                                'emergency' => 'Urgence',
                                'high' => 'Élevée',
                                'medium' => 'Moyenne',
                                'low' => 'Faible'
                            ];
                            $priorityClasses = [
                                'emergency' => 'badge-emergency',
                                'high' => 'badge-high',
                                'medium' => 'badge-medium',
                                'low' => 'badge-low'
                            ];
                        @endphp
                        <span class="badge {{ $priorityClasses[$maintenance->priority] ?? '' }}">
                            {{ $priorityLabels[$maintenance->priority] ?? $maintenance->priority }}
                        </span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Catégorie :</span>
                    <span class="info-value">
                        @php
                            $categoryLabels = [
                                'plumbing' => 'Plomberie',
                                'electricity' => 'Électricité',
                                'heating' => 'Chauffage',
                                'other' => 'Autre'
                            ];
                        @endphp
                        {{ $categoryLabels[$maintenance->category] ?? $maintenance->category }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Bien concerné :</span>
                    <span class="info-value">
                        {{ $property->address ?? 'Adresse non spécifiée' }}<br>
                        @if($property->city) {{ $property->city }} @endif
                    </span>
                </div>

                @if($maintenance->assigned_provider)
                <div class="info-row">
                    <span class="info-label">Prestataire :</span>
                    <span class="info-value">{{ $maintenance->assigned_provider }}</span>
                </div>
                @endif

                @if($maintenance->estimated_cost)
                <div class="info-row">
                    <span class="info-label">Coût estimé :</span>
                    <span class="info-value">{{ number_format($maintenance->estimated_cost, 2) }} €</span>
                </div>
                @endif

                @if($maintenance->started_at)
                <div class="info-row">
                    <span class="info-label">Pris en charge le :</span>
                    <span class="info-value">{{ $maintenance->started_at->format('d/m/Y H:i') }}</span>
                </div>
                @endif

                @if($maintenance->resolved_at)
                <div class="info-row">
                    <span class="info-label">Résolu le :</span>
                    <span class="info-value">{{ $maintenance->resolved_at->format('d/m/Y H:i') }}</span>
                </div>
                @endif

                @if(!empty($preferredSlotsFormatted))
                <div class="info-row">
                    <span class="info-label">Vos disponibilités :</span>
                    <span class="info-value" style="white-space: pre-line;">{{ $preferredSlotsFormatted }}</span>
                </div>
                @endif

                <div class="info-row">
                    <span class="info-label">Description :</span>
                    <span class="info-value" style="white-space: pre-line;">{{ $maintenance->description }}</span>
                </div>
            </div>

            <p style="margin-top: 30px;">Vous pouvez suivre l'évolution de votre demande depuis votre espace locataire.</p>

            <div style="text-align: center;">
                <a href="{{ url('/locataire/maintenance/' . $maintenance->id) }}" class="button">
                    Voir ma demande
                </a>
            </div>

            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} Tous droits réservés.</p>
            <p style="margin-top: 10px;">{{ $coOwnerUser->name ?? 'Votre copropriétaire' }}</p>
        </div>
    </div>
</body>
</html>
