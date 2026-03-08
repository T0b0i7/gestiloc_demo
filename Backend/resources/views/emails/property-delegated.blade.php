<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Un bien vous a été délégué</title>
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
            border: 1px solid rgba(112, 174, 72, 0.2);
        }
        .email-header {
            background: linear-gradient(135deg, #70AE48 0%, #8BC34A 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
        }
        .email-header p {
            margin: 10px 0 0;
            opacity: 0.9;
        }
        .email-content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .greeting strong {
            color: #70AE48;
        }
        .property-card {
            background: #f0f9e6;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
            border: 2px solid rgba(112, 174, 72, 0.2);
        }
        .property-card h2 {
            color: #70AE48;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .property-detail {
            margin: 8px 0;
            color: #334155;
        }
        .property-detail strong {
            color: #1e293b;
            min-width: 100px;
            display: inline-block;
        }
        .permissions-section {
            margin: 25px 0;
        }
        .permissions-section p {
            font-weight: 600;
            margin-bottom: 10px;
        }
        .permissions-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 10px 0;
        }
        .permission-badge {
            background: white;
            border: 1px solid #70AE48;
            color: #70AE48;
            padding: 8px 16px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .notes-box {
            background: #f8fafc;
            border-left: 4px solid #70AE48;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-style: italic;
            color: #475569;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: #70AE48;
            color: white;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 10px rgba(112, 174, 72, 0.3);
            transition: all 0.3s ease;
        }
        .button:hover {
            background: #5c8f3a;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(112, 174, 72, 0.4);
        }
        .footer-note {
            color: #64748b;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>🏠 Nouvelle délégation</h1>
            <p>Un bien vous a été confié</p>
        </div>
        <div class="email-content">
            <div class="greeting">
                Bonjour <strong>{{ $coOwnerName }}</strong>,
            </div>

            <p><strong>{{ $delegatorName }}</strong> vous a délégué la gestion du bien suivant :</p>

            <div class="property-card">
                <h2>{{ $propertyName }}</h2>
                <div class="property-detail">
                    <strong>Adresse :</strong> {{ $propertyAddress }}, {{ $propertyCity }}
                </div>
                <div class="property-detail">
                    <strong>Type de délégation :</strong>
                    <span style="color: #70AE48; font-weight: 600;">{{ $delegationType }}</span>
                </div>
                @if($expiresAt)
                <div class="property-detail">
                    <strong>Expire le :</strong> {{ $expiresAt }}
                </div>
                @endif
            </div>

            <div class="permissions-section">
                <p>✅ Permissions qui vous sont accordées :</p>
                <div class="permissions-list">
                    @foreach($permissions as $permission)
                        @php
                            $labels = [
                                'view' => 'Voir',
                                'edit' => 'Modifier',
                                'manage_lease' => 'Gérer les baux',
                                'collect_rent' => 'Collecter les loyers',
                                'manage_maintenance' => 'Gérer la maintenance',
                                'send_invoices' => 'Envoyer les factures',
                                'manage_tenants' => 'Gérer les locataires',
                                'view_documents' => 'Voir les documents',
                                'manage_delegations' => 'Gérer les délégations'
                            ];
                            $label = $labels[$permission] ?? $permission;
                        @endphp
                        <span class="permission-badge">✓ {{ $label }}</span>
                    @endforeach
                </div>
            </div>

            @if($notes)
            <div class="notes-box">
                <strong>📝 Notes :</strong> {{ $notes }}
            </div>
            @endif

            <div class="button-container">
                <a href="{{ $dashboardUrl }}" class="button">
                    Accéder à mon tableau de bord →
                </a>
            </div>

            <div class="footer-note">
                Vous pouvez maintenant gérer ce bien selon les permissions accordées.
                Si vous avez des questions, contactez votre propriétaire.
            </div>
        </div>
    </div>
</body>
</html>
