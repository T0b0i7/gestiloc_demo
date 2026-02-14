<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liste des Locataires - Co-propriétaire</title>
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">

    <!-- Import des icônes Lucide -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <style>
        :root {
            --gradA: #667eea;
            --gradB: #764ba2;
            --indigo: #4f46e5;
            --violet: #7c3aed;
            --emerald: #10b981;
            --ink: #0f172a;
            --muted: #64748b;
            --muted2: #94a3b8;
            --line: rgba(15,23,42,.10);
            --line2: rgba(15,23,42,.08);
            --shadow: 0 22px 70px rgba(0,0,0,.18);
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

        /* Layout principal identique */
        .app-container {
            display: flex;
            height: 100vh;
            background: white;
        }

        /* Sidebar identique */
        .sidebar {
            display: flex;
            flex-direction: column;
            width: 256px;
            flex-shrink: 0;
            background: white;
            border-right: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            height: 64px;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(to right, #f0f9ff, white);
        }

        .sidebar-header h1 {
            font-size: 1.25rem;
            font-weight: bold;
            background: linear-gradient(to right, #4f46e5, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .sidebar-nav {
            flex: 1;
            padding: 1.5rem 1rem;
            overflow-y: auto;
            background: white;
        }

        .menu-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 1rem;
            border: 1px solid transparent;
            transition: all 0.2s;
            cursor: pointer;
            background: transparent;
            color: #374151;
        }

        .menu-item:hover {
            background: #eff6ff;
            color: #2563eb;
            border-color: #dbeafe;
        }

        .menu-item.active {
            background: linear-gradient(to right, #2563eb, #3b82f6);
            color: white;
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }

        .menu-item-content {
            display: flex;
            align-items: center;
            gap: 0.875rem;
        }

        .menu-item-icon {
            width: 20px;
            height: 20px;
        }

        .menu-item-chevron {
            width: 16px;
            height: 16px;
            transition: transform 0.2s;
        }

        .menu-item.has-submenu.active .menu-item-chevron {
            transform: rotate(180deg);
        }

        .submenu {
            padding-left: 2rem;
        }

        .submenu-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
            border-radius: 0.75rem;
            border: 1px solid transparent;
            transition: all 0.2s;
            cursor: pointer;
            background: transparent;
            color: #374151;
        }

        .submenu-item:hover {
            background: #f3f4f6;
            color: #2563eb;
        }

        .submenu-item.active {
            background: linear-gradient(to right, #2563eb, #3b82f6);
            color: white;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }

        .laravel-badge {
            margin-left: 0.5rem;
            background: #dcfce7;
            color: #166534;
            font-size: 0.75rem;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
        }

        .sidebar-footer {
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            background: linear-gradient(to right, #f0f9ff/50, white);
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
            background: linear-gradient(to right, #3b82f6, #2563eb);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.875rem;
            font-weight: bold;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
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

        /* Top bar identique */
        .top-bar {
            display: flex;
            flex-shrink: 0;
            height: 64px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .mobile-menu-btn {
            padding: 1rem;
            border-right: 1px solid #e5e7eb;
            color: #6b7280;
            display: none;
        }

        .top-bar-content {
            flex: 1;
            padding: 0 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .page-title {
            font-size: 1.5rem;
            font-weight: bold;
            background: linear-gradient(to right, #111827, #374151);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .theme-toggle, .logout-btn {
            padding: 0.5rem;
            border-radius: 9999px;
            color: #9ca3af;
            transition: all 0.2s;
            cursor: pointer;
            background: transparent;
            border: none;
        }

        .theme-toggle:hover, .logout-btn:hover {
            color: #4b5563;
            background: #f3f4f6;
        }

        /* Main content */
        .main-content {
            flex: 1;
            overflow-y: auto;
            background: white;
        }

        .content-container {
            padding: 1.5rem;
            max-width: 84rem;
            margin: 0 auto;
        }

        /* Container principal */
        .dashboard-container {
            min-height: 100vh;
            background: #ffffff;
            padding: 2rem;
            position: relative;
        }

        .dashboard-container::before {
            content: "";
            position: fixed;
            inset: 0;
            background:
                radial-gradient(900px 520px at 12% -8%, rgba(102,126,234,.16) 0%, rgba(102,126,234,0) 62%),
                radial-gradient(900px 520px at 92% 8%, rgba(118,75,162,.14) 0%, rgba(118,75,162,0) 64%),
                radial-gradient(700px 420px at 40% 110%, rgba(16,185,129,.10) 0%, rgba(16,185,129,0) 60%);
            pointer-events: none;
            z-index: -2;
        }

        .dashboard-card {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255,255,255,.92);
            border-radius: 22px;
            box-shadow: var(--shadow);
            overflow: hidden;
            border: 1px solid rgba(102,126,234,.18);
            position: relative;
            backdrop-filter: blur(10px);
        }

        .dashboard-card::before {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
                radial-gradient(circle at 14% 18%, rgba(102,126,234,.10), rgba(102,126,234,0) 58%),
                radial-gradient(circle at 88% 30%, rgba(118,75,162,.10), rgba(118,75,162,0) 58%),
                radial-gradient(circle at 50% 95%, rgba(16,185,129,.08), rgba(16,185,129,0) 55%);
            z-index: 0;
        }

        .dashboard-header {
            background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
            padding: 2.5rem;
            color: white;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }

        .header-art {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
        }

        .header-art .blob {
            position: absolute;
            right: -180px;
            top: -210px;
            width: 640px;
            height: 640px;
            opacity: .95;
            filter: drop-shadow(0 18px 44px rgba(0,0,0,.18));
        }

        .header-art .ring {
            position: absolute;
            left: -140px;
            bottom: -180px;
            width: 520px;
            height: 520px;
            opacity: .55;
        }

        .dashboard-header h1 {
            font-size: 2rem;
            font-weight: 900;
            margin: 0 0 0.6rem 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            letter-spacing: -0.02em;
            position: relative;
            z-index: 1;
        }

        .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
            position: relative;
            z-index: 1;
        }

        .dashboard-header p {
            margin: 0;
            opacity: 0.94;
            font-size: 1rem;
            font-weight: 650;
            position: relative;
            z-index: 1;
            max-width: 72ch;
        }

        .badge-row {
            display: flex;
            gap: .6rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .pill {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            padding: .5rem .75rem;
            border-radius: 999px;
            background: rgba(255,255,255,.14);
            border: 1px solid rgba(255,255,255,.18);
            backdrop-filter: blur(10px);
            font-weight: 850;
            font-size: .82rem;
            white-space: nowrap;
        }

        .dashboard-body {
            padding: 2.5rem;
            position: relative;
            z-index: 1;
        }

        /* Section styles */
        .section {
            margin-bottom: 2.5rem;
            background: rgba(255,255,255,.72);
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid rgba(17,24,39,.08);
            box-shadow: 0 10px 30px rgba(17,24,39,.06);
            backdrop-filter: blur(10px);
        }

        .section-title {
            font-size: 1.2rem;
            font-weight: 950;
            color: var(--ink);
            margin: 0 0 1.25rem 0;
            padding-bottom: 0.85rem;
            border-bottom: 2px solid rgba(102,126,234,.28);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.6rem;
            letter-spacing: -0.01em;
        }

        /* Info box */
        .info-box {
            background: rgba(236,253,245,.92);
            border: 1px solid rgba(16,185,129,.30);
            border-left: 4px solid var(--emerald);
            padding: 1.25rem;
            margin: 0 0 2rem 0;
            border-radius: 14px;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            backdrop-filter: blur(10px);
        }

        .error-box {
            background: rgba(254,226,226,.92);
            border: 1px solid rgba(239,68,68,.30);
            border-left: 4px solid #ef4444;
            padding: 1.25rem;
            margin: 0 0 2rem 0;
            border-radius: 14px;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            backdrop-filter: blur(10px);
        }

        /* Actions */
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .action-card {
            background: white;
            border: 1px solid rgba(17,24,39,.08);
            border-radius: 14px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.2s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
        }

        .action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 35px rgba(17,24,39,.08);
            border-color: rgba(102,126,234,.35);
        }

        .action-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.25rem;
        }

        .action-icon.primary {
            background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
        }

        .action-icon.success {
            background: linear-gradient(135deg, var(--emerald) 0%, #059669 100%);
        }

        .action-icon.secondary {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        }

        .action-title {
            font-size: 1rem;
            font-weight: 900;
            color: var(--ink);
            margin: 0;
        }

        .action-description {
            font-size: 0.85rem;
            color: var(--muted);
            margin: 0;
        }

        /* Session info */
        .session-info {
            background: rgba(248,250,252,.92);
            border: 1px solid rgba(17,24,39,.08);
            border-radius: 14px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        .session-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.25rem;
            margin-top: 1rem;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .info-label {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--muted);
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }

        .info-value {
            font-size: 1rem;
            font-weight: 700;
            color: var(--ink);
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            font-weight: 850;
            font-size: 0.78rem;
        }

        .badge-success {
            background: rgba(16,185,129,.12);
            color: #065f46;
            border: 1px solid rgba(16,185,129,.18);
        }

        .badge-warning {
            background: rgba(245,158,11,.12);
            color: #854d0e;
            border: 1px solid rgba(245,158,11,.18);
        }

        /* Button styles */
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

        .button:disabled {
            opacity: .65;
            cursor: not-allowed;
        }

        .button-primary {
            background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
            color: #fff;
            box-shadow: 0 14px 30px rgba(79,70,229,.22);
        }

        .button-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 18px 34px rgba(79,70,229,.28);
        }

        .button-secondary {
            background: rgba(255,255,255,.92);
            color: #4338ca;
            border: 2px solid rgba(67,56,202,.20);
        }

        .button-secondary:hover {
            background: rgba(67,56,202,.06);
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

        /* Mobile styles */
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block;
            }

            .sidebar {
                position: fixed;
                left: -100%;
                top: 0;
                height: 100vh;
                z-index: 50;
                transition: left 0.3s ease;
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

            .dashboard-container {
                padding: 1rem;
            }

            .dashboard-header {
                padding: 1.5rem;
            }

            .dashboard-header h1 {
                font-size: 1.5rem;
            }

            .dashboard-body {
                padding: 1.25rem;
            }

            .section {
                padding: 1.25rem;
            }

            .actions-grid {
                grid-template-columns: 1fr;
            }

            .top-actions, .top-actions-right {
                width: 100%;
            }

            .button {
                flex: 1;
                justify-content: center;
            }

            .session-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <!-- Overlay pour mobile -->
    <div class="overlay" id="overlay"></div>

    <div class="app-container">
        <!-- Sidebar identique -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h1>GestiLoc</h1>
            </div>

            <nav class="sidebar-nav">
                <!-- Tableau de bord -->
                <button class="menu-item" onclick="goToReact('/coproprietaire/dashboard')">
                    <div class="menu-item-content">
                        <i data-lucide="layout-dashboard"></i>
                        <span>Tableau de bord</span>
                    </div>
                </button>

                <!-- Gestion des Biens -->
                <div class="menu-item has-submenu" onclick="toggleSubmenu('biens-menu')">
                    <div class="menu-item-content">
                        <i data-lucide="building"></i>
                        <span>Gestion des Biens</span>
                    </div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="submenu" id="biens-menu" style="display: none;">
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/biens')">
                        <span>Mes biens délégués</span>

                    </button>
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/delegations')">
                        <span>Délégations reçues</span>

                    </button>
                </div>

                <!-- Gestion Locative -->
                <div class="menu-item has-submenu" onclick="toggleSubmenu('locative-menu')">
                    <div class="menu-item-content">
                        <i data-lucide="file-signature"></i>
                        <span>Gestion Locative</span>
                    </div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="submenu" id="locative-menu" style="display: none;">
                    <!-- Laravel routes -->
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/tenants')">
                        <span>Liste des locataires</span>

                    </button>
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/tenants/create')">
                        <span>Créer un locataire</span>

                    </button>
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/assign-property/create')">
                        <span>Assigner un bien</span>

                    </button>
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/leases')">
                        <span>Contrats de bail</span>

                    </button>
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/quittances')">
                        <span>Quittances de loyer</span>

                    </button>
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/notices')">
                        <span>Préavis</span>

                    </button>
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/maintenance')">
                        <span>Demandes de maintenance</span>

                    </button>
                    <!-- React route -->
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/baux')">
                        <span>Baux en cours</span>

                    </button>
                </div>

                <!-- Documents -->
                <div class="menu-item has-submenu" onclick="toggleSubmenu('documents-menu')">
                    <div class="menu-item-content">
                        <i data-lucide="file-text"></i>
                        <span>Documents</span>
                    </div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="submenu" id="documents-menu" style="display: none;">
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/documents')">
                        <span>Mes documents</span>

                    </button>
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/finances')">
                        <span>Finances</span>

                    </button>
                    <!-- Laravel lease documents -->
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/leases')">
                        <span>Documents de bail</span>

                    </button>
                </div>

                <!-- Profil -->
                <div class="menu-item has-submenu" onclick="toggleSubmenu('profile-menu')">
                    <div class="menu-item-content">
                        <i data-lucide="user"></i>
                        <span>Profil & Paramètres</span>
                    </div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="submenu" id="profile-menu" style="display: none;">
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/profile')">
                        <span>Mon profil</span>

                    </button>
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/parametres')">
                        <span>Paramètres</span>

                    </button>
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/audit')">
                        <span>Journal d'audit</span>

                    </button>
                </div>



                <!-- Finances -->
                <div class="menu-item has-submenu" onclick="toggleSubmenu('finances-menu')">
                    <div class="menu-item-content">
                        <i data-lucide="credit-card"></i>
                        <span>Finances</span>
                    </div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="submenu" id="finances-menu" style="display: none;">
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/emettre-paiement')">
                        <span>Émettre un paiement</span>

                    </button>
                    <button class="submenu-item" onclick="goToReact('/coproprietaire/retrait-methode')">
                        <span>Méthode de retrait</span>

                    </button>
                    <!-- Laravel finances -->
                    <button class="submenu-item" onclick="navigateTo('/coproprietaire/quittances')">
                        <span>Gestion des quittances</span>

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
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="main-content">
            <!-- Top bar -->
            <header class="top-bar">
                <button class="mobile-menu-btn" onclick="toggleSidebar()">
                    <i data-lucide="menu"></i>
                </button>
                <div class="top-bar-content">
                    <h1 class="page-title">Liste des locataires</h1>
                    <div class="top-bar-actions">
                        <button class="theme-toggle" title="Changer le thème">
                            <i data-lucide="sun"></i>
                        </button>
                        <button class="logout-btn" title="Déconnexion" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Contenu -->
            <div class="dashboard-container">
                <div class="dashboard-card">
                    <div class="dashboard-header">
                        <div class="header-art" aria-hidden="true">
                            <svg class="blob" viewBox="0 0 600 600" fill="none">
                                <defs>
                                    <linearGradient id="h1" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0" stopColor="rgba(255,255,255,.65)" />
                                        <stop offset="1" stopColor="rgba(255,255,255,.08)" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M420 70C500 110 560 190 560 290C560 420 460 520 320 540C190 560 70 490 50 360C30 240 110 140 240 90C310 62 360 44 420 70Z"
                                    fill="url(#h1)"
                                    opacity="0.65"
                                />
                                <path
                                    d="M455 140C505 175 530 235 520 295C505 390 410 450 320 460C230 470 150 420 130 340C110 260 155 190 235 150C315 110 395 105 455 140Z"
                                    fill="rgba(255,255,255,.10)"
                                />
                            </svg>

                            <svg class="ring" viewBox="0 0 500 500" fill="none">
                                <defs>
                                    <radialGradient
                                        id="h2"
                                        cx="0"
                                        cy="0"
                                        r="1"
                                        gradientUnits="userSpaceOnUse"
                                        gradientTransform="translate(220 210) rotate(45) scale(240)"
                                    >
                                        <stop stopColor="rgba(255,255,255,.34)" />
                                        <stop offset="1" stopColor="rgba(255,255,255,0)" />
                                    </radialGradient>
                                </defs>
                                <circle cx="240" cy="240" r="210" fill="url(#h2)" />
                            </svg>
                        </div>

                        <div class="header-row">
                            <div>
                                <h1>
                                    <i data-lucide="users" style="width: 32px; height: 32px;"></i>
                                    Gestion des locataires
                                </h1>
                                <p>Consultez et gérez tous les locataires de vos biens délégués</p>
                            </div>

                            <div class="badge-row">
                                <span class="pill">
                                    <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i>
                                    Interface moderne
                                </span>
                                <span class="pill">
                                    <i data-lucide="database" style="width: 16px; height: 16px;"></i>
                                    Données Laravel
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-body">
                        <div class="top-actions">
                            <a href="#" class="button button-secondary" onclick="goToReact('/coproprietaire/dashboard'); return false;">
                                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                Retour au tableau de bord
                            </a>
                            <div class="top-actions-right">
                                <a href="{{ route('co-owner.tenants.create') }}" class="button button-primary">
                                    <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
                                    Créer un locataire
                                </a>
                            </div>
                        </div>

                        @if(auth()->check())
                            <div class="info-box">
                                <i data-lucide="check-circle" style="width: 20px; height: 20px; color: var(--emerald); flex-shrink: 0;"></i>
                                <div>
                                    <strong style="color: var(--ink);">✅ Page Laravel fonctionnelle !</strong>
                                    <p style="color: var(--muted); margin: 0.25rem 0 0 0; font-size: 0.9rem;">
                                        Cette page est servie par Laravel Blade avec authentification complète.
                                    </p>
                                </div>
                            </div>
                        @else
                            <div class="error-box">
                                <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #ef4444; flex-shrink: 0;"></i>
                                <div>
                                    <strong style="color: var(--ink);">⚠️ Non authentifié</strong>
                                    <p style="color: var(--muted); margin: 0.25rem 0 0 0; font-size: 0.9rem;">
                                        Vous devez être connecté pour accéder à cette page.
                                    </p>
                                    <a href="{{ route('login') }}" class="button" style="margin-top: 0.75rem; background: rgba(239,68,68,.12); color: #dc2626; border-color: rgba(239,68,68,.25);">
                                        <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
                                        Se connecter
                                    </a>
                                </div>
                            </div>
                        @endif

                        @if(auth()->check())
                            <div class="section">
                                <h2 class="section-title">
                                    <i data-lucide="zap" style="width: 20px; height: 20px;"></i>
                                    Actions rapides
                                    <span class="badge badge-success">
                                        {{ $tenants->count() ?? 0 }} locataire(s)
                                    </span>
                                </h2>

                                <div class="actions-grid">
                                    <a href="{{ route('co-owner.tenants.create') }}" class="action-card">
                                        <div class="action-icon success">
                                            <i data-lucide="user-plus" style="width: 24px; height: 24px;"></i>
                                        </div>
                                        <h3 class="action-title">Créer un locataire</h3>
                                        <p class="action-description">Ajouter un nouveau locataire à votre portefeuille</p>
                                    </a>

                                    <a href="#" onclick="goToReact('/coproprietaire/dashboard'); return false;" class="action-card">
                                        <div class="action-icon secondary">
                                            <i data-lucide="layout-dashboard" style="width: 24px; height: 24px;"></i>
                                        </div>
                                        <h3 class="action-title">Tableau de bord React</h3>
                                        <p class="action-description">Retourner à l'interface principale</p>
                                    </a>

                                    <a href="#" onclick="goToReact('/coproprietaire/baux'); return false;" class="action-card">
                                        <div class="action-icon primary">
                                            <i data-lucide="file-signature" style="width: 24px; height: 24px;"></i>
                                        </div>
                                        <h3 class="action-title">Baux en cours</h3>
                                        <p class="action-description">Gérer les contrats de location</p>
                                    </a>

                                    <a href="#" onclick="goToReact('/coproprietaire/quittances'); return false;" class="action-card">
                                        <div class="action-icon primary">
                                            <i data-lucide="receipt" style="width: 24px; height: 24px;"></i>
                                        </div>
                                        <h3 class="action-title">Quittances</h3>
                                        <p class="action-description">Éditer et suivre les paiements</p>
                                    </a>
                                </div>
                            </div>

                            <div class="session-info">
                                <h2 class="section-title">
                                    <i data-lucide="user-check" style="width: 20px; height: 20px;"></i>
                                    Session utilisateur
                                </h2>

                                <div class="session-grid">
                                    <div class="info-item">
                                        <span class="info-label">
                                            <i data-lucide="mail" style="width: 14px; height: 14px;"></i>
                                            Email
                                        </span>
                                        <span class="info-value">{{ auth()->user()->email }}</span>
                                    </div>

                                    <div class="info-item">
                                        <span class="info-label">
                                            <i data-lucide="shield" style="width: 14px; height: 14px;"></i>
                                            Rôle
                                        </span>
                                        <span class="info-value">
                                            @if(auth()->user()->roles->first())
                                                <span class="badge badge-success">
                                                    <i data-lucide="check" style="width: 12px; height: 12px;"></i>
                                                    {{ auth()->user()->roles->first()->name }}
                                                </span>
                                            @else
                                                <span class="badge badge-warning">Non défini</span>
                                            @endif
                                        </span>
                                    </div>

                                    <div class="info-item">
                                        <span class="info-label">
                                            <i data-lucide="hash" style="width: 14px; height: 14px;"></i>
                                            ID utilisateur
                                        </span>
                                        <span class="info-value">{{ auth()->user()->id }}</span>
                                    </div>

                                    <div class="info-item">
                                        <span class="info-label">
                                            <i data-lucide="building" style="width: 14px; height: 14px;"></i>
                                            ID co-propriétaire
                                        </span>
                                        <span class="info-value">
                                            @if(auth()->user()->coOwner)
                                                <span class="badge badge-success">{{ auth()->user()->coOwner->id }}</span>
                                            @else
                                                <span class="badge badge-warning">N/A</span>
                                            @endif
                                        </span>
                                    </div>
                                </div>
                            </div>
                        @endif

                        <div class="section">
                            <h2 class="section-title">
                                <i data-lucide="activity" style="width: 20px; height: 20px;"></i>
                                Informations techniques
                            </h2>

                            <div class="session-grid">
                                <div class="info-item">
                                    <span class="info-label">
                                        <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                                        Timestamp
                                    </span>
                                    <span class="info-value">{{ now()->format('d/m/Y H:i:s') }}</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">
                                        <i data-lucide="link" style="width: 14px; height: 14px;"></i>
                                        URL
                                    </span>
                                    <span class="info-value" style="font-size: 0.9rem;">{{ request()->url() }}</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">
                                        <i data-lucide="code" style="width: 14px; height: 14px;"></i>
                                        PHP Version
                                    </span>
                                    <span class="info-value">8.3.25</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">
                                        <i data-lucide="box" style="width: 14px; height: 14px;"></i>
                                        Laravel Version
                                    </span>
                                    <span class="info-value">11.46.2</span>
                                </div>
                            </div>
                        </div>

                        @if(auth()->check() && $tenants->count() > 0)
                            <div class="section">
                                <h2 class="section-title">
                                    <i data-lucide="users" style="width: 20px; height: 20px;"></i>
                                    Liste des locataires
                                    <span class="badge badge-success">
                                        {{ $tenants->count() }} locataire(s)
                                    </span>
                                </h2>

                                <div style="overflow-x: auto;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="background: rgba(79,70,229,.08);">
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--indigo);">Nom</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--indigo);">Email</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--indigo);">Téléphone</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--indigo);">Biens</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--indigo);">Statut</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--indigo);">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($tenants as $tenant)
                                                <tr style="border-bottom: 1px solid rgba(17,24,39,.08);">
                                                    <td style="padding: 1rem;">
                                                        <strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong>
                                                    </td>
                                                    <td style="padding: 1rem;">{{ $tenant->user->email ?? 'N/A' }}</td>
                                                    <td style="padding: 1rem;">{{ $tenant->user->phone ?? 'N/A' }}</td>
                                                    <td style="padding: 1rem;">{{ $tenant->leases->count() }}</td>
                                                    <td style="padding: 1rem;">
                                                        <span class="badge {{ $tenant->status === 'active' ? 'badge-success' : 'badge-warning' }}">
                                                            {{ $tenant->status === 'active' ? 'Actif' : 'En attente' }}
                                                        </span>
                                                    </td>
                                                    <td style="padding: 1rem;">
                                                        <a href="{{ route('co-owner.tenants.show', $tenant) }}" class="button" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                                                            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                                                            Voir
                                                        </a>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialiser Lucide icons
        lucide.createIcons();

        // Fonction pour aller vers React (port 8080)
        function goToReact(path) {
            const token = localStorage.getItem('token') || getUrlParam('api_token');

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'http://localhost:8080';
            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation vers React:', fullUrl);
            window.location.href = fullUrl;
        }

        // Fonction pour aller vers Laravel (port 8000)
        function navigateTo(path) {
            const token = localStorage.getItem('token') || getUrlParam('api_token');

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation vers Laravel:', fullUrl);
            window.location.href = fullUrl;
        }

        // Helper pour récupérer un paramètre d'URL
        function getUrlParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        // Gestion des sous-menus
        function toggleSubmenu(menuId) {
            const submenu = document.getElementById(menuId);
            const parent = submenu.parentElement;

            if (submenu.style.display === 'none' || !submenu.style.display) {
                submenu.style.display = 'block';
                parent.classList.add('active');
            } else {
                submenu.style.display = 'none';
                parent.classList.remove('active');
            }
        }

        // Gestion de la sidebar mobile
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');

            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        // Fermer la sidebar quand on clique sur l'overlay
        document.getElementById('overlay').addEventListener('click', toggleSidebar);

        // Logout
        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
            }
        }

        // Gestion du thème (basique)
        document.querySelector('.theme-toggle').addEventListener('click', function() {
            const icon = this.querySelector('i');
            const currentIcon = icon.getAttribute('data-lucide');

            if (currentIcon === 'sun') {
                icon.setAttribute('data-lucide', 'moon');
                document.documentElement.style.setProperty('--ink', '#f8fafc');
                document.documentElement.style.setProperty('--muted', '#cbd5e1');
                document.body.style.backgroundColor = '#0f172a';
            } else {
                icon.setAttribute('data-lucide', 'sun');
                document.documentElement.style.setProperty('--ink', '#0f172a');
                document.documentElement.style.setProperty('--muted', '#64748b');
                document.body.style.backgroundColor = 'white';
            }

            lucide.createIcons();
        });

        // Ajouter le token à la page actuelle si présent dans l'URL
        const urlToken = getUrlParam('api_token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
        }
    </script>

    <script>
    // Initialiser les icônes
    lucide.createIcons();

    // Navigation vers React (8080)
    function goToReact(path) {
        const token = localStorage.getItem('token') || getUrlParam('api_token');

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'http://localhost:8080';
        let fullUrl = baseUrl + path;

        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

        console.log('Navigation React vers:', fullUrl);
        window.location.href = fullUrl;
    }

    // Navigation vers Laravel (8000)
    function navigateTo(path) {
        const token = localStorage.getItem('token') || getUrlParam('api_token');

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
        let fullUrl = baseUrl + path;

        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

        console.log('Navigation Laravel vers:', fullUrl);
        window.location.href = fullUrl;
    }

    // Helper pour récupérer un paramètre d'URL
    function getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Gestion des sous-menus
    function toggleSubmenu(menuId) {
        const submenu = document.getElementById(menuId);
        const parent = document.querySelector(`[onclick="toggleSubmenu('${menuId}')"]`);

        if (submenu.style.display === 'none' || !submenu.style.display) {
            submenu.style.display = 'block';
            parent.classList.add('active');
        } else {
            submenu.style.display = 'none';
            parent.classList.remove('active');
        }
    }

    // Gestion de la sidebar mobile
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');

        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    // Logout
    function logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
        }
    }

    // Au chargement
    function checkMobile() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth <= 768) {
            mobileBtn.style.display = 'block';
        } else {
            mobileBtn.style.display = 'none';
        }
    }

    window.addEventListener('resize', checkMobile);
    checkMobile();

    // Ajouter le token à la page actuelle si présent dans l'URL
    const urlToken = getUrlParam('api_token');
    if (urlToken) {
        localStorage.setItem('token', urlToken);
    }

    // Marquer le menu actif en fonction de la page courante
    document.addEventListener('DOMContentLoaded', function() {
        const currentPath = window.location.pathname;

        // Définir quel sous-menu doit être ouvert par défaut
        const menuConfig = {
            '/coproprietaire/tenants': 'locative-menu',
            '/coproprietaire/tenants/create': 'locative-menu',
            '/coproprietaire/assign-property/create': 'locative-menu',
            '/coproprietaire/leases': 'locative-menu',
            '/coproprietaire/quittances': 'locative-menu',
            '/coproprietaire/notices': 'locative-menu',
            '/coproprietaire/maintenance': 'locative-menu',
            '/coproprietaire/biens': 'biens-menu',
            '/coproprietaire/delegations': 'biens-menu',
            '/coproprietaire/documents': 'documents-menu',
            '/coproprietaire/finances': 'documents-menu',
            '/coproprietaire/profile': 'profile-menu',
            '/coproprietaire/parametres': 'profile-menu',
            '/coproprietaire/audit': 'profile-menu',
            '/coproprietaire/mes-delegations': 'delegations-menu',
            '/coproprietaire/demandes-delegation': 'delegations-menu',
            '/coproprietaire/inviter-proprietaire': 'delegations-menu',
            '/coproprietaire/emettre-paiement': 'finances-menu',
            '/coproprietaire/retrait-methode': 'finances-menu',
            '/admin/statistiques': 'admin-menu',
            '/admin/logs': 'admin-menu'
        };

        // Ouvrir le sous-menu approprié
        for (const [path, menuId] of Object.entries(menuConfig)) {
            if (currentPath.includes(path)) {
                setTimeout(() => toggleSubmenu(menuId), 100);
                break;
            }
        }

        // Marquer l'élément actif
        document.querySelectorAll('.submenu-item').forEach(item => {
            const itemPath = item.getAttribute('onclick');
            if (itemPath && itemPath.includes(currentPath)) {
                item.classList.add('active');
            }
        });
    });
</script>
</body>
</html>
