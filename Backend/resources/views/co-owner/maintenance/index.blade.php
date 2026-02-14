<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demandes de maintenance - Copropriétaire</title>
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        :root {
            --gradA: #667eea;
            --gradB: #764ba2;
            --indigo: #4f46e5;
            --violet: #7c3aed;
            --emerald: #10b981;
            --yellow: #f59e0b;
            --red: #ef4444;
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
            max-width: 1500px;
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

        .button-danger {
            background: rgba(239,68,68,.10);
            color: var(--red);
            border: 2px solid rgba(239,68,68,.20);
        }

        .button-danger:hover {
            background: rgba(239,68,68,.15);
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

        .stat-icon.yellow {
            background: rgba(245,158,11,.15);
            color: #92400e;
        }

        .stat-icon.green {
            background: rgba(34,197,94,.15);
            color: #166534;
        }

        .stat-icon.purple {
            background: rgba(168,85,247,.15);
            color: #7c3aed;
        }

        .stat-icon.red {
            background: rgba(239,68,68,.15);
            color: #991b1b;
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

        .notices-list {
            display: grid;
            gap: 1rem;
        }

        .notice-card {
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
            .notice-card {
                grid-template-columns: 1fr;
            }
        }

        .notice-card:hover {
            border-color: rgba(102,126,234,.35);
            box-shadow: 0 10px 30px rgba(102,126,234,.15);
            transform: translateY(-2px);
        }

        .notice-info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .notice-title {
            font-size: 1.1rem;
            font-weight: 950;
            color: var(--ink);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .notice-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.85rem;
            color: var(--muted);
            font-weight: 650;
            flex-wrap: wrap;
        }

        .notice-meta-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .notice-actions {
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
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }

        .badge-open {
            background: rgba(245,158,11,.15);
            color: #92400e;
            border: 1px solid rgba(245,158,11,.25);
        }

        .badge-in_progress {
            background: rgba(59,130,246,.15);
            color: #1d4ed8;
            border: 1px solid rgba(59,130,246,.25);
        }

        .badge-resolved {
            background: rgba(34,197,94,.15);
            color: #166534;
            border: 1px solid rgba(34,197,94,.25);
        }

        .badge-cancelled {
            background: rgba(148,163,184,.15);
            color: #475569;
            border: 1px solid rgba(148,163,184,.25);
        }

        .badge-emergency {
            background: rgba(239,68,68,.15);
            color: #991b1b;
            border: 1px solid rgba(239,68,68,.25);
        }

        .badge-high {
            background: rgba(245,158,11,.15);
            color: #92400e;
            border: 1px solid rgba(245,158,11,.25);
        }

        .badge-medium {
            background: rgba(59,130,246,.15);
            color: #1d4ed8;
            border: 1px solid rgba(59,130,246,.25);
        }

        .badge-low {
            background: rgba(34,197,94,.15);
            color: #166534;
            border: 1px solid rgba(34,197,94,.25);
        }

        .filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            background: rgba(255,255,255,.9);
            padding: 1.5rem;
            border-radius: 16px;
            border: 2px solid rgba(102,126,234,.10);
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            min-width: 180px;
        }

        .filter-label {
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--ink);
        }

        .filter-select {
            padding: 0.75rem 1rem;
            border-radius: 10px;
            border: 1px solid rgba(102,126,234,.25);
            background: white;
            color: var(--ink);
            font-size: 0.875rem;
            cursor: pointer;
        }

        .filter-select:focus {
            outline: none;
            border-color: var(--indigo);
            box-shadow: 0 0 0 3px rgba(79,70,229,.15);
        }

        .top-bar-content {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .logout-btn {
            background: transparent;
            border: 1px solid rgba(100, 116, 139, 0.2);
            color: #64748b;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .logout-btn:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border-color: rgba(239, 68, 68, 0.3);
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


            </header>

            <!-- Contenu -->
            <div class="content-container">
                <div class="content-card">
                    <div class="content-header">
                        <h1>
                            <i data-lucide="wrench" style="width: 32px; height: 32px;"></i>
                            Demandes de maintenance
                        </h1>
                        <p>Gérez les demandes de réparation pour les biens qui vous sont délégués</p>
                    </div>

                    <div class="content-body">
                        <?php if(session('success')): ?>
                            <div class="alert-box alert-success">
                                <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Succès</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;"><?php echo e(session('success')); ?></p>
                                </div>
                            </div>
                        <?php endif; ?>

                        <?php if(session('error')): ?>
                            <div class="alert-box alert-error">
                                <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Erreur</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;"><?php echo e(session('error')); ?></p>
                                </div>
                            </div>
                        <?php endif; ?>

                        <!-- Statistiques -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon blue">
                                    <i data-lucide="wrench" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value"><?php echo e($stats['total']); ?></div>
                                    <div class="stat-label">Demandes totales</div>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon yellow">
                                    <i data-lucide="clock" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value"><?php echo e($stats['open']); ?></div>
                                    <div class="stat-label">En attente</div>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon purple">
                                    <i data-lucide="loader" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value"><?php echo e($stats['in_progress']); ?></div>
                                    <div class="stat-label">En cours</div>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon green">
                                    <i data-lucide="check-circle" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value"><?php echo e($stats['resolved']); ?></div>
                                    <div class="stat-label">Résolues</div>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-icon red">
                                    <i data-lucide="home" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value"><?php echo e($stats['properties']); ?></div>
                                    <div class="stat-label">Biens délégués</div>
                                </div>
                            </div>
                        </div>

                        <!-- Filtres -->
                        <div class="filters">
                            <div class="filter-group">
                                <label class="filter-label">Statut</label>
                                <select class="filter-select" onchange="filterByStatus(this.value)">
                                    <option value="all">Tous les statuts</option>
                                    <option value="open">En attente</option>
                                    <option value="in_progress">En cours</option>
                                    <option value="resolved">Résolu</option>
                                    <option value="cancelled">Annulé</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label class="filter-label">Priorité</label>
                                <select class="filter-select" onchange="filterByPriority(this.value)">
                                    <option value="all">Toutes priorités</option>
                                    <option value="emergency">Urgence</option>
                                    <option value="high">Élevée</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="low">Faible</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label class="filter-label">Bien</label>
                                <select class="filter-select" onchange="filterByProperty(this.value)">
                                    <option value="all">Tous les biens</option>
                                    <?php $__currentLoopData = $delegations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $delegation): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <?php if($delegation->property): ?>
                                            <option value="<?php echo e($delegation->property->id); ?>">
                                                <?php echo e($delegation->property->address); ?> - <?php echo e($delegation->property->city); ?>

                                            </option>
                                        <?php endif; ?>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                </select>
                            </div>

                            <div class="filter-group" style="align-self: flex-end;">
                                <button onclick="resetFilters()" class="button button-secondary">
                                    <i data-lucide="refresh-cw" style="width: 16px; height: 16px;"></i>
                                    Réinitialiser
                                </button>
                            </div>
                        </div>

                        <!-- Liste des demandes -->
                        <?php if($maintenanceRequests->isEmpty()): ?>
                            <div class="empty-state">
                                <i data-lucide="wrench" class="empty-state-icon" style="width: 64px; height: 64px;"></i>
                                <h3 class="empty-state-title">Aucune demande de maintenance</h3>
                                <p class="empty-state-text">
                                    Les locataires des biens délégués n'ont créé aucune demande de maintenance pour le moment.
                                </p>
                                <?php if($stats['properties'] === 0): ?>
                                    <div class="alert-box alert-info" style="max-width: 500px; margin: 1rem auto;">
                                        <i data-lucide="info" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                        <div>
                                            <strong>Information</strong>
                                            <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">
                                                Vous n'avez aucun bien délégué. Contactez le propriétaire principal pour obtenir des délégations.
                                            </p>
                                        </div>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php else: ?>
                            <div class="notices-list">
                                <?php $__currentLoopData = $maintenanceRequests; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $request): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <div class="notice-card"
                                         data-status="<?php echo e($request->status); ?>"
                                         data-priority="<?php echo e($request->priority); ?>"
                                         data-property="<?php echo e($request->property_id); ?>">
                                        <div class="notice-info">
                                            <div class="notice-title">
                                                <i data-lucide="wrench" style="width: 18px; height: 18px; color: var(--indigo);"></i>
                                                <?php echo e($request->title); ?>

                                                <span class="badge badge-<?php echo e($request->status); ?>">
                                                    <?php if($request->status == 'open'): ?>
                                                        <i data-lucide="clock" style="width: 12px; height: 12px;"></i> En attente
                                                    <?php elseif($request->status == 'in_progress'): ?>
                                                        <i data-lucide="loader" style="width: 12px; height: 12px;"></i> En cours
                                                    <?php elseif($request->status == 'resolved'): ?>
                                                        <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Résolu
                                                    <?php else: ?>
                                                        <i data-lucide="x-circle" style="width: 12px; height: 12px;"></i> Annulé
                                                    <?php endif; ?>
                                                </span>
                                                <span class="badge badge-<?php echo e($request->priority); ?>">
                                                    <?php if($request->priority == 'emergency'): ?>
                                                        <i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i> Urgence
                                                    <?php elseif($request->priority == 'high'): ?>
                                                        <i data-lucide="alert-circle" style="width: 12px; height: 12px;"></i> Élevée
                                                    <?php elseif($request->priority == 'medium'): ?>
                                                        <i data-lucide="info" style="width: 12px; height: 12px;"></i> Moyenne
                                                    <?php else: ?>
                                                        <i data-lucide="check" style="width: 12px; height: 12px;"></i> Faible
                                                    <?php endif; ?>
                                                </span>
                                            </div>
                                            <div class="notice-meta">
                                                <span class="notice-meta-item">
                                                    <i data-lucide="home" style="width: 14px; height: 14px;"></i>
                                                    <?php echo e($request->property->address ?? 'Bien inconnu'); ?>

                                                </span>
                                                <span class="notice-meta-item">
                                                    <i data-lucide="user" style="width: 14px; height: 14px;"></i>
                                                    <?php echo e($request->tenant->user->name ?? 'Locataire inconnu'); ?>

                                                </span>
                                                <span class="notice-meta-item">
                                                    <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                                                    <?php echo e($request->created_at->format('d/m/Y H:i')); ?>

                                                </span>
                                            </div>
                                            <?php if($request->description): ?>
                                                <div style="margin-top: 8px; font-size: 0.875rem; color: #64748b;">
                                                    <?php echo e(Str::limit($request->description, 100)); ?>

                                                </div>
                                            <?php endif; ?>
                                        </div>
                                        <div class="notice-meta">
                                            <div>
                                                <strong>Catégorie:</strong>
                                                <?php
                                                    $categories = [
                                                        'plumbing' => 'Plomberie',
                                                        'electricity' => 'Électricité',
                                                        'heating' => 'Chauffage',
                                                        'other' => 'Autre',
                                                    ];
                                                    echo $categories[$request->category] ?? $request->category;
                                                ?>
                                            </div>
                                            <?php if($request->assigned_provider): ?>
                                                <div><strong>Prestataire:</strong> <?php echo e($request->assigned_provider); ?></div>
                                            <?php endif; ?>
                                        </div>
                                        <div class="notice-actions">
                                            <a href="<?php echo e(route('co-owner.maintenance.show', $request)); ?>" class="button button-secondary">
                                                <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                                                Voir
                                            </a>
                                            <?php if($request->status == 'open'): ?>
                                                <form action="<?php echo e(route('co-owner.maintenance.start', $request)); ?>" method="POST" style="display: inline;">
                                                    <?php echo csrf_field(); ?>
                                                    <button type="submit" class="button button-primary">
                                                        <i data-lucide="play" style="width: 16px; height: 16px;"></i>
                                                        Prendre en charge
                                                    </button>
                                                </form>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </div>
                        <?php endif; ?>
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
                                  path.includes('/notices') ||
                                  path.includes('/maintenance') ||
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

        // Filtres
        function filterByStatus(status) {
            filterItems('status', status);
        }

        function filterByPriority(priority) {
            filterItems('priority', priority);
        }

        function filterByProperty(propertyId) {
            filterItems('property', propertyId);
        }

        function filterItems(type, value) {
            const cards = document.querySelectorAll('.notice-card');
            cards.forEach(card => {
                const cardValue = card.getAttribute(`data-${type}`);
                if (value === 'all' || cardValue === value) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        function resetFilters() {
            document.querySelectorAll('.filter-select').forEach(select => {
                select.value = 'all';
            });
            const cards = document.querySelectorAll('.notice-card');
            cards.forEach(card => {
                card.style.display = '';
            });
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
