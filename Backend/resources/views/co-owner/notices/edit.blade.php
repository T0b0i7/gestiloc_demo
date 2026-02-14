<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modifier le préavis - Co-propriétaire</title>
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

        .alert-error {
            background: rgba(254,242,242,.92);
            border-color: rgba(248,113,113,.30);
            color: #991b1b;
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

        .form-card {
            background: white;
            border-radius: 18px;
            padding: 2rem;
            border: 2px solid rgba(102,126,234,.15);
            box-shadow: 0 12px 40px rgba(0,0,0,.08);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            font-size: 0.9rem;
            font-weight: 950;
            color: var(--ink);
            margin-bottom: 0.5rem;
        }

        .form-control {
            width: 100%;
            padding: 0.9rem 1rem;
            border-radius: 12px;
            border: 2px solid rgba(148,163,184,.25);
            font-size: 0.95rem;
            transition: all 0.2s ease;
            background: rgba(255,255,255,.92);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--indigo);
            box-shadow: 0 0 0 3px rgba(79,70,229,.15);
        }

        .form-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 16px;
            padding-right: 2.5rem;
        }

        .form-textarea {
            min-height: 120px;
            resize: vertical;
        }

        .notice-info {
            background: rgba(102,126,234,.08);
            border-radius: 14px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
            border: 2px solid rgba(102,126,234,.20);
        }

        .notice-info h3 {
            font-size: 1rem;
            font-weight: 950;
            color: var(--indigo);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .notice-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 0.75rem;
        }

        .detail-item {
            font-size: 0.9rem;
        }

        .detail-label {
            font-weight: 850;
            color: var(--muted);
        }

        .detail-value {
            color: var(--ink);
            font-weight: 700;
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


            <!-- Contenu -->
            <div class="content-container">
                <div class="content-card">
                    <div class="content-header">
                        <h1>
                            <i data-lucide="edit" style="width: 32px; height: 32px;"></i>
                            Modifier le préavis
                        </h1>
                        <p>Préavis #NOTICE-{{ str_pad($notice->id, 6, '0', STR_PAD_LEFT) }}</p>
                    </div>

                    <div class="content-body">
                        <div class="top-actions">
                            <a href="{{ route('co-owner.notices.show', $notice) }}" class="button button-secondary">
                                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                Retour au détail
                            </a>
                        </div>

                        @if($errors->any())
                            <div class="alert-box alert-error">
                                <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Erreurs de validation</strong>
                                    <ul style="margin-top: 8px; padding-left: 1rem; font-weight: 650; font-size: 0.9rem;">
                                        @foreach($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            </div>
                        @endif

                        <!-- Informations non modifiables -->
                        <div class="notice-info">
                            <h3><i data-lucide="info" style="width: 16px; height: 16px;"></i> Informations du préavis</h3>
                            <div class="notice-details">
                                <div class="detail-item">
                                    <div class="detail-label">Bien</div>
                                    <div class="detail-value">{{ $notice->property->address ?? 'Non spécifié' }}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Locataire</div>
                                    <div class="detail-value">{{ $notice->tenant->user->name ?? 'Non spécifié' }}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Statut</div>
                                    <div class="detail-value">
                                        @if($notice->status == 'pending')
                                            <span style="color: #92400e;"><i data-lucide="clock" style="width: 14px; height: 14px;"></i> En attente</span>
                                        @elseif($notice->status == 'confirmed')
                                            <span style="color: #166534;"><i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Confirmé</span>
                                        @else
                                            <span style="color: #475569;"><i data-lucide="x-circle" style="width: 14px; height: 14px;"></i> Annulé</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form method="POST" action="{{ route('co-owner.notices.update', $notice) }}" class="form-card">
                            @csrf
                            @method('PUT')

                            <!-- Type de préavis -->
                            <div class="form-group">
                                <label class="form-label">
                                    <i data-lucide="user" style="width: 16px; height: 16px;"></i> Type de préavis *
                                </label>
                                <select name="type" class="form-control form-select" required>
                                    <option value="landlord" {{ old('type', $notice->type) == 'landlord' ? 'selected' : '' }}>Préavis bailleur</option>
                                    <option value="tenant" {{ old('type', $notice->type) == 'tenant' ? 'selected' : '' }}>Préavis locataire</option>
                                </select>
                            </div>

                            <!-- Dates -->
                            <div class="form-group">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div>
                                        <label class="form-label">
                                            <i data-lucide="calendar" style="width: 16px; height: 16px;"></i> Date du préavis *
                                        </label>
                                        <input type="date" name="notice_date" class="form-control"
                                               value="{{ old('notice_date', $notice->notice_date->format('Y-m-d')) }}" required>
                                    </div>
                                    <div>
                                        <label class="form-label">
                                            <i data-lucide="calendar" style="width: 16px; height: 16px;"></i> Date de fin *
                                        </label>
                                        <input type="date" name="end_date" class="form-control"
                                               value="{{ old('end_date', $notice->end_date->format('Y-m-d')) }}" required>
                                    </div>
                                </div>
                            </div>

                            <!-- Motif -->
                            <div class="form-group">
                                <label class="form-label">
                                    <i data-lucide="message-square" style="width: 16px; height: 16px;"></i> Motif *
                                </label>
                                <textarea name="reason" class="form-control form-textarea"
                                          placeholder="Détaillez le motif du préavis..." required>{{ old('reason', $notice->reason) }}</textarea>
                            </div>

                            <!-- Notes -->
                            <div class="form-group">
                                <label class="form-label">
                                    <i data-lucide="file-text" style="width: 16px; height: 16px;"></i> Notes additionnelles
                                </label>
                                <textarea name="notes" class="form-control form-textarea"
                                          placeholder="Informations complémentaires...">{{ old('notes', $notice->notes) }}</textarea>
                            </div>

                            <!-- Boutons -->
                            <div class="form-group" style="display: flex; gap: 1rem; margin-top: 2rem;">
                                <button type="submit" class="button button-primary">
                                    <i data-lucide="save" style="width: 16px; height: 16px;"></i> Enregistrer les modifications
                                </button>
                                <a href="{{ route('co-owner.notices.show', $notice) }}" class="button button-secondary">
                                    <i data-lucide="x" style="width: 16px; height: 16px;"></i> Annuler
                                </a>
                            </div>
                        </form>
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
