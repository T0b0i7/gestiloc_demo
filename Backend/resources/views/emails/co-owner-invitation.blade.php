<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à rejoindre ImmoLab</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, sans-serif;
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
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .email-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
            transform: rotate(45deg);
        }

        .header-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .header-icon svg {
            width: 40px;
            height: 40px;
            color: white;
        }

        .email-header h1 {
            font-size: 32px;
            font-weight: 700;
            color: white;
            margin: 0 0 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .email-header p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 16px;
            margin: 0;
        }

        .email-content {
            padding: 40px 30px;
            background: white;
        }

        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }

        .greeting span {
            color: #70AE48;
            font-weight: 700;
        }

        .message {
            color: #475569;
            margin-bottom: 30px;
            font-size: 16px;
        }

        .info-box {
            background: linear-gradient(135deg, #f0f9e6, #e6f3da);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 30px;
            border: 2px solid rgba(112, 174, 72, 0.2);
        }

        .info-row {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }

        .info-row:last-child {
            margin-bottom: 0;
        }

        .info-icon {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #70AE48;
            box-shadow: 0 4px 8px rgba(112, 174, 72, 0.1);
        }

        .info-content {
            flex: 1;
        }

        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }

        .expiry-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #fef3c7;
            padding: 10px 20px;
            border-radius: 40px;
            margin-bottom: 25px;
            border: 1px solid #fcd34d;
        }

        .expiry-badge svg {
            width: 20px;
            height: 20px;
            color: #92400e;
        }

        .expiry-badge span {
            color: #92400e;
            font-weight: 600;
            font-size: 14px;
        }

        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .accept-button {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #70AE48 0%, #8BC34A 100%);
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 18px;
            box-shadow: 0 10px 20px -5px rgba(112, 174, 72, 0.4);
            transition: all 0.3s ease;
            border: none;
        }

        .accept-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -5px rgba(112, 174, 72, 0.5);
        }

        .button-icon {
            width: 20px;
            height: 20px;
        }

        .security-note {
            background: #f8fafc;
            border-radius: 16px;
            padding: 20px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
        }

        .security-note p {
            color: #475569;
            font-size: 14px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .security-note svg {
            color: #70AE48;
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }

        .link-box {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #64748b;
        }

        .link-label {
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer-logo {
            margin-bottom: 15px;
        }

        .footer-logo span {
            font-size: 24px;
            font-weight: 700;
            color: #70AE48;
        }

        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin: 5px 0;
        }

        .footer-copyright {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header avec dégradé -->
        <div class="email-header">

            <h1>GestiLoc</h1>
            <p>Votre solution de gestion locative</p>
        </div>

        <!-- Contenu principal -->
        <div class="email-content">
            <div class="greeting">
                Bonjour,
            </div>

            <div class="message">
                Vous avez été invité à rejoindre GestiLoc en tant que <strong>co-propriétaire</strong>.
                Vous pourrez ainsi gérer les biens qui vous seront délégués.
            </div>

            <!-- Informations de l'invitation -->
            <div class="info-box">
                <div class="info-row">
                    <div class="info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </div>
                    <div class="info-content">
                        <div class="info-label">Email</div>
                        <div class="info-value">{{ $email ?? '' }}</div>
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div class="info-content">
                        <div class="info-label">Expiration</div>
                        <div class="info-value">{{ $expiresAt ?? '7 jours' }}</div>
                    </div>
                </div>
            </div>

            <!-- Badge d'expiration -->
            <div class="expiry-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Cette invitation expire le {{ $expiresAt ?? '' }}</span>
            </div>

            <!-- Bouton d'acceptation - Redirige vers React sur le port 8080 -->
            <div class="button-container">
                <a href="{{ $acceptUrl }}" class="accept-button">
                    <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Activer mon compte
                    <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                </a>
            </div>

            <!-- Note de sécurité -->
            <div class="security-note">
                <p>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                    </svg>
                    <strong>Lien sécurisé</strong> - Ce lien est unique et personnel. Ne le partagez pas.
                </p>

            </div>

            <!-- Lien de secours -->
            <div class="link-box">
                <div class="link-label">🔗 Lien de secours (si le bouton ne fonctionne pas)</div>
                <div>{{ $acceptUrl }}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">
                <span>GestiLoc</span>
            </div>
            <div class="footer-text">
                Gérez vos biens immobiliers en toute simplicité
            </div>
            <div class="footer-copyright">
                © {{ date('Y') }} GestiLoc. Tous droits réservés.<br>
                Ce message a été envoyé à {{ $email ?? '' }}
            </div>
        </div>
    </div>
</body>
</html>
