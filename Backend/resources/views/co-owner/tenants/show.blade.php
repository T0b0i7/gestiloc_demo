<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $tenant->first_name }} {{ $tenant->last_name }} - Fiche Locataire</title>
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

        .laravel-badge {
            background: #dcfce7;
            color: #166534;
            font-size: 0.75rem;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            margin-left: 0.5rem;
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

        .page-title {
            font-size: 1.5rem;
            font-weight: bold;
            background: linear-gradient(to right, #111827, #374151);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-left: auto;
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
            padding: 1.5rem;
            max-width: 84rem;
            margin: 0 auto;
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

        .button-danger {
            background: rgba(255,255,255,.92);
            color: #e11d48;
            border: 2px solid rgba(225,29,72,.18);
        }

        .button-danger:hover {
            background: rgba(225,29,72,.06);
        }

        .tenant-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .tenant-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            font-weight: bold;
            box-shadow: 0 14px 30px rgba(79,70,229,.22);
        }

        .tenant-info {
            flex: 1;
        }

        .tenant-name {
            font-size: 1.8rem;
            font-weight: 900;
            color: var(--ink);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .tenant-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.4rem 0.85rem;
            border-radius: 999px;
            font-weight: 950;
            font-size: 0.82rem;
            border: 1px solid rgba(255,255,255,.18);
        }

        .badge-active {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }

        .badge-pending {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }

        .tenant-meta {
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
            margin-top: 0.75rem;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--muted);
            font-weight: 650;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: rgba(255,255,255,.92);
            border: 1px solid rgba(17,24,39,.08);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(17,24,39,.06);
            backdrop-filter: blur(10px);
        }

        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .stat-icon.primary {
            background: rgba(79,70,229,.12);
            color: var(--indigo);
        }

        .stat-icon.success {
            background: rgba(16,185,129,.12);
            color: var(--emerald);
        }

        .stat-icon.warning {
            background: rgba(245,158,11,.12);
            color: #f59e0b;
        }

        .stat-value {
            font-size: 1.8rem;
            font-weight: 900;
            color: var(--ink);
            margin: 0.25rem 0;
        }

        .stat-label {
            font-size: 0.85rem;
            color: var(--muted);
            font-weight: 650;
        }

        .section-card {
            background: rgba(255,255,255,.92);
            border: 1px solid rgba(17,24,39,.08);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 10px 30px rgba(17,24,39,.06);
            backdrop-filter: blur(10px);
        }

        .section-title {
            font-size: 1.2rem;
            font-weight: 900;
            color: var(--ink);
            margin-bottom: 1.5rem;
            padding-bottom: 0.85rem;
            border-bottom: 2px solid rgba(102,126,234,.28);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
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

        .property-grid {
            display: grid;
            gap: 1.25rem;
        }

        .property-card {
            background: white;
            border: 1px solid rgba(17,24,39,.08);
            border-radius: 14px;
            padding: 1.5rem;
            transition: all 0.2s ease;
            border-left: 4px solid var(--indigo);
            box-shadow: 0 8px 25px rgba(17,24,39,.05);
        }

        .property-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 35px rgba(17,24,39,.08);
        }

        .property-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .property-name {
            font-size: 1.1rem;
            font-weight: 900;
            color: var(--ink);
            margin-bottom: 0.25rem;
        }

        .property-address {
            font-size: 0.9rem;
            color: var(--muted);
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }

        .property-rent {
            background: linear-gradient(135deg, var(--emerald) 0%, #059669 100%);
            color: white;
            padding: 0.4rem 0.85rem;
            border-radius: 999px;
            font-weight: 950;
            font-size: 0.9rem;
        }

        .property-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(17,24,39,.08);
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .detail-label {
            font-size: 0.8rem;
            font-weight: 650;
            color: var(--muted);
        }

        .detail-value {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--ink);
        }

        .property-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(17,24,39,.08);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--muted);
        }

        .empty-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            color: rgba(148,163,184,.35);
        }

        .alert {
            padding: 1.25rem;
            border-radius: 14px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            border: 1px solid rgba(15,23,42,.08);
            backdrop-filter: blur(10px);
        }

        .alert-warning {
            background: rgba(254,252,232,.92);
            border-color: rgba(245,158,11,.30);
        }

        .alert-success {
            background: rgba(236,253,245,.92);
            border-color: rgba(16,185,129,.30);
        }

        .badge-small {
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 850;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
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

        .pill {
            display: inline-flex;
            align-items: center;
            gap: .45rem;
            padding: .25rem .6rem;
            border-radius: 999px;
            background: rgba(79,70,229,.10);
            border: 1px solid rgba(79,70,229,.18);
            color: #4338ca;
            font-weight: 950;
            font-size: .78rem;
        }

        .d-inline {
            display: inline;
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
                    <h1 class="page-title">Fiche locataire</h1>
                    <div class="top-bar-actions">
                        <button class="logout-btn" title="Déconnexion" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Contenu -->
            <div class="content-container">
                <div class="top-actions">
                    <a href="{{ route('co-owner.tenants.index') }}" class="button button-secondary" onclick="navigateTo('/coproprietaire/tenants'); return false;">
                        <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                        Retour à la liste
                    </a>
                    <div class="top-actions-right">
                        <a href="{{ route('co-owner.tenants.assign.show', $tenant) }}" class="button button-primary" onclick="navigateTo('/coproprietaire/tenants/{{ $tenant->id }}/assign'); return false;">
                            <i data-lucide="home" style="width: 16px; height: 16px;"></i>
                            Assigner un bien
                        </a>
                    </div>
                </div>

                @if (session('success'))
                    <div class="alert alert-success">
                        <i data-lucide="check-circle" style="width: 20px; height: 20px; color: #059669;"></i>
                        <div>
                            <strong>Succès !</strong>
                            <p style="margin: 0.25rem 0 0 0;">{{ session('success') }}</p>
                        </div>
                    </div>
                @endif

                @if (session('error'))
                    <div class="alert alert-warning">
                        <i data-lucide="alert-circle" style="width: 20px; height: 20px; color: #d97706;"></i>
                        <div>
                            <strong>Attention !</strong>
                            <p style="margin: 0.25rem 0 0 0;">{{ session('error') }}</p>
                        </div>
                    </div>
                @endif

                <!-- En-tête locataire -->
                <div class="section-card">
                    <div class="tenant-header">
                        <div class="tenant-avatar">
                            {{ strtoupper(substr($tenant->first_name, 0, 1)) }}{{ strtoupper(substr($tenant->last_name, 0, 1)) }}
                        </div>
                        <div class="tenant-info">
                            <h1 class="tenant-name">
                                {{ $tenant->first_name }} {{ $tenant->last_name }}
                                <span class="tenant-badge {{ $tenant->status === 'active' ? 'badge-active' : 'badge-pending' }}">
                                    <i data-lucide="{{ $tenant->status === 'active' ? 'check-circle' : 'clock' }}" style="width: 14px; height: 14px;"></i>
                                    {{ $tenant->status === 'active' ? 'Actif' : 'En attente' }}
                                </span>
                            </h1>
                            <div class="tenant-meta">
                                <span class="meta-item">
                                    <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                                    {{ $tenant->user->email ?? 'Non défini' }}
                                </span>
                                <span class="meta-item">
                                    <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                                    {{ $tenant->user->phone ?? 'Non défini' }}
                                </span>
                                <span class="meta-item">
                                    <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                    Créé le {{ $tenant->created_at->format('d/m/Y') }}
                                </span>
                                <span class="meta-item">
                                    <i data-lucide="user-check" style="width: 16px; height: 16px;"></i>
                                    Email vérifié :
                                    @if($tenant->user->email_verified_at)
                                        <span class="badge-small badge-success">
                                            <i data-lucide="check" style="width: 12px; height: 12px;"></i>
                                            Oui
                                        </span>
                                    @else
                                        <span class="badge-small badge-warning">
                                            <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                                            Non
                                        </span>
                                    @endif
                                </span>
                            </div>
                        </div>
                    </div>

                    @if($tenant->status === 'candidate')
                        <div class="alert alert-warning">
                            <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #d97706;"></i>
                            <div style="flex: 1;">
                                <strong>En attente d'acceptation</strong>
                                <p style="margin: 0.25rem 0 0 0;">Le locataire n'a pas encore accepté l'invitation.</p>
                                <form action="{{ route('co-owner.tenants.resend-invitation', $tenant) }}"
                                      method="POST" style="margin-top: 0.75rem;">
                                    @csrf
                                    <button type="submit" class="button" style="background: rgba(245,158,11,.12); color: #854d0e; border-color: rgba(245,158,11,.25);">
                                        <i data-lucide="paper-plane" style="width: 16px; height: 16px;"></i>
                                        Renvoyer l'invitation
                                    </button>
                                </form>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- Statistiques -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i data-lucide="home" style="width: 20px; height: 20px;"></i>
                        </div>
                        <div class="stat-value">{{ $tenant->leases->count() }}</div>
                        <div class="stat-label">Biens assignés</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i data-lucide="calendar" style="width: 20px; height: 20px;"></i>
                        </div>
                        <div class="stat-value">{{ $tenant->created_at->diffForHumans() }}</div>
                        <div class="stat-label">Dans le système</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i data-lucide="file-text" style="width: 20px; height: 20px;"></i>
                        </div>
                        <div class="stat-value">{{ $tenant->leases->where('status', 'active')->count() }}</div>
                        <div class="stat-label">Baux actifs</div>
                    </div>
                </div>

                <!-- Biens assignés -->
                <div class="section-card">
                    <div class="section-title">
                        <span>
                            <i data-lucide="home" style="width: 20px; height: 20px;"></i>
                            Biens assignés
                        </span>
                        <span class="pill" style="background: rgba(79,70,229,.12); color: var(--indigo);">
                            {{ $tenant->leases->count() }} bien(s)
                        </span>
                    </div>

                    @if($tenant->leases->count() > 0)
                        <div class="property-grid">
                            @foreach($tenant->leases as $lease)
                                <div class="property-card">
                                    <div class="property-header">
                                        <div>
                                            <h3 class="property-name">{{ $lease->property->name }}</h3>
                                            <p class="property-address">
                                                <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                                                {{ $lease->property->address }}, {{ $lease->property->city }}
                                            </p>
                                        </div>
                                        <div class="property-rent">
                                            {{ number_format($lease->rent_amount, 2) }} €/mois
                                        </div>
                                    </div>

                                    <div class="property-details">
                                        <div class="detail-item">
                                            <span class="detail-label">Période</span>
                                            <span class="detail-value">
                                                {{ $lease->start_date->format('d/m/Y') }}
                                                @if($lease->end_date)
                                                    - {{ $lease->end_date->format('d/m/Y') }}
                                                @else
                                                    - Indéterminée
                                                @endif
                                            </span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Statut</span>
                                            <span class="detail-value">
                                                <span class="badge-small {{ $lease->status === 'active' ? 'badge-success' : 'badge-warning' }}">
                                                    {{ $lease->status === 'active' ? 'Actif' : ucfirst($lease->status) }}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="property-actions">
                                        <form action="{{ route('co-owner.tenants.unassign', [$tenant, $lease->property]) }}"
                                              method="POST" class="d-inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit"
                                                    class="button button-danger"
                                                    style="font-size: 0.85rem; padding: 0.6rem 1rem;"
                                                    onclick="return confirm('Êtes-vous sûr de vouloir désassigner ce bien ?')">
                                                <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                                                Désassigner
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="empty-state">
                            <i data-lucide="home" class="empty-icon"></i>
                            <h3 style="color: var(--muted); margin-bottom: 0.5rem;">Aucun bien assigné</h3>
                            <p style="color: var(--muted2); margin-bottom: 1.5rem;">Ce locataire n'a pas encore de bien assigné.</p>
                            <a href="{{ route('co-owner.tenants.assign.show', $tenant) }}" class="button button-primary" onclick="navigateTo('/coproprietaire/tenants/{{ $tenant->id }}/assign'); return false;">
                                <i data-lucide="home" style="width: 16px; height: 16px;"></i>
                                Assigner un bien
                            </a>
                        </div>
                    @endif
                </div>

                <!-- Informations personnelles -->
                <div class="section-card">
                    <div class="section-title">
                        <span>
                            <i data-lucide="user" style="width: 20px; height: 20px;"></i>
                            Informations personnelles
                        </span>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">
                                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                                Date de naissance
                            </span>
                            <span class="info-value">{{ $tenant->birth_date ? \Carbon\Carbon::parse($tenant->birth_date)->format('d/m/Y') : 'Non défini' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">
                                <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                                Lieu de naissance
                            </span>
                            <span class="info-value">{{ $tenant->birth_place ?? 'Non défini' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">
                                <i data-lucide="users" style="width: 14px; height: 14px;"></i>
                                Situation familiale
                            </span>
                            <span class="info-value">
                                @php
                                    $statuses = [
                                        'single' => 'Célibataire',
                                        'married' => 'Marié(e)',
                                        'divorced' => 'Divorcé(e)',
                                        'widowed' => 'Veuf/Veuve',
                                        'pacs' => 'PACS',
                                        'concubinage' => 'Concubinage'
                                    ];
                                @endphp
                                {{ $statuses[$tenant->marital_status] ?? 'Non défini' }}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">
                                <i data-lucide="briefcase" style="width: 14px; height: 14px;"></i>
                                Profession
                            </span>
                            <span class="info-value">{{ $tenant->profession ?? 'Non défini' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">
                                <i data-lucide="building" style="width: 14px; height: 14px;"></i>
                                Employeur
                            </span>
                            <span class="info-value">{{ $tenant->employer ?? 'Non défini' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">
                                <i data-lucide="euro" style="width: 14px; height: 14px;"></i>
                                Revenu annuel
                            </span>
                            <span class="info-value">
                                @if($tenant->annual_income)
                                    {{ number_format($tenant->annual_income, 2) }} €
                                @else
                                    Non défini
                                @endif
                            </span>
                        </div>
                    </div>

                    @if($tenant->notes)
                        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(17,24,39,.08);">
                            <h3 class="form-label" style="margin-bottom: 0.75rem;">
                                <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                                Notes
                            </h3>
                            <p style="color: var(--ink); line-height: 1.6;">{{ $tenant->notes }}</p>
                        </div>
                    @endif
                </div>

                <!-- Contact d'urgence -->
                @if($tenant->emergency_contact_name || $tenant->emergency_contact_phone)
                    <div class="section-card">
                        <div class="section-title">
                            <span>
                                <i data-lucide="alert-triangle" style="width: 20px; height: 20px;"></i>
                                Contact d'urgence
                            </span>
                        </div>

                        <div class="info-grid">
                            @if($tenant->emergency_contact_name)
                                <div class="info-item">
                                    <span class="info-label">
                                        <i data-lucide="user" style="width: 14px; height: 14px;"></i>
                                        Nom et prénom
                                    </span>
                                    <span class="info-value">{{ $tenant->emergency_contact_name }}</span>
                                </div>
                            @endif

                            @if($tenant->emergency_contact_phone)
                                <div class="info-item">
                                    <span class="info-label">
                                        <i data-lucide="phone" style="width: 14px; height: 14px;"></i>
                                        Téléphone
                                    </span>
                                    <span class="info-value">{{ $tenant->emergency_contact_phone }}</span>
                                </div>
                            @endif
                        </div>
                    </div>
                @endif
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
