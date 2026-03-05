<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">
    <title>Journalisation - GestiLoc Admin</title>

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
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .sidebar-header-logo {
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
        }

        .sidebar-header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: bold;
            color: black;
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
        .logs-section {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
            border: 1px solid #e5e7eb;
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

        /* Log levels badges */
        .log-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-emergency { background: #fee2e2; color: #b91c1c; }
        .badge-alert { background: #fee2e2; color: #b91c1c; }
        .badge-critical { background: #fee2e2; color: #b91c1c; }
        .badge-error { background: #fee2e2; color: #b91c1c; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-notice { background: #dbeafe; color: #1e40af; }
        .badge-info { background: #dcfce7; color: #166534; }
        .badge-debug { background: #f3f4f6; color: #374151; }

        /* Log row colors */
        .log-row-emergency { border-left: 4px solid #dc2626; }
        .log-row-alert { border-left: 4px solid #dc2626; }
        .log-row-critical { border-left: 4px solid #dc2626; }
        .log-row-error { border-left: 4px solid #ef4444; }
        .log-row-warning { border-left: 4px solid #f59e0b; }
        .log-row-notice { border-left: 4px solid #3b82f6; }
        .log-row-info { border-left: 4px solid #10b981; }
        .log-row-debug { border-left: 4px solid #6b7280; }

        .log-row:hover {
            background-color: #f8fafc;
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

        /* Filters section */
        .filters-section {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid #e5e7eb;
        }

        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
        }

        .filter-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--ink);
            margin-bottom: 0.5rem;
        }

        .filter-select, .filter-input {
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            transition: all 0.2s;
        }

        .filter-select:focus, .filter-input:focus {
            outline: none;
            border-color: var(--indigo);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        /* Distribution cards */
        .distribution-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .distribution-card {
            background: white;
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
            border: 1px solid #e5e7eb;
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

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: white;
            border-radius: 1rem;
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: var(--shadow);
        }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-body {
            padding: 1.5rem;
            overflow-y: auto;
            max-height: 60vh;
        }

        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }

        /* Pagination */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 2rem;
        }

        .page-link {
            padding: 0.5rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            color: var(--ink);
            text-decoration: none;
            transition: all 0.2s;
        }

        .page-link:hover {
            background: #f1f5f9;
        }

        .page-link.active {
            background: var(--indigo);
            color: white;
            border-color: var(--indigo);
        }

        .log-message {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 500px;
        }

        .log-details {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            font-size: 11px;
            background: #1e293b;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
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
            <div class="sidebar-header">
                <div class="sidebar-header-logo">G</div>
                <h1>GESTILOC</h1>
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

                    <!-- Statistiques Globales  -->
                    <button class="nav-item" onclick="navigateTo('/admin/statistiques')">
                        <i data-lucide="bar-chart-3" class="nav-icon"></i>
                        Statistiques Globales
                    </button>

                    <!-- Journaux Système  -->
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
                    <h1>Journaux Système</h1>
                    <p>Surveillance et analyse des logs de l'application</p>
                </div>
                <div class="header-actions">
                    <button class="button button-secondary" onclick="refreshData()">
                        <i data-lucide="refresh-cw"></i>
                        Actualiser
                    </button>
                    <button class="button button-primary" onclick="toggleAutoRefresh()" id="autoRefreshBtn">
                        <i data-lucide="play" class="mr-2"></i>
                        Auto-refresh
                    </button>
                </div>
            </div>

            <!-- Statistiques -->
            <div class="logs-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="activity"></i>
                        Vue d'ensemble des logs
                    </h2>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon blue">
                                <i data-lucide="file-text"></i>
                            </div>
                        </div>
                        <div class="stat-value">{{ number_format($logStats['total']) }}</div>
                        <div class="stat-label">Entrées totales</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon red">
                                <i data-lucide="alert-triangle"></i>
                            </div>
                        </div>
                        <div class="stat-value">{{ number_format($logStats['levels']['error'] + $logStats['levels']['critical'] + $logStats['levels']['alert'] + $logStats['levels']['emergency']) }}</div>
                        <div class="stat-label">Erreurs critiques</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon yellow">
                                <i data-lucide="alert-circle"></i>
                            </div>
                        </div>
                        <div class="stat-value">{{ number_format($logStats['levels']['warning']) }}</div>
                        <div class="stat-label">Avertissements</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon green">
                                <i data-lucide="folder"></i>
                            </div>
                        </div>
                        <div class="stat-value">{{ count($logFiles) }}</div>
                        <div class="stat-label">Fichiers de logs</div>
                    </div>
                </div>

                <!-- Distribution par niveau -->
                <div class="distribution-grid">
                    @foreach($logStats['levels'] as $level => $count)
                    @if($count > 0)
                    <div class="distribution-card">
                        <div class="badge-{{ $level }} log-badge mb-2">{{ ucfirst($level) }}</div>
                        <div class="text-xl font-bold">{{ $count }}</div>
                    </div>
                    @endif
                    @endforeach
                </div>
            </div>

            <!-- Filtres et contrôles -->
            <div class="filters-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="filter"></i>
                        Filtres et contrôles
                    </h2>
                </div>

                <div class="filters-grid">
                    <div class="filter-group">
                        <label class="filter-label">Fichier de log</label>
                        <select id="logFileSelect" class="filter-select" onchange="changeLogFile()">
                            @foreach($logFiles as $file)
                            <option value="{{ $file['name'] }}" {{ $selectedLog == $file['name'] ? 'selected' : '' }}>
                                {{ $file['name'] }} ({{ $file['size'] }})
                            </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Niveau de log</label>
                        <select id="levelFilter" class="filter-select" onchange="applyFilters()">
                            @foreach($logLevels as $value => $label)
                            <option value="{{ $value }}" {{ $levelFilter == $value ? 'selected' : '' }}>
                                {{ $label }}
                            </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Recherche</label>
                        <input type="text" id="searchQuery" value="{{ $searchQuery }}"
                               placeholder="Rechercher dans les logs..."
                               class="filter-input"
                               onkeyup="debouncedSearch()">
                    </div>

                    <div class="filter-group" style="justify-content: flex-end;">
                        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                            <button onclick="downloadCurrentLog()" class="button button-secondary">
                                <i data-lucide="download" class="mr-2"></i>
                                Télécharger
                            </button>
                            <button onclick="clearCurrentLog()" class="button" style="background: #fee2e2; color: #b91c1c;">
                                <i data-lucide="trash-2" class="mr-2"></i>
                                Effacer
                            </button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <div class="text-sm text-gray-600">
                        Affichage de {{ count($logs) }} entrées sur {{ $totalLogs }}
                        @if($logStats['start_date'] && $logStats['end_date'])
                        • Du {{ $logStats['start_date'] }} au {{ $logStats['end_date'] }}
                        @endif
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <a href="{{ route('admin.logs.download-db') }}"
                           class="button" style="background: #f3e8ff; color: #7c3aed;">
                            <i data-lucide="database" class="mr-2"></i>
                            Backup DB
                        </a>
                        <a href="{{ route('admin.logs.clear-all') }}"
                           onclick="return confirm('Êtes-vous sûr de vouloir effacer TOUS les logs ? Une sauvegarde sera créée.')"
                           class="button" style="background: #fee2e2; color: #b91c1c;">
                            <i data-lucide="trash" class="mr-2"></i>
                            Tout effacer
                        </a>
                    </div>
                </div>
            </div>

            <!-- Liste des logs -->
            <div class="table-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="list"></i>
                        Liste des logs
                    </h2>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 180px;">Timestamp</th>
                                <th style="width: 100px;">Niveau</th>
                                <th>Message</th>
                                <th style="width: 100px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if(count($logs) > 0)
                                @foreach($logs as $log)
                                <tr class="log-row log-row-{{ $log['level'] }}">
                                    <td class="text-sm">{{ $log['timestamp'] }}</td>
                                    <td>
                                        <span class="badge-{{ $log['level'] }} log-badge">
                                            {{ strtoupper($log['level']) }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="log-message" title="{{ $log['message'] }}">
                                            {{ Str::limit($log['message'], 150) }}
                                        </div>
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 0.5rem;">
                                            <button onclick="showLogDetails('{{ $selectedLog }}', {{ $log['id'] }})"
                                                    class="button" style="padding: 0.25rem 0.5rem; background: #eff6ff; color: #1d4ed8;">
                                                <i data-lucide="eye" class="w-4 h-4"></i>
                                            </button>
                                            <button onclick="copyToClipboard(`{{ addslashes($log['raw']) }}`)"
                                                    class="button" style="padding: 0.25rem 0.5rem; background: #f0fdf4; color: #166534;">
                                                <i data-lucide="copy" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            @else
                                <tr>
                                    <td colspan="4" style="text-align: center; padding: 3rem;">
                                        <i data-lucide="file-search" class="w-12 h-12 text-gray-400 mx-auto mb-3"></i>
                                        <p class="text-gray-500">Aucun log trouvé avec les filtres actuels</p>
                                    </td>
                                </tr>
                            @endif
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                @if($totalPages > 1)
                <div class="pagination">
                    @if($currentPage > 1)
                    <a href="{{ request()->fullUrlWithQuery(['page' => $currentPage - 1]) }}" class="page-link">
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    </a>
                    @endif

                    @for($i = 1; $i <= min($totalPages, 5); $i++)
                    <a href="{{ request()->fullUrlWithQuery(['page' => $i]) }}"
                       class="page-link {{ $i == $currentPage ? 'active' : '' }}">
                        {{ $i }}
                    </a>
                    @endfor

                    @if($totalPages > 5 && $currentPage < $totalPages)
                    <span class="text-gray-500">...</span>
                    <a href="{{ request()->fullUrlWithQuery(['page' => $totalPages]) }}" class="page-link">
                        {{ $totalPages }}
                    </a>
                    @endif

                    @if($currentPage < $totalPages)
                    <a href="{{ request()->fullUrlWithQuery(['page' => $currentPage + 1]) }}" class="page-link">
                        <i data-lucide="chevron-right" class="w-4 h-4"></i>
                    </a>
                    @endif
                </div>
                @endif
            </div>
        </main>
    </div>

    <!-- Modal pour les détails du log -->
    <div class="modal" id="logDetailsModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 style="font-size: 1.25rem; font-weight: 600;">Détails du log</h3>
                <button onclick="closeModal()" style="background: none; border: none; cursor: pointer;">
                    <i data-lucide="x" class="w-5 h-5 text-gray-500"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="logDetailsContent">
                    <!-- Contenu chargé dynamiquement -->
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="copyModalContent()" class="button button-secondary">
                    <i data-lucide="copy" class="mr-2"></i>
                    Copier
                </button>
                <button onclick="closeModal()" class="button button-primary">
                    Fermer
                </button>
            </div>
        </div>
    </div>

    <script>
        // Initialiser les icônes
        lucide.createIcons();

        let autoRefreshInterval = null;
        let isAutoRefreshing = false;

        // Navigation vers React
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

            window.location.href = fullUrl;
        }

        // Navigation vers Laravel
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

            window.location.href = fullUrl;
        }

        // Obtenir un paramètre d'URL
        function getUrlParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        // Changer le fichier de log
        function changeLogFile() {
            const select = document.getElementById('logFileSelect');
            const logFile = select.value;
            const url = new URL(window.location.href);
            url.searchParams.set('log', logFile);
            url.searchParams.delete('page');
            window.location.href = url.toString();
        }

        // Appliquer les filtres
        function applyFilters() {
            const levelFilter = document.getElementById('levelFilter').value;
            const searchQuery = document.getElementById('searchQuery').value;
            const url = new URL(window.location.href);

            url.searchParams.set('level', levelFilter);
            url.searchParams.set('search', searchQuery);
            url.searchParams.delete('page');

            window.location.href = url.toString();
        }

        // Recherche avec debounce
        let searchTimeout;
        function debouncedSearch() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 500);
        }

        // Rafraîchir les logs
        function refreshData() {
            window.location.reload();
        }

        // Basculer l'auto-refresh
        function toggleAutoRefresh() {
            const btn = document.getElementById('autoRefreshBtn');

            if (isAutoRefreshing) {
                clearInterval(autoRefreshInterval);
                btn.innerHTML = '<i data-lucide="play" class="mr-2"></i>Auto-refresh';
                btn.classList.remove('bg-green-100', 'text-green-700');
            } else {
                autoRefreshInterval = setInterval(refreshData, 10000);
                btn.innerHTML = '<i data-lucide="pause" class="mr-2"></i>Arrêter';
            }

            isAutoRefreshing = !isAutoRefreshing;
        }

        // Télécharger le log actuel
        function downloadCurrentLog() {
            const logFile = document.getElementById('logFileSelect').value;
            window.location.href = `/admin/logs/download/${logFile}`;
        }

        // Effacer le log actuel
        function clearCurrentLog() {
            if (!confirm('Êtes-vous sûr de vouloir effacer ce fichier de log ? Une sauvegarde sera créée.')) {
                return;
            }

            const logFile = document.getElementById('logFileSelect').value;
            window.location.href = `/admin/logs/clear/${logFile}`;
        }

        // Afficher les détails d'un log
        function showLogDetails(filename, logId) {
            fetch(`/admin/logs/${filename}/${logId}`)
                .then(response => response.text())
                .then(html => {
                    document.getElementById('logDetailsContent').innerHTML = html;
                    document.getElementById('logDetailsModal').style.display = 'flex';
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    document.getElementById('logDetailsContent').innerHTML =
                        '<div class="text-red-600">Erreur lors du chargement des détails</div>';
                    document.getElementById('logDetailsModal').style.display = 'flex';
                });
        }

        // Fermer la modale
        function closeModal() {
            document.getElementById('logDetailsModal').style.display = 'none';
        }

        // Copier le contenu de la modale
        function copyModalContent() {
            const content = document.getElementById('logDetailsContent').innerText;
            navigator.clipboard.writeText(content)
                .then(() => {
                    alert('Contenu copié dans le presse-papier');
                })
                .catch(err => {
                    console.error('Erreur de copie:', err);
                });
        }

        // Copier une ligne dans le presse-papier
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    // Notification visuelle
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                    notification.textContent = 'Copié !';
                    document.body.appendChild(notification);

                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 2000);
                })
                .catch(err => {
                    console.error('Erreur de copie:', err);
                });
        }

        // Récupérer les logs en temps réel (AJAX)
        function fetchLiveLogs() {
            const logFile = document.getElementById('logFileSelect').value;
            const currentLogCount = {{ $totalLogs }};

            fetch(`/admin/logs/ajax?file=${logFile}&since=${currentLogCount}`)
                .then(response => response.json())
                .then(data => {
                    if (data.count > 0 && isAutoRefreshing) {
                        refreshData();
                    }
                })
                .catch(error => console.error('Erreur:', error));
        }

        // Vérifier périodiquement les nouveaux logs
        if (isAutoRefreshing) {
            setInterval(fetchLiveLogs, 5000);
        }

        // Raccourcis clavier
        document.addEventListener('keydown', function(e) {
            // Ctrl + F pour rechercher
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchQuery').focus();
            }

            // Échap pour fermer la modale
            if (e.key === 'Escape') {
                closeModal();
            }

            // Ctrl + R pour rafraîchir
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                refreshData();
            }
        });

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
        }

        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'http://localhost:8080/login';
            }
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
