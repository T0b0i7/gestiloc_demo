<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Statistiques Globales - GestiLoc Admin</title>
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Lucide Icons -->
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
            background-color: #f8fafc;
        }

        .app-container {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
            width: 260px;
            background: white;
            border-right: 1px solid #e5e7eb;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 40;
        }

        .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: white;
        }

        .sidebar-header h1 {
            font-size: 1.5rem;
            font-weight: bold;
            color: rgb(0, 0, 0);
            text-align: center;
        }

        .sidebar-nav {
            padding: 1.5rem 1rem;
        }

        .nav-section {
            margin-bottom: 2rem;
        }

        .nav-section-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--muted);
            letter-spacing: 0.05em;
            margin-bottom: 0.75rem;
            padding-left: 0.5rem;
        }

        .nav-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            border-radius: 0.75rem;
            color: var(--ink);
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: 1px solid transparent;
            background: none;
            width: 100%;
            text-align: left;
            font-size: 0.875rem;
        }

        .nav-item:hover {
            background: #f1f5f9;
            color: var(--indigo);
        }

        .nav-item.active {
            background: linear-gradient(to right, var(--indigo), var(--violet));
            color: white;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .nav-icon {
            width: 20px;
            height: 20px;
            margin-right: 0.75rem;
        }

        .nav-badge {
            margin-left: auto;
            background: #ef4444;
            color: white;
            font-size: 0.7rem;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-weight: bold;
        }

        /* Laravel badge */
        .laravel-badge {
            background: #10b981;
            color: white;
            font-size: 0.6rem;
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-weight: bold;
            margin-left: auto;
        }

        /* Main content */
        .main-content {
            flex: 1;
            margin-left: 260px;
            padding: 2rem;
        }

        /* Content header */
        .content-header {
            background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
            padding: 2.5rem;
            border-radius: 1.5rem;
            color: white;
            margin-bottom: 2rem;
            position: relative;
            overflow: hidden;
        }

        .content-header h1 {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
        }

        .content-header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .header-actions {
            position: absolute;
            right: 2.5rem;
            top: 2.5rem;
            display: flex;
            gap: 0.75rem;
        }

        /* Section headers */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e5e7eb;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--ink);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .section-title i {
            color: var(--indigo);
        }

        /* Stats grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }

        .stat-card {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            transition: all 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border-color: var(--gradA);
        }

        .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-icon.blue {
            background: rgba(59, 130, 246, 0.1);
            color: #1d4ed8;
        }

        .stat-icon.green {
            background: rgba(34, 197, 94, 0.1);
            color: #166534;
        }

        .stat-icon.purple {
            background: rgba(168, 85, 247, 0.1);
            color: #7c3aed;
        }

        .stat-icon.yellow {
            background: rgba(245, 158, 11, 0.1);
            color: #92400e;
        }

        .stat-icon.red {
            background: rgba(239, 68, 68, 0.1);
            color: #b91c1c;
        }

        .stat-icon.indigo {
            background: rgba(79, 70, 229, 0.1);
            color: var(--indigo);
        }

        .stat-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .trend-up {
            color: #10b981;
        }

        .trend-down {
            color: #ef4444;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 900;
            color: var(--ink);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.875rem;
            color: var(--muted);
            font-weight: 500;
        }

        /* Charts sections */
        .charts-section {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
            border: 1px solid #e5e7eb;
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
        }

        .chart-card {
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
        }

        .chart-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .chart-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--ink);
        }

        .chart-container {
            position: relative;
            height: 300px;
        }

        .half-chart-container {
            position: relative;
            height: 250px;
        }

        /* Tables */
        .table-section {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid #e5e7eb;
        }

        .table-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 1rem;
        }

        .table-responsive {
            overflow-x: auto;
            border-radius: 0.75rem;
            border: 1px solid #e5e7eb;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f8fafc;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: var(--ink);
            border-bottom: 2px solid #e5e7eb;
        }

        td {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            color: var(--muted);
        }

        tr:hover td {
            background: #f8fafc;
        }

        /* Mini stats grid */
        .mini-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .mini-stat-card {
            background: white;
            border-radius: 0.75rem;
            padding: 1.25rem;
            border: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .mini-stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .mini-stat-content {
            flex: 1;
        }

        .mini-stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--ink);
        }

        .mini-stat-label {
            font-size: 0.875rem;
            color: var(--muted);
        }

        /* Buttons */
        .button {
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
        }

        .button-primary {
            background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .button-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
        }

        .button-secondary {
            background: white;
            color: var(--indigo);
            border: 1px solid #c7d2fe;
        }

        .button-secondary:hover {
            background: #f1f5f9;
        }

        /* Export section */
        .export-section {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid #e5e7eb;
        }

        .export-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .export-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 0.75rem;
            color: var(--ink);
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }

        .export-btn:hover {
            border-color: var(--indigo);
            background: #eff6ff;
            transform: translateY(-2px);
        }

        /* Badges */
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-success {
            background: #dcfce7;
            color: #166534;
        }

        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-info {
            background: #dbeafe;
            color: #1e40af;
        }

        .badge-danger {
            background: #fee2e2;
            color: #b91c1c;
        }

        /* Profile section */
        .profile-section {
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            margin-top: auto;
        }

        .profile-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.75rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .profile-info:hover {
            background: #f1f5f9;
        }

        .profile-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--gradA), var(--gradB));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }

        .profile-details {
            flex: 1;
        }

        .profile-name {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--ink);
        }

        .profile-role {
            font-size: 0.75rem;
            color: var(--muted);
        }

        .admin-badge {
            background: #8b5cf6;
            color: white;
            font-size: 0.6rem;
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-weight: bold;
        }

        /* Responsive */
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
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 45;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0.5rem;
                padding: 0.5rem;
            }
            .main-content {
                margin-left: 0;
                padding: 1rem;
            }
            .charts-grid {
                grid-template-columns: 1fr;
            }
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .content-header h1 {
                font-size: 2rem;
            }
            .header-actions {
                position: static;
                margin-top: 1rem;
            }
        }

        /* Loading */
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: var(--muted);
        }
    </style>
</head>
<body>
    <div class="overlay" id="overlay"></div>

    <button class="mobile-menu-btn" id="mobileMenuBtn" style="display: none;">
        <i data-lucide="menu"></i>
    </button>

    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
         <div class="sidebar-header" style="
    display: flex;
    align-items: center;
    gap: 12px;
">
    <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #007bff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        text-transform: uppercase;
    ">
        G
    </div>

    <h1 style="
        margin: 0;
        font-size: 26px;
        font-weight: bold;
    ">
        GESTILOC
    </h1>
</div>


            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">MENU PRINCIPAL</div>

                    <!-- Tableau de bord -->
                    <button class="nav-item" onclick="goToReact('/coproprietaire/dashboard')">
                        <i data-lucide="layout-dashboard" class="nav-icon"></i>
                        Tableau de bord
                    </button>

                    <!-- Utilisateurs -->
                    <button class="nav-item" onclick="goToReact('/coproprietaire/users')">
                        <i data-lucide="users" class="nav-icon"></i>
                        Utilisateurs
                    </button>

                    <!-- Tickets Support -->
                    <button class="nav-item" onclick="goToReact('/coproprietaire/tickets')">
                        <i data-lucide="message-square" class="nav-icon"></i>
                        Tickets Support

                    </button>

                    <!-- Activité Système -->
                    <button class="nav-item" onclick="goToReact('/coproprietaire/activity')">
                        <i data-lucide="activity" class="nav-icon"></i>
                        Activité Système
                    </button>

                    <!-- Statistiques Globales (Laravel) -->
                    <button class="nav-item active" onclick="navigateTo('/admin/statistiques')">
                        <i data-lucide="bar-chart-3" class="nav-icon"></i>
                        Statistiques Globales

                    </button>

                      <button class="nav-item active" onclick="navigateTo('/admin/logs')">
                        <i data-lucide="file-text" class="nav-icon"></i>
                        Journaux Système
                    </button>
                </div>

                <!-- Section Administration -->
                <div class="nav-section">
                    <div class="nav-section-title">Administration</div>

                    <button class="nav-item" onclick="navigateTo('/admin/statistiques/export/users')">
                        <i data-lucide="download" class="nav-icon"></i>
                        Exporter Utilisateurs
                    </button>

                    <button class="nav-item" onclick="navigateTo('/admin/statistiques/export/co_owners')">
                        <i data-lucide="download" class="nav-icon"></i>
                        Exporter Co-propriétaires
                    </button>

                    <button class="nav-item" onclick="navigateTo('/admin/statistiques/export/tenants')">
                        <i data-lucide="download" class="nav-icon"></i>
                        Exporter Locataires
                    </button>

                    <button class="nav-item" onclick="navigateTo('/admin/statistiques/export/landlords')">
                        <i data-lucide="download" class="nav-icon"></i>
                        Exporter Propriétaires
                    </button>
                </div>

                <!-- Section Paramètres -->
                <div class="nav-section">
                    <div class="nav-section-title">Configuration</div>



                    <button class="nav-item" onclick="logout()">
                        <i data-lucide="log-out" class="nav-icon"></i>
                        Déconnexion
                    </button>
                </div>
            </nav>

            <!-- Profile section -->
            <div class="profile-section">
                <div class="profile-info" onclick="goToReact('/coproprietaire/profile')">

                    <div class="profile-details">

                        <div class="profile-role">Super Admin</div>
                    </div>
                    <span class="admin-badge">Admin</span>
                </div>


            </div>
        </aside>

        <!-- Main content -->
        <main class="main-content">
            <!-- Header -->
            <div class="content-header">
                <div>
                    <h1>Statistiques Globales</h1>
                    <p>Vue d'ensemble de la plateforme GestiLoc</p>
                </div>
                <div class="header-actions">
                    <button class="button button-secondary" onclick="refreshData()">
                        <i data-lucide="refresh-cw"></i>
                        Actualiser
                    </button>

                </div>
            </div>

            <!-- Export Section -->
            <div class="export-section">
                <h3>Exporter les données</h3>
                <div class="export-grid">
                    <a href="{{ route('admin.statistiques.export', 'users') }}" class="export-btn">
                        <span>Utilisateurs</span>
                        <i data-lucide="download"></i>
                    </a>
                    <a href="{{ route('admin.statistiques.export', 'co_owners') }}" class="export-btn">
                        <span>Co-propriétaires</span>
                        <i data-lucide="download"></i>
                    </a>
                    <a href="{{ route('admin.statistiques.export', 'tenants') }}" class="export-btn">
                        <span>Locataires</span>
                        <i data-lucide="download"></i>
                    </a>
                    <a href="{{ route('admin.statistiques.export', 'landlords') }}" class="export-btn">
                        <span>Propriétaires</span>
                        <i data-lucide="download"></i>
                    </a>
                </div>
            </div>

            <!-- Section 1: Statistiques Globales -->
            <div class="charts-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="bar-chart-3"></i>
                        Vue d'ensemble
                    </h2>
                </div>

                <div class="stats-grid">
                    <!-- Utilisateurs -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon blue">
                                <i data-lucide="users"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i data-lucide="trending-up"></i>
                                {{ number_format($userStats['users_growth'] ?? 0, 1) }}%
                            </div>
                        </div>
                        <div class="stat-value">{{ number_format($userStats['total_users'] ?? 0) }}</div>
                        <div class="stat-label">Utilisateurs totaux</div>
                    </div>

                    <!-- Propriétés -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon green">
                                <i data-lucide="home"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i data-lucide="trending-up"></i>
                                12.5%
                            </div>
                        </div>
                        <div class="stat-value">{{ number_format($propertyStats['total_properties'] ?? 0) }}</div>
                        <div class="stat-label">Propriétés</div>
                    </div>

                    <!-- Revenus -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon purple">
                                <i data-lucide="dollar-sign"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i data-lucide="trending-up"></i>
                                8.3%
                            </div>
                        </div>
                        <div class="stat-value">{{ number_format($financialStats['total_revenue'] ?? 0, 0, ',', ' ') }} FCFA</div>
                        <div class="stat-label">Revenus totaux</div>
                    </div>

                    <!-- Taux d'occupation -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon yellow">
                                <i data-lucide="percent"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i data-lucide="trending-up"></i>
                                2.1%
                            </div>
                        </div>
                        <div class="stat-value">
                            {{ $propertyStats['total_properties'] > 0 ?
                               round(($propertyStats['rented_properties'] / $propertyStats['total_properties']) * 100, 1) : 0 }}%
                        </div>
                        <div class="stat-label">Taux d'occupation</div>
                    </div>
                </div>
            </div>

            <!-- Section 2: Utilisateurs -->
            <div class="charts-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="users"></i>
                        Statistiques Utilisateurs
                    </h2>
                </div>

                <div class="mini-stats-grid">
                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #4f46e5, #7c3aed);">
                            <i data-lucide="user-check"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($userStats['active_users'] ?? 0) }}</div>
                            <div class="mini-stat-label">Utilisateurs actifs</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i data-lucide="user-plus"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($userStats['users_today'] ?? 0) }}</div>
                            <div class="mini-stat-label">Nouveaux aujourd'hui</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <i data-lucide="calendar"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($userStats['users_this_month'] ?? 0) }}</div>
                            <div class="mini-stat-label">Nouveaux ce mois</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                            <i data-lucide="user-x"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($userStats['total_users'] - $userStats['active_users']) }}</div>
                            <div class="mini-stat-label">Inactifs</div>
                        </div>
                    </div>
                </div>

                <div class="charts-grid">
                    <!-- Graphique 1: Distribution des types d'utilisateurs -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Distribution des types d'utilisateurs</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="userTypesChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 2: Croissance des utilisateurs -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Croissance des utilisateurs (12 derniers mois)</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="userGrowthChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 3: Détail par rôle -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Détail par rôle</h3>
                        </div>
                        <div class="half-chart-container">
                            <canvas id="roleDetailChart"></canvas>
                        </div>
                        <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                            <div style="padding: 0.5rem; background: #f3f4f6; border-radius: 0.5rem;">
                                <div style="font-size: 0.875rem; color: var(--muted);">Co-propriétaires</div>
                                <div style="font-size: 1.25rem; font-weight: bold;">{{ $userStats['users_by_role']['co_owners'] ?? 0 }}</div>
                            </div>
                            <div style="padding: 0.5rem; background: #f3f4f6; border-radius: 0.5rem;">
                                <div style="font-size: 0.875rem; color: var(--muted);">Locataires</div>
                                <div style="font-size: 1.25rem; font-weight: bold;">{{ $userStats['users_by_role']['tenants'] ?? 0 }}</div>
                            </div>
                            <div style="padding: 0.5rem; background: #f3f4f6; border-radius: 0.5rem;">
                                <div style="font-size: 0.875rem; color: var(--muted);">Propriétaires</div>
                                <div style="font-size: 1.25rem; font-weight: bold;">{{ $userStats['users_by_role']['landlords'] ?? 0 }}</div>
                            </div>
                            <div style="padding: 0.5rem; background: #f3f4f6; border-radius: 0.5rem;">
                                <div style="font-size: 0.875rem; color: var(--muted);">Agences</div>
                                <div style="font-size: 1.25rem; font-weight: bold;">{{ $userStats['users_by_role']['agencies'] ?? 0 }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 3: Propriétés -->
            <div class="charts-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="home"></i>
                        Statistiques des Propriétés
                    </h2>
                </div>

                <div class="mini-stats-grid">
                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i data-lucide="check-circle"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($propertyStats['available_properties'] ?? 0) }}</div>
                            <div class="mini-stat-label">Disponibles</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i data-lucide="key"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($propertyStats['rented_properties'] ?? 0) }}</div>
                            <div class="mini-stat-label">Louées</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <i data-lucide="tool"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($propertyStats['maintenance_properties'] ?? 0) }}</div>
                            <div class="mini-stat-label">En maintenance</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">
                            <i data-lucide="dollar-sign"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($propertyStats['total_rental_value'] ?? 0, 0, ',', ' ') }}</div>
                            <div class="mini-stat-label">Valeur locative (FCFA)</div>
                        </div>
                    </div>
                </div>

                <div class="charts-grid">
                    <!-- Graphique 1: Types de propriétés -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Types de propriétés</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="propertyDistributionChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 2: Distribution par statut -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Distribution par statut</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="propertyStatusChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 3: Nouveautés par mois -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Nouvelles propriétés par mois</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="newPropertiesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 4: Finances -->
            <div class="charts-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="dollar-sign"></i>
                        Statistiques Financières
                    </h2>
                </div>

                <div class="mini-stats-grid">
                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i data-lucide="calendar"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($financialStats['revenue_this_month'] ?? 0, 0, ',', ' ') }}</div>
                            <div class="mini-stat-label">Revenus ce mois (FCFA)</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i data-lucide="calendar-days"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($financialStats['revenue_this_year'] ?? 0, 0, ',', ' ') }}</div>
                            <div class="mini-stat-label">Revenus cette année (FCFA)</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <i data-lucide="trending-up"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($financialStats['avg_rent_receipt'] ?? 0, 0, ',', ' ') }}</div>
                            <div class="mini-stat-label">Quittance moyenne (FCFA)</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">
                            <i data-lucide="receipt"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($financialStats['total_revenue'] ?? 0, 0, ',', ' ') }}</div>
                            <div class="mini-stat-label">Revenus totaux (FCFA)</div>
                        </div>
                    </div>
                </div>

                <div class="charts-grid">
                    <!-- Graphique 1: Tendance des revenus -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Tendance des revenus (12 derniers mois)</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="revenueTrendChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 2: Quittances par mois -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Quittances par mois</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="rentReceiptsChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 3: Répartition des revenus -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Répartition des revenus par type</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="revenueDistributionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 5: Plateforme -->
            <div class="charts-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="activity"></i>
                        Statistiques de la Plateforme
                    </h2>
                </div>

                <div class="mini-stats-grid">
                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i data-lucide="file-text"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($platformStats['active_leases'] ?? 0) }}</div>
                            <div class="mini-stat-label">Contrats actifs</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i data-lucide="alert-circle"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($platformStats['maintenance_requests'] ?? 0) }}</div>
                            <div class="mini-stat-label">Demandes maintenance</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <i data-lucide="map-pin"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($platformStats['cities_with_properties'] ?? 0) }}</div>
                            <div class="mini-stat-label">Villes desservies</div>
                        </div>
                    </div>

                    <div class="mini-stat-card">
                        <div class="mini-stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                            <i data-lucide="calendar-x"></i>
                        </div>
                        <div class="mini-stat-content">
                            <div class="mini-stat-value">{{ number_format($platformStats['ending_leases'] ?? 0) }}</div>
                            <div class="mini-stat-label">Contrats se terminant</div>
                        </div>
                    </div>
                </div>

                <div class="charts-grid">
                    <!-- Graphique 1: Contrats par statut -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Contrats par statut</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="leaseStatusChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 2: Maintenance par statut -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Demandes de maintenance</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="maintenanceChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique 3: Activité par ville -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Propriétés par ville</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="citiesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tableau: Statistiques détaillées -->
            <div class="table-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="table"></i>
                        Tableau de Statistiques Détaillées
                    </h2>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Catégorie</th>
                                <th>Métrique</th>
                                <th>Valeur</th>
                                <th>Évolution</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Utilisateurs -->
                            <tr>
                                <td rowspan="4">Utilisateurs</td>
                                <td>Co-propriétaires</td>
                                <td>{{ $userStats['users_by_role']['co_owners'] ?? 0 }}</td>
                                <td><span class="badge badge-success">+5%</span></td>
                            </tr>
                            <tr>
                                <td>Locataires</td>
                                <td>{{ $userStats['users_by_role']['tenants'] ?? 0 }}</td>
                                <td><span class="badge badge-success">+12%</span></td>
                            </tr>
                            <tr>
                                <td>Propriétaires</td>
                                <td>{{ $userStats['users_by_role']['landlords'] ?? 0 }}</td>
                                <td><span class="badge badge-warning">+2%</span></td>
                            </tr>
                            <tr>
                                <td>Agences</td>
                                <td>{{ $userStats['users_by_role']['agencies'] ?? 0 }}</td>
                                <td><span class="badge badge-success">+8%</span></td>
                            </tr>

                            <!-- Propriétés -->
                            <tr>
                                <td rowspan="4">Propriétés</td>
                                <td>Disponibles</td>
                                <td>{{ $propertyStats['available_properties'] ?? 0 }}</td>
                                <td><span class="badge badge-info">Stable</span></td>
                            </tr>
                            <tr>
                                <td>Louées</td>
                                <td>{{ $propertyStats['rented_properties'] ?? 0 }}</td>
                                <td><span class="badge badge-success">+15%</span></td>
                            </tr>
                            <tr>
                                <td>En maintenance</td>
                                <td>{{ $propertyStats['maintenance_properties'] ?? 0 }}</td>
                                <td><span class="badge badge-warning">-3%</span></td>
                            </tr>
                            <tr>
                                <td>Valeur locative totale</td>
                                <td>{{ number_format($propertyStats['total_rental_value'] ?? 0, 0, ',', ' ') }} FCFA</td>
                                <td><span class="badge badge-success">+18%</span></td>
                            </tr>

                            <!-- Finances -->
                            <tr>
                                <td rowspan="3">Finances</td>
                                <td>Revenus ce mois</td>
                                <td>{{ number_format($financialStats['revenue_this_month'] ?? 0, 0, ',', ' ') }} FCFA</td>
                                <td><span class="badge badge-success">+22%</span></td>
                            </tr>
                            <tr>
                                <td>Revenus cette année</td>
                                <td>{{ number_format($financialStats['revenue_this_year'] ?? 0, 0, ',', ' ') }} FCFA</td>
                                <td><span class="badge badge-success">+34%</span></td>
                            </tr>
                            <tr>
                                <td>Quittance moyenne</td>
                                <td>{{ number_format($financialStats['avg_rent_receipt'] ?? 0, 0, ',', ' ') }} FCFA</td>
                                <td><span class="badge badge-warning">+1%</span></td>
                            </tr>

                            <!-- Plateforme -->
                            <tr>
                                <td rowspan="4">Plateforme</td>
                                <td>Contrats actifs</td>
                                <td>{{ $platformStats['active_leases'] ?? 0 }}</td>
                                <td><span class="badge badge-success">+7%</span></td>
                            </tr>
                            <tr>
                                <td>Demandes de maintenance</td>
                                <td>{{ $platformStats['maintenance_requests'] ?? 0 }}</td>
                                <td><span class="badge badge-warning">+25%</span></td>
                            </tr>
                            <tr>
                                <td>Villes avec propriétés</td>
                                <td>{{ $platformStats['cities_with_properties'] ?? 0 }}</td>
                                <td><span class="badge badge-success">+3</span></td>
                            </tr>
                            <tr>
                                <td>Contrats se terminant</td>
                                <td>{{ $platformStats['ending_leases'] ?? 0 }}</td>
                                <td><span class="badge badge-info">À surveiller</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Tableau: Statistiques mensuelles -->
            <div class="table-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="calendar"></i>
                        Statistiques Mensuelles (12 derniers mois)
                    </h2>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Mois</th>
                                <th>Nouveaux utilisateurs</th>
                                <th>Nouvelles propriétés</th>
                                <th>Quittances</th>
                                <th>Revenus (FCFA)</th>
                                <th>Contrats signés</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($monthlyStats as $month => $stats)
                            <tr>
                                <td>{{ $stats['name'] }}</td>
                                <td>{{ $stats['new_users'] }}</td>
                                <td>{{ $stats['new_properties'] }}</td>
                                <td>{{ $stats['rent_receipts'] }}</td>
                                <td>{{ number_format($stats['revenue'] ?? 0, 0, ',', ' ') }}</td>
                                <td>{{ $stats['new_leases'] ?? 0 }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Initialiser les icônes
        lucide.createIcons();

        // Données pour les graphiques
        const userGrowthData = @json($chartData['user_growth'] ?? []);
        const revenueTrendData = @json($chartData['revenue_trend'] ?? []);
        const propertyDistributionData = @json($chartData['property_distribution'] ?? []);
        const rentReceiptsData = @json($chartData['rent_receipts_by_month'] ?? []);
        const userTypesData = @json($chartData['user_types_distribution'] ?? []);
        const propertyStatusData = @json($chartData['property_status_distribution'] ?? []);
        const newPropertiesData = @json($chartData['new_properties_by_month'] ?? []);

        // Graphique 1: Distribution des types d'utilisateurs
        const userTypesCtx = document.getElementById('userTypesChart').getContext('2d');
        new Chart(userTypesCtx, {
            type: 'doughnut',
            data: {
                labels: userTypesData.map(d => d.type),
                datasets: [{
                    data: userTypesData.map(d => d.count),
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });

        // Graphique 2: Croissance des utilisateurs
        const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
        new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: userGrowthData.map(d => d.month),
                datasets: [{
                    label: 'Utilisateurs',
                    data: userGrowthData.map(d => d.users),
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Graphique 3: Détail par rôle
        const roleDetailCtx = document.getElementById('roleDetailChart').getContext('2d');
        new Chart(roleDetailCtx, {
            type: 'bar',
            data: {
                labels: ['Co-propriétaires', 'Locataires', 'Propriétaires', 'Agences'],
                datasets: [{
                    data: [
                        {{ $userStats['users_by_role']['co_owners'] ?? 0 }},
                        {{ $userStats['users_by_role']['tenants'] ?? 0 }},
                        {{ $userStats['users_by_role']['landlords'] ?? 0 }},
                        {{ $userStats['users_by_role']['agencies'] ?? 0 }}
                    ],
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Graphique 4: Types de propriétés
        const propertyDistributionCtx = document.getElementById('propertyDistributionChart').getContext('2d');
        new Chart(propertyDistributionCtx, {
            type: 'pie',
            data: {
                labels: propertyDistributionData.map(d => d.type),
                datasets: [{
                    data: propertyDistributionData.map(d => d.count),
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });

        // Graphique 5: Distribution par statut
        const propertyStatusCtx = document.getElementById('propertyStatusChart').getContext('2d');
        new Chart(propertyStatusCtx, {
            type: 'doughnut',
            data: {
                labels: propertyStatusData.map(d => d.status),
                datasets: [{
                    data: propertyStatusData.map(d => d.count),
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });

        // Graphique 6: Nouvelles propriétés par mois
        const newPropertiesCtx = document.getElementById('newPropertiesChart').getContext('2d');
        new Chart(newPropertiesCtx, {
            type: 'bar',
            data: {
                labels: newPropertiesData.map(d => d.month),
                datasets: [{
                    label: 'Nouvelles propriétés',
                    data: newPropertiesData.map(d => d.count),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Graphique 7: Tendance des revenus
        const revenueTrendCtx = document.getElementById('revenueTrendChart').getContext('2d');
        new Chart(revenueTrendCtx, {
            type: 'line',
            data: {
                labels: revenueTrendData.map(d => d.month),
                datasets: [{
                    label: 'Revenus (FCFA)',
                    data: revenueTrendData.map(d => d.revenue),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR') + ' FCFA';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Graphique 8: Quittances par mois
        const rentReceiptsCtx = document.getElementById('rentReceiptsChart').getContext('2d');
        new Chart(rentReceiptsCtx, {
            type: 'bar',
            data: {
                labels: rentReceiptsData.map(d => d.month),
                datasets: [{
                    label: 'Nombre de quittances',
                    data: rentReceiptsData.map(d => d.count),
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    yAxisID: 'y',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Nombre de quittances'
                        }
                    }
                }
            }
        });

        // ✅ FONCTION : Navigation vers React (8080)
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

        // ✅ FONCTION : Navigation vers Laravel (8000)
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

        // Fonctions utilitaires
        function refreshData() {
            const button = event.currentTarget;
            const originalContent = button.innerHTML;

            button.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Actualisation...';
            button.disabled = true;

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                // Nettoyer le localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Rediriger vers la page de login React
                window.location.href = 'http://localhost:8080/login';
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
        document.getElementById('mobileMenuBtn').addEventListener('click', toggleSidebar);

        // Vérifier si on est sur mobile
        function checkMobile() {
            const mobileBtn = document.getElementById('mobileMenuBtn');
            if (window.innerWidth <= 768) {
                mobileBtn.style.display = 'block';
            } else {
                mobileBtn.style.display = 'none';
                // Fermer la sidebar sur desktop
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('overlay');
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        }

        window.addEventListener('resize', checkMobile);
        checkMobile();

        // Ajouter le token à la page actuelle si présent dans l'URL
        const urlToken = getUrlParam('api_token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            console.log('Token stocké depuis URL:', urlToken);
        }

        // Animation de spin pour le loader
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>
