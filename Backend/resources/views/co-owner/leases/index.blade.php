<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baux en cours - Co-propriétaire</title>
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

        .app-container {
            display: flex;
            height: 100vh;
            background: white;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            width: 256px;
            flex-shrink: 0;
            background: white;
            border-right: 1px solid #e5e7eb;
        }

        .sidebar-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            height: 64px;
            border-bottom: 1px solid #e5e7eb;
        }

        .sidebar-header h1 {
            font-size: 1.25rem;
            font-weight: bold;
            background: linear-gradient(to right, #4f46e5, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
            flex: 1;
            padding: 1.5rem 1rem;
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

        .submenu {
            padding-left: 2rem;
            display: none;
        }

        .submenu-item {
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
            border-radius: 0.75rem;
            background: transparent;
            color: #374151;
            cursor: pointer;
            border: none;
            text-align: left;
        }

        .submenu-item:hover {
            background: #f3f4f6;
            color: #2563eb;
        }

        .submenu-item.active {
            background: linear-gradient(to right, #2563eb, #3b82f6);
            color: white;
        }

        .sidebar-footer {
            padding: 1rem;
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
            background: linear-gradient(to right, #3b82f6, #2563eb);
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
            background: white;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            padding: 0 1rem;
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
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .sidebar.active {
                left: 0;
            }
            .overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 40;
                display: none;
            }
            .overlay.active {
                display: block;
            }
            .mobile-menu-btn {
                display: block;
            }
        }

        .content-container {
            min-height: 100vh;
            background: #ffffff;
            padding: 2rem;
            position: relative;
        }

        .content-container::before {
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

        .content-card {
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

        .content-header {
            background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
            padding: 2.5rem;
            color: white;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }

        .content-header h1 {
            font-size: 2rem;
            font-weight: 900;
            margin: 0 0 0.6rem 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            letter-spacing: -0.02em;
        }

        .content-header p {
            opacity: 0.9;
            font-weight: 650;
            font-size: 0.95rem;
        }

        .content-body {
            padding: 2.5rem;
            position: relative;
            z-index: 1;
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
            background: rgba(239,246,255,.92);
            border-color: rgba(59,130,246,.30);
            color: #1e40af;
        }

        .alert-warning {
            background: rgba(254,252,232,.92);
            border-color: rgba(245,158,11,.30);
            color: #92400e;
        }

        .alert-error {
            background: rgba(254,242,242,.92);
            border-color: rgba(248,113,113,.30);
            color: #991b1b;
        }

        .alert-success {
            background: rgba(240,253,244,.92);
            border-color: rgba(74,222,128,.30);
            color: #166534;
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

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        .stat-card {
            background: rgba(255,255,255,.95);
            border: 2px solid rgba(102,126,234,.15);
            border-radius: 16px;
            padding: 1.75rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 10px 25px rgba(0,0,0,.05);
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(0,0,0,.08);
            border-color: rgba(102,126,234,.25);
        }

        .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .stat-icon.blue {
            background: rgba(59,130,246,.15);
            color: #1d4ed8;
        }

        .stat-icon.green {
            background: rgba(34,197,94,.15);
            color: #166534;
        }

        .stat-icon.purple {
            background: rgba(168,85,247,.15);
            color: #7c3aed;
        }

        .stat-info {
            flex: 1;
        }

        .stat-value {
            font-size: 1.8rem;
            font-weight: 950;
            color: var(--ink);
            line-height: 1;
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.9rem;
            font-weight: 850;
            color: var(--muted);
        }

        .leases-list {
            display: grid;
            gap: 1rem;
        }

        .lease-card {
            background: rgba(255,255,255,.95);
            border: 2px solid rgba(148,163,184,.15);
            border-radius: 16px;
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 2fr 1fr auto;
            gap: 1rem;
            align-items: center;
            transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
            .lease-card {
                grid-template-columns: 1fr;
            }
        }

        .lease-card:hover {
            border-color: rgba(102,126,234,.35);
            box-shadow: 0 10px 30px rgba(102,126,234,.15);
            transform: translateY(-2px);
        }

        .lease-info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .lease-title {
            font-size: 1.1rem;
            font-weight: 950;
            color: var(--ink);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .lease-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.85rem;
            color: var(--muted);
            font-weight: 650;
            flex-wrap: wrap;
        }

        .lease-meta-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .lease-amount {
            text-align: center;
            padding: 0.75rem 1rem;
            background: rgba(34,197,94,.08);
            border-radius: 12px;
            border: 1px solid rgba(34,197,94,.15);
        }

        .lease-amount-value {
            font-size: 1.35rem;
            font-weight: 950;
            color: #166534;
            line-height: 1;
        }

        .lease-amount-label {
            font-size: 0.8rem;
            font-weight: 850;
            color: #64748b;
            margin-top: 0.25rem;
        }

        .lease-actions {
            display: flex;
            gap: 0.5rem;
        }

        .empty-state {
            text-align: center;
            padding: 3rem;
            border: 2px dashed rgba(148,163,184,.35);
            border-radius: 16px;
            background: rgba(255,255,255,.72);
        }

        .empty-state-icon {
            margin: 0 auto 1rem;
            width: 64px;
            height: 64px;
            color: #94a3b8;
        }

        .empty-state-title {
            font-size: 1.1rem;
            font-weight: 950;
            color: #475569;
            margin-bottom: 0.5rem;
        }

        .empty-state-text {
            color: #64748b;
            font-weight: 650;
            margin-bottom: 1.5rem;
        }

        .badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 850;
        }

        .badge-active {
            background: rgba(34,197,94,.15);
            color: #166534;
            border: 1px solid rgba(34,197,94,.25);
        }

        .badge-inactive {
            background: rgba(148,163,184,.15);
            color: #475569;
            border: 1px solid rgba(148,163,184,.25);
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
                <button class="mobile-menu-btn" onclick="toggleSidebar()" style="display: none;">
                    <i data-lucide="menu"></i>
                </button>
                <div class="top-bar-content">
                    <div class="top-bar-actions">
                        <button class="logout-btn" title="Déconnexion" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Contenu -->
            <div class="content-container">
                <div class="content-card">
                    <div class="content-header">
                        <h1>
                            <i data-lucide="file-text" style="width: 32px; height: 32px;"></i>
                            Baux en cours
                        </h1>
                        <p>Gérez les baux pour les biens qui vous sont délégués</p>
                    </div>

                    <div class="content-body">
                        <div class="top-actions">
                            <a href="{{ route('co-owner.assign-property.create') }}" class="button button-primary" onclick="navigateTo('/coproprietaire/assign-property/create'); return false;">
                                <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                                Nouveau bail
                            </a>
                            <div class="top-actions-right">
                                <button onclick="refreshData()" class="button button-secondary">
                                    <i data-lucide="refresh-cw" style="width: 16px; height: 16px;"></i>
                                    Actualiser
                                </button>
                            </div>
                        </div>

                        @if(session('error'))
                            <div class="alert-box alert-error">
                                <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Erreur</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('error') }}</p>
                                </div>
                            </div>
                        @endif

                        @if(session('success'))
                            <div class="alert-box alert-success">
                                <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Succès</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('success') }}</p>
                                </div>
                            </div>
                        @endif

                        <!-- Statistiques -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon blue">
                                    <i data-lucide="home" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value">{{ $leases->count() }}</div>
                                    <div class="stat-label">Baux actifs</div>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon green">
                                    <i data-lucide="dollar-sign" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value">{{ number_format($leases->sum('rent_amount'), 0, ',', ' ') }} FCFA</div>
                                    <div class="stat-label">Loyer mensuel total</div>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon purple">
                                    <i data-lucide="users" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value">{{ $leases->unique('tenant_id')->count() }}</div>
                                    <div class="stat-label">Locataires actifs</div>
                                </div>
                            </div>
                        </div>

                        <!-- Liste des baux -->
                        @if($leases->isEmpty())
                            <div class="empty-state">
                                <i data-lucide="file-text" class="empty-state-icon" style="width: 64px; height: 64px;"></i>
                                <h3 class="empty-state-title">Aucun bail actif</h3>
                                <p class="empty-state-text">Vous n'avez pas encore créé de bail pour les biens qui vous sont délégués.</p>
                                <a href="{{ route('co-owner.assign-property.create') }}" class="button button-primary" onclick="navigateTo('/coproprietaire/assign-property/create'); return false;">
                                    <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                                    Créer un premier bail
                                </a>
                            </div>
                        @else
                            <div class="leases-list">
                                @foreach($leases as $lease)
                                    <div class="lease-card">
                                        <div class="lease-info">
                                            <div class="lease-title">
                                                <i data-lucide="home" style="width: 18px; height: 18px; color: var(--indigo);"></i>
                                                {{ $lease->property->name ?? 'Bien sans nom' }}
                                                <span class="badge badge-active">
                                                    <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i>
                                                    Actif
                                                </span>
                                            </div>
                                            <div class="lease-meta">
                                                <span class="lease-meta-item">
                                                    <i data-lucide="user" style="width: 14px; height: 14px;"></i>
                                                    {{ $lease->tenant->first_name }} {{ $lease->tenant->last_name }}
                                                </span>
                                                <span class="lease-meta-item">
                                                    <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                                                    {{ $lease->property->address ?? 'Non spécifiée' }}
                                                </span>
                                                <span class="lease-meta-item">
                                                    <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                                                    Depuis {{ $lease->start_date->format('d/m/Y') }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="lease-amount">
                                            <div class="lease-amount-value">
                                                {{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA
                                            </div>
                                            <div class="lease-amount-label">Loyer mensuel</div>
                                        </div>
                                        <div class="lease-actions">
                                       <a href="{{ route('co-owner.leases.documents.index', $lease) }}"
   class="button button-secondary"
   onclick="navigateTo('/coproprietaire/leases/{{ $lease->id }}/documents'); return false;">
    <i data-lucide="folder-open" style="width: 16px; height: 16px;"></i>
    Documents
</a>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialiser les icônes
        lucide.createIcons();

        // Fonction UNIFIÉE - React sur 8080, Laravel sur 8000
        function goToReact(path) {
            const token = localStorage.getItem('token') || getUrlParam('api_token');

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            // Déterminer si c'est une route React ou Laravel
            const isLaravelRoute = path.includes('/tenants') ||
                                  path.includes('/assign-property') ||
                                  path.includes('/leases') ||
                                  path.includes('/test-laravel');

            let baseUrl = 'http://localhost:';

            if (isLaravelRoute) {
                baseUrl += '8000'; // Laravel
            } else {
                baseUrl += '8080'; // React
            }

            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation vers:', fullUrl);
            window.location.href = fullUrl;
        }

        // Pour les routes Laravel
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

        document.getElementById('overlay').addEventListener('click', toggleSidebar);

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

        // Actualiser les données
        function refreshData() {
            const button = event.currentTarget;
            const originalHtml = button.innerHTML;

            button.innerHTML = '<i data-lucide="loader" style="width: 16px; height: 16px; animation: spin 1s linear infinite;"></i> Actualisation...';
            button.disabled = true;

            setTimeout(() => {
                window.location.reload();
            }, 500);
        }

        // Ajouter l'animation de spin pour le loader
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
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
