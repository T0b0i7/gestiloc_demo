<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mes données - Gestiloc</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #70AE48;
        }
        .header h1 {
            color: #70AE48;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 5px 0 0;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #f0f7e9;
            padding: 10px 15px;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: bold;
            color: #70AE48;
            border-left: 4px solid #70AE48;
        }
        .info-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            width: 35%;
            padding: 8px 10px;
            background-color: #f9f9f9;
            font-weight: 600;
            border-bottom: 1px solid #ddd;
        }
        .info-value {
            display: table-cell;
            width: 65%;
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-success {
            background-color: #d4edda;
            color: #155724;
        }
        .badge-warning {
            background-color: #fff3cd;
            color: #856404;
        }
        .badge-danger {
            background-color: #f8d7da;
            color: #721c24;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 60px;
            color: #70AE48;
            transform: rotate(-15deg);
            z-index: -1;
        }
        table.stats {
            width: 100%;
            border-collapse: collapse;
        }
        table.stats td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
        }
        table.stats td:first-child {
            background-color: #f5f5f5;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="watermark">GESTILOC</div>

    <div class="header">
        <h1>📋 MES DONNÉES PERSONNELLES</h1>
        <p>Exporté le {{ now()->format('d/m/Y à H:i') }}</p>
        <p>Référence: {{ Str::upper(Str::random(8)) }}</p>
    </div>

    <!-- INFORMATIONS PERSONNELLES -->
    <div class="section">
        <div class="section-title">👤 INFORMATIONS PERSONNELLES</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Identifiant</div>
                <div class="info-value">#{{ $data['user']['id'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email</div>
                <div class="info-value">{{ $data['user']['email'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Téléphone</div>
                <div class="info-value">{{ $data['user']['phone'] ?? 'Non renseigné' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Membre depuis</div>
                <div class="info-value">{{ $data['user']['created_at'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Statut du compte</div>
                <div class="info-value">
                    @if($data['user']['status'] === 'active')
                        <span class="badge badge-success">Actif</span>
                    @elseif($data['user']['status'] === 'pending')
                        <span class="badge badge-warning">En attente</span>
                    @else
                        <span class="badge badge-danger">{{ $data['user']['status'] }}</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- PROFIL LOCATAIRE -->
    @if($data['tenant'])
    <div class="section">
        <div class="section-title">🏠 PROFIL LOCATAIRE</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nom complet</div>
                <div class="info-value">{{ $data['tenant']['nom'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date de naissance</div>
                <div class="info-value">{{ $data['tenant']['date_naissance'] ?? 'Non renseignée' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Lieu de naissance</div>
                <div class="info-value">{{ $data['tenant']['lieu_naissance'] ?? 'Non renseigné' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Profession</div>
                <div class="info-value">{{ $data['tenant']['profession'] ?? 'Non renseignée' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Employeur</div>
                <div class="info-value">{{ $data['tenant']['employeur'] ?? 'Non renseigné' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Adresse</div>
                <div class="info-value">{{ $data['tenant']['adresse'] ?? 'Non renseignée' }}</div>
            </div>
        </div>
    </div>
    @endif

    <!-- PRÉFÉRENCES -->
    <div class="section">
        <div class="section-title">⚙️ MES PRÉFÉRENCES</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Langue</div>
                <div class="info-value">{{ $data['preferences']['langue'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Fuseau horaire</div>
                <div class="info-value">{{ $data['preferences']['fuseau_horaire'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Format de date</div>
                <div class="info-value">{{ $data['preferences']['format_date'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Devise</div>
                <div class="info-value">{{ $data['preferences']['devise'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Mode sombre</div>
                <div class="info-value">
                    @if($data['preferences']['mode_sombre'] === 'Activé')
                        <span class="badge badge-success">Activé</span>
                    @else
                        <span class="badge badge-warning">Désactivé</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- SÉCURITÉ -->
    <div class="section">
        <div class="section-title">🔐 SÉCURITÉ DU COMPTE</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Authentification 2FA</div>
                <div class="info-value">
                    @if($data['securite']['2fa_active'] === 'Oui')
                        <span class="badge badge-success">Activée</span>
                    @else
                        <span class="badge badge-warning">Désactivée</span>
                    @endif
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Dernier changement de mot de passe</div>
                <div class="info-value">{{ $data['securite']['dernier_changement_mdp'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Dernière connexion</div>
                <div class="info-value">{{ $data['securite']['derniere_connexion'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Dernière IP</div>
                <div class="info-value">{{ $data['securite']['derniere_ip'] }}</div>
            </div>
        </div>
    </div>

    <!-- STATISTIQUES -->
    <div class="section">
        <div class="section-title">📊 STATISTIQUES</div>
        <table class="stats">
            <tr>
                <td>⏱️ Membre depuis</td>
                <td>{{ $data['statistiques']['membre_depuis'] }}</td>
            </tr>
            <tr>
                <td>📝 Nombre de notes</td>
                <td>{{ $data['statistiques']['total_notes'] }}</td>
            </tr>
        </table>
    </div>

    <!-- INFORMATIONS LÉGALES -->
    <div class="section">
        <div class="section-title">⚖️ INFORMATIONS LÉGALES</div>
        <p style="font-size: 12px; color: #666; line-height: 1.4;">
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            vous avez le droit d'accéder, de rectifier et de demander la suppression
            de vos données personnelles.
        </p>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">
            📧 Pour toute question : <strong>support@gestiloc.com</strong>
        </p>
        <p style="font-size: 11px; color: #999; margin-top: 15px;">
            Document généré automatiquement le {{ now()->format('d/m/Y à H:i:s') }}
        </p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} Gestiloc - Tous droits réservés</p>
        <p>Ce document contient vos données personnelles. Conservez-le en lieu sûr.</p>
    </div>
</body>
</html>
