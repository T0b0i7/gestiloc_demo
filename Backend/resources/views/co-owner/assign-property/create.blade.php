<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assigner un bien - Co-propriétaire</title>
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
            --line: rgba(15, 23, 42, .10);
            --line2: rgba(15, 23, 42, .08);
            --shadow: 0 22px 70px rgba(0, 0, 0, .18);
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
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
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
                display: block;
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
                radial-gradient(900px 520px at 12% -8%, rgba(102, 126, 234, .16) 0%, rgba(102, 126, 234, 0) 62%),
                radial-gradient(900px 520px at 92% 8%, rgba(118, 75, 162, .14) 0%, rgba(118, 75, 162, 0) 64%),
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
            border: 1px solid rgba(102, 126, 234, .18);
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

        .form-header h1 {
            font-size: 2rem;
            font-weight: 900;
            margin: 0 0 0.6rem 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            letter-spacing: -0.02em;
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

        .section-title {
            font-size: 1.05rem;
            font-weight: 950;
            color: var(--ink);
            margin: 0 0 1.25rem 0;
            padding-bottom: 0.85rem;
            border-bottom: 2px solid rgba(102, 126, 234, .28);
            display: flex;
            align-items: center;
            gap: 0.6rem;
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
            border-color: rgba(79, 70, 229, .75);
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.14);
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
            box-shadow: 0 14px 30px rgba(79, 70, 229, .22);
        }

        .button-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 18px 34px rgba(79, 70, 229, .28);
        }

        .button-secondary {
            background: rgba(255, 255, 255, .92);
            color: #4338ca;
            border: 2px solid rgba(67, 56, 202, .20);
        }

        .button-secondary:hover {
            background: rgba(67, 56, 202, .06);
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
            background: rgba(239, 246, 255, .92);
            border-color: rgba(59, 130, 246, .30);
            color: #1e40af;
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

            <!-- Formulaire -->
            <div class="form-container">
                <div class="form-card">
                    <div class="form-header">
                        <h1>
                            <i data-lucide="home" style="width: 32px; height: 32px;"></i>
                            Assigner un bien à un locataire
                        </h1>
                        <p>Créez un nouveau bail entre un bien délégué et un locataire de votre portefeuille</p>
                    </div>

                    <div class="form-body">
                        <div class="top-actions">
                            <a href="{{ route('co-owner.tenants.index') }}" class="button button-secondary"
                                onclick="navigateTo('/coproprietaire/tenants'); return false;">
                                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                Retour aux locataires
                            </a>
                            <div class="top-actions-right">
                                <a href="{{ route('co-owner.tenants.create') }}" class="button button-secondary"
                                    onclick="navigateTo('/coproprietaire/tenants/create'); return false;">
                                    <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
                                    Nouveau locataire
                                </a>
                            </div>
                        </div>

                        @if (session('error'))
                            <div class="alert-box alert-error">
                                <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Erreur</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">
                                        {{ session('error') }}</p>
                                </div>
                            </div>
                        @endif

                        @if (session('success'))
                            <div class="alert-box alert-success">
                                <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Succès</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">
                                        {{ session('success') }}</p>
                                </div>
                            </div>
                        @endif

                        <div class="alert-box alert-info">
                            <i data-lucide="info" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                            <div>
                                <strong>Informations importantes</strong>
                                <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">
                                    Vous ne pouvez assigner que les biens qui vous ont été délégués et qui ne sont pas
                                    déjà loués.
                                    Les locataires disponibles sont ceux que vous avez créés ou qui ne sont pas encore
                                    assignés à un bien.
                                </p>
                            </div>
                        </div>

                        <form method="POST" action="{{ route('co-owner.assign-property.store') }}" class="section"
                            style="margin-bottom: 0;">
                            @csrf

                            <h2 class="section-title">
                                <i data-lucide="home" style="width: 20px; height: 20px;"></i>
                                Sélection du bien et du locataire
                            </h2>

                            <div class="form-grid form-grid-2">
                                <!-- Bien délégué -->
                                <div class="form-group">
                                    <label class="form-label">
                                        Bien à louer <span class="required">*</span>
                                    </label>

                                    @if ($delegatedProperties->isEmpty())
                                        <div class="empty-state">
                                            <i data-lucide="home" class="empty-state-icon"
                                                style="width: 64px; height: 64px;"></i>
                                            <h3 class="empty-state-title">Aucun bien disponible</h3>
                                            <p class="empty-state-text">Aucun bien délégué n'est disponible pour la
                                                location.</p>
                                            <a href="#" class="button button-secondary"
                                                onclick="goToReact('/coproprietaire/biens'); return false;">
                                                <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                                                Voir mes biens délégués
                                            </a>
                                        </div>
                                    @else
                                        <select name="property_id" required
                                            class="form-select @error('property_id') input-error @enderror">
                                            <option value="">Sélectionnez un bien</option>
                                            @foreach ($delegatedProperties as $property)
                                                <option value="{{ $property->id }}"
                                                    {{ old('property_id') == $property->id ? 'selected' : '' }}>
                                                    {{ $property->name ?? 'Sans nom' }} -
                                                    {{ $property->address ?? 'Sans adresse' }}
                                                    @if ($property->city)
                                                        - {{ $property->city }}
                                                    @endif
                                                    @if ($property->rent_amount)
                                                        • {{ number_format($property->rent_amount, 0, ',', ' ') }} FCFA
                                                    @endif
                                                    (Type: {{ $property->type ?? 'Non spécifié' }})
                                                </option>
                                            @endforeach
                                        </select>
                                        @error('property_id')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    @endif
                                </div>

                                <!-- Locataire -->
                                <div class="form-group">
                                    <label class="form-label">
                                        Locataire <span class="required">*</span>
                                    </label>

                                    @if ($tenants->isEmpty())
                                        <div class="empty-state">
                                            <i data-lucide="users" class="empty-state-icon"
                                                style="width: 64px; height: 64px;"></i>
                                            <h3 class="empty-state-title">Aucun locataire disponible</h3>
                                            <p class="empty-state-text">Tous les locataires ont déjà un bien assigné.
                                            </p>
                                            <a href="{{ route('co-owner.tenants.create') }}"
                                                class="button button-primary"
                                                onclick="navigateTo('/coproprietaire/tenants/create'); return false;">
                                                <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
                                                Créer un locataire
                                            </a>
                                        </div>
                                    @else
                                        <select name="tenant_id" required
                                            class="form-select @error('tenant_id') input-error @enderror">
                                            <option value="">Sélectionnez un locataire</option>
                                            @foreach ($tenants as $tenant)
                                                <option value="{{ $tenant->id }}"
                                                    {{ old('tenant_id') == $tenant->id ? 'selected' : '' }}>
                                                    {{ $tenant->first_name }} {{ $tenant->last_name }}
                                                    @if ($tenant->user && $tenant->user->email)
                                                        ({{ $tenant->user->email }})
                                                    @endif
                                                    @if ($tenant->profession)
                                                        - {{ $tenant->profession }}
                                                    @endif
                                                </option>
                                            @endforeach
                                        </select>
                                        @error('tenant_id')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    @endif
                                </div>
                            </div>

                            <h2 class="section-title" style="margin-top: 2.5rem;">
                                <i data-lucide="calendar" style="width: 20px; height: 20px;"></i>
                                Durée du bail
                            </h2>

                            <div class="form-grid form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        Date de début <span class="required">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input type="date" name="start_date" required
                                            value="{{ old('start_date', date('Y-m-d')) }}"
                                            class="form-input @error('start_date') input-error @enderror">
                                    </div>
                                    @error('start_date')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Date de fin (facultatif)
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input type="date" name="end_date" value="{{ old('end_date') }}"
                                            class="form-input @error('end_date') input-error @enderror">
                                    </div>
                                    <p class="helper-text">Si vide, le bail sera pour une durée indéterminée</p>
                                    @error('end_date')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>
                            </div>

                            <h2 class="section-title" style="margin-top: 2.5rem;">
                                <i data-lucide="dollar-sign" style="width: 20px; height: 20px;"></i>
                                Montants financiers
                            </h2>

                            <div class="form-grid form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        Loyer mensuel (FCFA) <span class="required">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="dollar-sign" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input type="number" name="rent_amount" required min="1"
                                            step="0.01" value="{{ old('rent_amount') }}" placeholder="85000"
                                            class="form-input @error('rent_amount') input-error @enderror">
                                    </div>
                                    @error('rent_amount')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Dépôt de garantie (FCFA)
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="shield" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input type="number" name="deposit_amount" min="0" step="0.01"
                                            value="{{ old('deposit_amount') }}" placeholder="85000"
                                            class="form-input @error('deposit_amount') input-error @enderror">
                                    </div>
                                    <p class="helper-text">Généralement équivalent à 1 mois de loyer</p>
                                    @error('deposit_amount')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Charges (FCFA)
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="zap" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input type="number" name="charges_amount" min="0" step="0.01"
                                            value="{{ old('charges_amount', 0) }}" placeholder="15000"
                                            class="form-input @error('charges_amount') input-error @enderror">
                                    </div>
                                    @error('charges_amount')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>
                            </div>

                            <h2 class="section-title" style="margin-top: 2.5rem;">
                                <i data-lucide="file-text" style="width: 20px; height: 20px;"></i>
                                Détails du bail
                            </h2>

                            <div class="form-grid form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        Type de bail <span class="required">*</span>
                                    </label>
                                    <select name="type" required
                                        class="form-select @error('type') input-error @enderror">
                                        <option value="">Sélectionnez un type</option>
                                        <option value="nu" {{ old('type') == 'nu' ? 'selected' : '' }}>Bail nu
                                        </option>
                                        <option value="meuble" {{ old('type') == 'meuble' ? 'selected' : '' }}>Bail
                                            meublé</option>
                                    </select>
                                    @error('type')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Jour de paiement <span class="required">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="calendar-day" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input type="number" name="payment_day" required min="1"
                                            max="28" value="{{ old('payment_day', 5) }}"
                                            class="form-input @error('payment_day') input-error @enderror">
                                    </div>
                                    <p class="helper-text">Jour du mois (1-28)</p>
                                    @error('payment_day')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Préavis (jours)
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="clock" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input type="number" name="notice_period" min="0"
                                            value="{{ old('notice_period', 30) }}"
                                            class="form-input @error('notice_period') input-error @enderror">
                                    </div>
                                    @error('notice_period')
                                        <div class="field-error">
                                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                            <span>{{ $message }}</span>
                                        </div>
                                    @enderror
                                </div>
                            </div>

                            <div class="form-group" style="margin-top: 1.5rem;">
                                <label class="form-label">
                                    Inventaire des meubles (pour bail meublé)
                                </label>
                                <textarea name="furniture_inventory" rows="3" placeholder="Décrivez les meubles et équipements fournis..."
                                    class="form-textarea @error('furniture_inventory') input-error @enderror">{{ old('furniture_inventory') }}</textarea>
                                @error('furniture_inventory')
                                    <div class="field-error">
                                        <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                        <span>{{ $message }}</span>
                                    </div>
                                @enderror
                            </div>

                            <div class="form-group" style="margin-top: 1.5rem;">
                                <label class="form-label">
                                    Conditions particulières
                                </label>
                                <textarea name="special_conditions" rows="4" placeholder="Toute condition spécifique à ajouter au contrat..."
                                    class="form-textarea @error('special_conditions') input-error @enderror">{{ old('special_conditions') }}</textarea>
                                @error('special_conditions')
                                    <div class="field-error">
                                        <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                        <span>{{ $message }}</span>
                                    </div>
                                @enderror
                            </div>

                            <div class="bottom-actions" style="margin-top: 2.5rem;">
                                <a href="{{ route('co-owner.tenants.index') }}" class="button button-danger"
                                    onclick="navigateTo('/coproprietaire/tenants'); return false;">
                                    <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                                    Annuler
                                </a>

                                <button type="submit" class="button button-primary">
                                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                                    Créer le bail et assigner le bien
                                </button>
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

        // Calcul automatique du dépôt (1 mois de loyer)
        document.addEventListener('DOMContentLoaded', function() {
            const rentInput = document.querySelector('input[name="rent_amount"]');
            const depositInput = document.querySelector('input[name="deposit_amount"]');

            if (rentInput && depositInput) {
                rentInput.addEventListener('change', function() {
                    if (this.value && !depositInput.value) {
                        depositInput.value = this.value;
                    }
                });
            }

            // Validation des dates
            const startDateInput = document.querySelector('input[name="start_date"]');
            const endDateInput = document.querySelector('input[name="end_date"]');

            if (startDateInput && endDateInput) {
                endDateInput.addEventListener('change', function() {
                    const startDate = new Date(startDateInput.value);
                    const endDate = new Date(this.value);

                    if (endDate <= startDate) {
                        this.classList.add('input-error');
                        alert('La date de fin doit être après la date de début.');
                    } else {
                        this.classList.remove('input-error');
                    }
                });
            }

            // Focus sur le premier champ en erreur
            const firstError = document.querySelector('.input-error');
            if (firstError) {
                firstError.focus();
            }
        });
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
