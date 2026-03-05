<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Co-propriétaire')</title>
    <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">

    <!-- Import des icônes Lucide -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <style>
        :root {
            --gradA: #70AE48;
            --gradB: #8BC34A;
            --indigo: #70AE48;
            --violet: #8BC34A;
            --emerald: #10b981;
            --ink: #0f172a;
            --muted: #64748b;
            --muted2: #94a3b8;
            --line: rgba(15, 23, 42, .10);
            --line2: rgba(15, 23, 42, .08);
            --shadow: 0 22px 70px rgba(0, 0, 0, .18);
            --green: #84cc16;
            --green-hover: #65a30d;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            min-height: 100vh;
            background-color: white;
        }

        .app-container {
            display: flex;
            height: 100vh;
            background: white;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            width: 300px;
            flex-shrink: 0;
            background: white;
            border-right: 1px solid #e5e7eb;
        }

        .sidebar-header {
            display: flex;
            align-items: center;
            padding: 1.5rem;
            height: 64px;
            border-bottom: 1px solid #e5e7eb;
            background: #70AE48;
        }

        .sidebar-header h1 {
            font-size: 1.25rem;
            font-weight: bold;
            color: white;
        }

        .sidebar-nav {
            flex: 1;
            padding: 1.25rem 1.25rem 0;
            overflow-y: auto;
        }

        .menu-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            border-radius: 1rem;
            border: 1px solid transparent;
            transition: all 0.2s;
            cursor: pointer;
            background: transparent;
            color: #374151;
            white-space: nowrap;
        }

        .menu-item:hover {
            background: #f0f9e6;
            color: #70AE48;
            border-color: #d4edc9;
        }

        .menu-item.active {
            background: linear-gradient(to right, #70AE48, #8BC34A);
            color: white;
            box-shadow: 0 10px 15px -3px rgba(112, 174, 72, 0.3);
        }

        .menu-item-content {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            white-space: nowrap;
        }

        .sidebar-footer {
            padding: 1.25rem;
            border-top: 1px solid #e5e7eb;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .user-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 9999px;
            background: linear-gradient(to right, #70AE48, #8BC34A);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.875rem;
            font-weight: bold;
        }

        .user-info {
            flex: 1;
        }

        .user-name {
            font-size: 0.875rem;
            font-weight: 600;
            color: #111827;
        }

        .user-role {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .top-bar {
            height: 64px;
            background: #70AE48;
            border-bottom: none;
            display: flex;
            align-items: center;
            padding: 0 1.5rem;
        }

        .page-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
        }

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-left: auto;
        }

        .top-bar-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            white-space: nowrap;
            backdrop-filter: blur(10px);
        }

        .top-bar-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
        }

        .top-bar-btn i {
            width: 18px;
            height: 18px;
        }

        .logout-btn {
            padding: 0.5rem;
            border-radius: 9999px;
            color: #9ca3af;
            transition: all 0.2s;
            cursor: pointer;
            background: transparent;
            border: none;
        }

        .logout-btn:hover {
            color: #4b5563;
            background: #f3f4f6;
        }

        .main-content {
            flex: 1;
            overflow-y: auto;
            background: white;
        }

        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                left: -100%;
                top: 0;
                height: 100vh;
                z-index: 50;
                transition: left 0.3s ease;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                width: 280px;
            }

            .sidebar.active {
                left: 0;
            }

            .overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 40;
                display: none;
            }

            .overlay.active {
                display: block;
            }

            .mobile-menu-btn {
                display: block !important;
                background: rgba(255, 255, 255, 0.2) !important;
                color: white !important;
                padding: 0.625rem !important;
            }

            .mobile-menu-btn:hover {
                background: rgba(255, 255, 255, 0.3) !important;
            }

            .top-bar-btn span {
                display: none;
            }

            .top-bar-btn {
                padding: 0.625rem 0.875rem;
            }
        }

        .form-container {
            min-height: 100vh;
            background: #ffffff;
            padding: 2rem;
            position: relative;
        }

        .form-container::before {
            content: "";
            position: fixed;
            inset: 0;
            background:
                radial-gradient(900px 520px at 12% -8%, rgba(112, 174, 72, .16) 0%, rgba(112, 174, 72, 0) 62%),
                radial-gradient(900px 520px at 92% 8%, rgba(139, 195, 74, .14) 0%, rgba(139, 195, 74, 0) 64%),
                radial-gradient(700px 420px at 40% 110%, rgba(16, 185, 129, .10) 0%, rgba(16, 185, 129, 0) 60%);
            pointer-events: none;
            z-index: -2;
        }

        .form-card {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, .92);
            border-radius: 22px;
            box-shadow: var(--shadow);
            overflow: hidden;
            border: 1px solid rgba(112, 174, 72, .18);
            position: relative;
            backdrop-filter: blur(10px);
        }

        .form-header {
            background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
            padding: 2.5rem;
            color: white;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }

        .form-body {
            padding: 2.5rem;
            position: relative;
            z-index: 1;
        }

        .section {
            margin-bottom: 2.5rem;
            background: rgba(255, 255, 255, .72);
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid rgba(17, 24, 39, .08);
            box-shadow: 0 10px 30px rgba(17, 24, 39, .06);
            backdrop-filter: blur(10px);
        }

        .form-grid {
            display: grid;
            gap: 1.25rem;
        }

        .form-grid-2 {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-label {
            font-size: 0.85rem;
            font-weight: 900;
            color: #334155;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }

        .required {
            color: #e11d48;
        }

        .form-input,
        .form-select,
        .form-textarea {
            width: 100%;
            padding: 0.85rem 1rem;
            border: 2px solid rgba(148, 163, 184, .35);
            border-radius: 12px;
            font-size: 1rem;
            color: var(--ink);
            background: rgba(255, 255, 255, .92);
            transition: all 0.2s ease;
            font-family: inherit;
            font-weight: 700;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
            outline: none;
            border-color: rgba(112, 174, 72, .75);
            box-shadow: 0 0 0 4px rgba(112, 174, 72, 0.14);
        }

        .input-error {
            border-color: rgba(225, 29, 72, .72) !important;
            box-shadow: 0 0 0 4px rgba(225, 29, 72, .10) !important;
        }

        .field-error {
            display: flex;
            gap: 8px;
            align-items: flex-start;
            color: #be123c;
            font-weight: 900;
            font-size: .8rem;
            line-height: 1.2;
            margin-top: 2px;
        }

        .button {
            padding: 0.9rem 1.35rem;
            border-radius: 14px;
            font-weight: 950;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-family: inherit;
            white-space: nowrap;
            text-decoration: none;
        }

        .button-primary {
            background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
            color: #fff;
            box-shadow: 0 14px 30px rgba(112, 174, 72, .22);
        }

        .button-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 18px 34px rgba(112, 174, 72, .28);
        }

        .button-secondary {
            background: rgba(255, 255, 255, .92);
            color: #70AE48;
            border: 2px solid rgba(112, 174, 72, .20);
        }

        .button-secondary:hover {
            background: rgba(112, 174, 72, .06);
        }

        .button-danger {
            background: rgba(255, 255, 255, .92);
            color: #e11d48;
            border: 2px solid rgba(225, 29, 72, .18);
        }

        .button-danger:hover {
            background: rgba(225, 29, 72, .06);
        }

        .top-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .top-actions-right {
            display: flex;
            gap: .75rem;
            flex-wrap: wrap;
        }

        .bottom-actions {
            display: flex;
            justify-content: flex-end;
            gap: .75rem;
            padding-top: 1.5rem;
            border-top: 2px solid rgba(148, 163, 184, .35);
            flex-wrap: wrap;
        }

        .alert-box {
            border-radius: 14px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
            border: 1px solid;
            font-weight: 850;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .alert-info {
            background: rgba(240, 249, 235, .92);
            border-color: rgba(112, 174, 72, .30);
            color: #2e5e1e;
        }

        .alert-warning {
            background: rgba(254, 252, 232, .92);
            border-color: rgba(245, 158, 11, .30);
            color: #92400e;
        }

        .alert-error {
            background: rgba(254, 242, 242, .92);
            border-color: rgba(248, 113, 113, .30);
            color: #991b1b;
        }

        .alert-success {
            background: rgba(240, 253, 244, .92);
            border-color: rgba(74, 222, 128, .30);
            color: #166534;
        }

        .empty-state {
            text-align: center;
            padding: 2.5rem;
            border: 2px dashed rgba(148, 163, 184, .35);
            border-radius: 16px;
            background: rgba(255, 255, 255, .72);
        }

        .nav-emoji {
            margin-right: 8px;
            font-size: 1.1em;
            min-width: 24px;
            text-align: center;
        }

        .menu-group {
            margin-bottom: 1.5rem;
        }

        .menu-group-title {
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 0.75rem;
            padding-left: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    </style>
</head>

<body>
    <div class="overlay" id="overlay"></div>

    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h1>GestiLoc</h1>
            </div>

            <nav class="sidebar-nav">
                <!-- Menu principal -->
                <div class="menu-group">
                    <div class="menu-group-title">Menu principal</div>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/dashboard')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📊</span>
                            <span>Tableau de bord</span>
                        </div>
                    </button>
                </div>

                <!-- GESTIONS DES BIENS -->
                <div class="menu-group">
                    <div class="menu-group-title">GESTIONS DES BIENS</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/biens/create')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">+</span>
                            <span>Ajouter un bien</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/biens')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">🏠</span>
                            <span>Mes biens</span>
                        </div>
                    </button>
                </div>

                <!-- GESTION LOCATIVE -->
                <div class="menu-group">
                    <div class="menu-group-title">GESTION LOCATIVE</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/assign-property/create')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">🔑</span>
                            <span>Nouvelle location</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/tenants/create')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📍</span>
                            <span>Ajouter un locataire</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/tenants')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📄</span>
                            <span>Liste des locataires</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/paiements')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📅</span>
                            <span>Gestion des paiements</span>
                        </div>
                    </button>
                </div>

                <!-- DOCUMENTS -->
                <div class="menu-group">
                    <div class="menu-group-title">DOCUMENTS</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/leases')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📄</span>
                            <span>Contrats de bail</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/etats-des-lieux')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📄</span>
                            <span>Etats de lieux</span>
                        </div>
                    </button>

                    <button class="menu-item" onclick="navigateTo('/coproprietaire/notices')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📄</span>
                            <span>Avis d'échéance</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/quittances')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📄</span>
                            <span>Quittances de loyers</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/factures')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📄</span>
                            <span>Factures et documents divers</span>
                        </div>
                    </button>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/documents')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📄</span>
                            <span>Archivage de documents</span>
                        </div>
                    </button>
                </div>

                <!-- REPARATIONS ET TRAVAUX -->
                <div class="menu-group">
                    <div class="menu-group-title">REPARATIONS ET TRAVAUX</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/maintenance')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">✂️</span>
                            <span>Réparations et travaux</span>
                        </div>
                    </button>
                </div>

                <!-- COMPTABILITE ET STATISTIQUES -->
                <div class="menu-group">
                    <div class="menu-group-title">COMPTABILITE ET STATISTIQUES</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/comptabilite')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">💼</span>
                            <span>Comptabilité et statistiques</span>
                        </div>
                    </button>
                </div>

                <!-- CONFIGURATION -->
                <div class="menu-group">
                    <div class="menu-group-title">CONFIGURATION</div>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/parametres')">
                        <div class="menu-item-content">
                            <span class="nav-emoji">📜</span>
                            <span>Paramètres</span>
                        </div>
                    </button>


                </div>
            </nav>

            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar">
                        <?php
                        $user = auth()->user();
                        $initials = 'C';
                        if ($user) {
                            $name = $user->name ?? '';
                            $email = $user->email ?? '';
                            if ($name) {
                                $initials = strtoupper(substr($name, 0, 1));
                            } elseif ($email) {
                                $initials = strtoupper(substr($email, 0, 1));
                            }
                        }
                        echo $initials;
                        ?>
                    </div>
                    <div class="user-info">
                        <div class="user-name">
                            <?php
                            if ($user) {
                                echo e($user->name ?? 'Co-propriétaire');
                            } else {
                                echo 'Co-propriétaire';
                            }
                            ?>
                        </div>
                        <div class="user-role">Co-propriétaire</div>
                    </div>
                    <button class="logout-btn" title="Déconnexion" onclick="logout()">
                        <i data-lucide="log-out"></i>
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="main-content">
            <!-- Top bar -->
            <div class="top-bar">
                <h1 class="page-title">@yield('title', 'Co-propriétaire')</h1>
                <div class="top-bar-actions">
                    <button class="top-bar-btn" onclick="goToReact('/coproprietaire/notifications')" title="Notifications">
                        <i data-lucide="bell"></i>
                        <span>Notifications</span>
                    </button>
                    <button class="top-bar-btn" onclick="goToReact('/coproprietaire/aide')" title="Aide">
                        <i data-lucide="help-circle"></i>
                        <span>Aide</span>
                    </button>
                    <button class="top-bar-btn" onclick="goToReact('/coproprietaire/parametres')" title="Mon compte">
                        <i data-lucide="user"></i>
                        <span>Mon compte</span>
                    </button>
                    <button class="mobile-menu-btn" onclick="toggleSidebar()" style="display: none;">
                        <i data-lucide="menu"></i>
                    </button>
                </div>
            </div>

            <!-- Content spécifique à chaque page -->
            @yield('content')
        </div>
    </div>

    <script>
        // Configuration des URLs
        const CONFIG = {
            LARAVEL_URL: 'http://localhost:8000',
            REACT_URL: 'http://localhost:8080',
            LOGIN_URL: '/login',
            LOGOUT_URL: '/logout'
        };

        // Initialiser les icônes
        lucide.createIcons();

        // Fonction pour récupérer le token depuis TOUTES les sources
        function getTokenFromAllSources() {
            console.log('🔍 Recherche du token dans toutes les sources...');

            // 1. LocalStorage (principal)
            let token = localStorage.getItem('token');
            if (token) {
                console.log('✅ Token trouvé dans localStorage');
                return token;
            }

            // 2. URL (api_token)
            const urlParams = new URLSearchParams(window.location.search);
            token = urlParams.get('api_token');
            if (token) {
                console.log('✅ Token trouvé dans URL');
                localStorage.setItem('token', token); // Sauvegarder
                return token;
            }

            // 3. Cookies
            token = getCookie('laravel_token') || getCookie('token');
            if (token) {
                console.log('✅ Token trouvé dans cookies');
                localStorage.setItem('token', token);
                return token;
            }

            // 4. SessionStorage (fallback)
            token = sessionStorage.getItem('token');
            if (token) {
                console.log('✅ Token trouvé dans sessionStorage');
                return token;
            }

            console.log('❌ Aucun token trouvé');
            return null;
        }

        // Fonction pour récupérer un cookie
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }

        // Fonction pour extraire le token de l'URL et nettoyer
        function extractTokenFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('api_token');

            if (token) {
                console.log('🔄 Extraction du token depuis URL');
                localStorage.setItem('token', token);

                // Nettoyer l'URL
                urlParams.delete('api_token');
                const newUrl = window.location.pathname +
                    (urlParams.toString() ? '?' + urlParams.toString() : '') +
                    window.location.hash;
                window.history.replaceState({}, '', newUrl);

                return token;
            }
            return null;
        }

        // Fonction pour naviguer vers React
        function goToReact(path) {
            console.log('🚀 Navigation vers React:', path);

            let token = getTokenFromAllSources();

            // Si pas de token, essayer d'extraire de l'URL actuelle
            if (!token) {
                token = extractTokenFromUrl();
            }

            if (!token) {
                console.error('❌ ERREUR: Pas de token pour React');
                alert('Session expirée. Redirection vers la page de connexion...');
                setTimeout(() => {
                    window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGIN_URL;
                }, 500);
                return;
            }

            // Construire l'URL React avec token
            let fullUrl = CONFIG.REACT_URL + path;
            const separator = fullUrl.includes('?') ? '&' : '?';
            const timestamp = Date.now();

            fullUrl += `${separator}api_token=${encodeURIComponent(token)}&_t=${timestamp}`;

            console.log('✅ URL React générée:', fullUrl);

            // Redirection
            setTimeout(() => {
                window.location.href = fullUrl;
            }, 100);
        }

        // Fonction pour naviguer vers Laravel
        function navigateTo(path) {
            console.log('🚀 Navigation vers Laravel:', path);

            let token = getTokenFromAllSources();

            // Si pas de token, essayer d'extraire de l'URL actuelle
            if (!token) {
                token = extractTokenFromUrl();
            }

            if (!token) {
                console.error('❌ ERREUR: Pas de token pour Laravel');
                alert('Session expirée. Redirection vers la page de connexion...');
                setTimeout(() => {
                    window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGIN_URL;
                }, 500);
                return;
            }

            // Construire l'URL Laravel avec token
            let fullUrl = CONFIG.LARAVEL_URL + path;
            const separator = fullUrl.includes('?') ? '&' : '?';
            const timestamp = Date.now();

            fullUrl += `${separator}api_token=${encodeURIComponent(token)}&_t=${timestamp}`;

            console.log('✅ URL Laravel générée:', fullUrl);

            // Redirection
            setTimeout(() => {
                window.location.href = fullUrl;
            }, 100);
        }

        // Helper pour récupérer un paramètre d'URL
        function getUrlParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        // Gestion de la sidebar mobile
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');

            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        document.getElementById('overlay').addEventListener('click', toggleSidebar);

        // Logout
        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                // Nettoyer tous les stockages
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');

                // Rediriger vers la déconnexion Laravel
                window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGOUT_URL;
            }
        }

        // Vérifier l'authentification au chargement
        function checkAuthOnLoad() {
            console.log('🔐 Vérification de l\'authentification...');

            // Ne pas vérifier sur la page de login
            if (window.location.href.includes('/login')) {
                console.log('📋 Page de login, pas de vérification nécessaire');
                return;
            }

            const token = getTokenFromAllSources();

            if (!token) {
                console.warn('⚠️ Aucun token trouvé, vérification de la session Laravel...');

                // Essayer d'extraire le token de l'URL une dernière fois
                const urlToken = extractTokenFromUrl();
                if (!urlToken) {
                    console.error('❌ ERREUR CRITIQUE: Aucune authentification trouvée');

                    // Attendre un peu puis rediriger
                    setTimeout(() => {
                        if (!window.location.href.includes('/login')) {
                            alert('Votre session a expiré. Veuillez vous reconnecter.');
                            window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGIN_URL;
                        }
                    }, 1000);
                }
            } else {
                console.log('✅ Authentification vérifiée avec succès');
            }
        }

        // Marquer le menu actif
        function markActiveMenu() {
            const currentPath = window.location.pathname;

            document.querySelectorAll('.menu-item').forEach(item => {
                const onclick = item.getAttribute('onclick');
                if (onclick) {
                    const pathMatch = onclick.match(/navigateTo\('([^']+)'\)/) ||
                                    onclick.match(/goToReact\('([^']+)'\)/);

                    if (pathMatch && pathMatch[1]) {
                        const menuPath = pathMatch[1];
                        if (currentPath.includes(menuPath.replace('/coproprietaire/', ''))) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    }
                }
            });
        }

        // Au chargement
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 Layout Laravel chargé');

            // Extraire le token de l'URL si présent
            extractTokenFromUrl();

            // Vérifier l'authentification
            checkAuthOnLoad();

            // Marquer le menu actif
            markActiveMenu();

            // Gestion responsive
            checkMobile();

            // Vérifier périodiquement
            setInterval(checkAuthOnLoad, 60000); // Toutes les minutes
        });

        // Gestion responsive
        function checkMobile() {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (window.innerWidth <= 768) {
                mobileBtn.style.display = 'block';
            } else {
                mobileBtn.style.display = 'none';
            }
        }

        window.addEventListener('resize', checkMobile);
    </script>
</body>
</html>
