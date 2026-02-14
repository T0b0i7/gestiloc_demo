<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Créer un Locataire - Co-propriétaire</title>
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">

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
                radial-gradient(900px 520px at 12% -8%, rgba(102,126,234,.16) 0%, rgba(102,126,234,0) 62%),
                radial-gradient(900px 520px at 92% 8%, rgba(118,75,162,.14) 0%, rgba(118,75,162,0) 64%),
                radial-gradient(700px 420px at 40% 110%, rgba(16,185,129,.10) 0%, rgba(16,185,129,0) 60%);
            pointer-events: none;
            z-index: -2;
        }

        .form-card {
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
            background: rgba(255,255,255,.72);
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid rgba(17,24,39,.08);
            box-shadow: 0 10px 30px rgba(17,24,39,.06);
            backdrop-filter: blur(10px);
        }

        .section-title {
            font-size: 1.05rem;
            font-weight: 950;
            color: var(--ink);
            margin: 0 0 1.25rem 0;
            padding-bottom: 0.85rem;
            border-bottom: 2px solid rgba(102,126,234,.28);
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

        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 0.85rem 1rem;
            border: 2px solid rgba(148,163,184,.35);
            border-radius: 12px;
            font-size: 1rem;
            color: var(--ink);
            background: rgba(255,255,255,.92);
            transition: all 0.2s ease;
            font-family: inherit;
            font-weight: 700;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: rgba(79,70,229,.75);
            box-shadow: 0 0 0 4px rgba(79,70,229,0.14);
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
            border-top: 2px solid rgba(148,163,184,.35);
            flex-wrap: wrap;
        }

        .tab-nav {
            display: flex;
            gap: 1.2rem;
            border-bottom: 2px solid rgba(148,163,184,.35);
            margin-bottom: 2rem;
            overflow-x: auto;
            padding-bottom: .2rem;
        }

        .tab-button {
            padding: 0.95rem 0;
            border: none;
            background: transparent;
            font-size: .92rem;
            font-weight: 950;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            color: #64748b;
            white-space: nowrap;
            transition: color .15s ease, border-color .15s ease;
            display: flex;
            align-items: center;
            gap: .55rem;
        }

        .tab-button.active {
            color: #4338ca;
            border-color: #4338ca;
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

        .input-error {
            border-color: rgba(225,29,72,.72) !important;
            box-shadow: 0 0 0 4px rgba(225,29,72,.10) !important;
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
                            <i data-lucide="user-plus" style="width: 32px; height: 32px;"></i>
                            Nouveau locataire
                        </h1>
                        <p>Renseignez les informations du locataire pour l'ajouter à votre portefeuille</p>
                    </div>

                    <div class="form-body">
                        <div class="top-actions">
                            <a href="{{ url('/coproprietaire/dashboard') }}" class="button button-secondary" onclick="goToReact('/coproprietaire/dashboard'); return false;">
                                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                Retour au tableau de bord
                            </a>
                            <div class="top-actions-right">
                                <button class="button button-danger" type="button" onclick="confirmCancel()">
                                    <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                                    Annuler
                                </button>
                                <button class="button button-primary" type="submit" form="tenantForm">
                                    <i data-lucide="save" style="width: 16px; height: 16px;"></i>
                                    Enregistrer le locataire
                                </button>
                            </div>
                        </div>

                        @if ($errors->any())
                            <div style="margin-bottom: 1rem; background: rgba(255,241,242,.92); border: 1px solid rgba(244,63,94,.30); border-radius: 14px; padding: 12px 14px; color: #9f1239; font-weight: 950; display: flex; align-items: center; gap: 10px;">
                                <i data-lucide="alert-circle" style="width: 18px; height: 18px;"></i>
                                <span>Veuillez corriger les erreurs ci-dessous.</span>
                            </div>
                        @endif

                        @if (session('success'))
                            <div style="margin-bottom: 1rem; background: rgba(236,253,245,.92); border: 1px solid rgba(16,185,129,.30); border-radius: 14px; padding: 12px 14px; color: #065f46; font-weight: 950; display: flex; align-items: center; gap: 10px;">
                                <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>
                                <span>{{ session('success') }}</span>
                            </div>
                        @endif

                        <div class="tab-nav">
                            <button type="button" class="tab-button active" onclick="showTab('infos')">
                                Informations personnelles
                            </button>
                            <button type="button" class="tab-button" onclick="showTab('contact')">
                                Coordonnées
                            </button>
                            <button type="button" class="tab-button" onclick="showTab('pro')">
                                Situation professionnelle
                            </button>
                            <button type="button" class="tab-button" onclick="showTab('garant')">
                                Garant
                            </button>
                        </div>

                        <form id="tenantForm" method="POST" action="{{ route('co-owner.tenants.store') }}">
                            @csrf

                            <!-- Tab 1: Informations personnelles -->
                            <div id="tab-infos" class="section">
                                <h2 class="section-title">
                                    <i data-lucide="user" style="width: 20px; height: 20px;"></i>
                                    Informations personnelles
                                </h2>

                                <div class="form-grid form-grid-2">
                                    <div class="form-group">
                                        <label class="form-label">
                                            Prénom <span class="required">*</span>
                                        </label>
                                        <input class="form-input @error('first_name') input-error @enderror"
                                               type="text"
                                               name="first_name"
                                               value="{{ old('first_name') }}"
                                               placeholder="Jean"
                                               required>
                                        @error('first_name')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Nom <span class="required">*</span>
                                        </label>
                                        <input class="form-input @error('last_name') input-error @enderror"
                                               type="text"
                                               name="last_name"
                                               value="{{ old('last_name') }}"
                                               placeholder="Dupont"
                                               required>
                                        @error('last_name')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Date de naissance <span class="required">*</span>
                                        </label>
                                        <div class="form-input-icon">
                                            <div class="icon-wrapper">
                                                <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                            </div>
                                            <input class="form-input @error('birth_date') input-error @enderror"
                                                   type="date"
                                                   name="birth_date"
                                                   value="{{ old('birth_date') }}"
                                                   required>
                                        </div>
                                        @error('birth_date')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Lieu de naissance <span class="required">*</span>
                                        </label>
                                        <input class="form-input @error('birth_place') input-error @enderror"
                                               type="text"
                                               name="birth_place"
                                               value="{{ old('birth_place') }}"
                                               placeholder="Ville, Pays"
                                               required>
                                        @error('birth_place')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">Situation familiale</label>
                                        <select class="form-select" name="marital_status">
                                            <option value="single" {{ old('marital_status') == 'single' ? 'selected' : '' }}>Célibataire</option>
                                            <option value="married" {{ old('marital_status') == 'married' ? 'selected' : '' }}>Marié(e)</option>
                                            <option value="divorced" {{ old('marital_status') == 'divorced' ? 'selected' : '' }}>Divorcé(e)</option>
                                            <option value="widowed" {{ old('marital_status') == 'widowed' ? 'selected' : '' }}>Veuf/Veuve</option>
                                            <option value="pacs" {{ old('marital_status') == 'pacs' ? 'selected' : '' }}>PACS</option>
                                            <option value="concubinage" {{ old('marital_status') == 'concubinage' ? 'selected' : '' }}>Concubinage</option>
                                        </select>
                                    </div>
                                </div>

                                <div style="margin-top: 1.5rem;">
                                    <h3 class="form-label" style="margin-bottom: 0.75rem;">
                                        Contact d'urgence
                                    </h3>
                                    <div class="form-grid form-grid-2">
                                        <div class="form-group">
                                            <label class="form-label">Nom et prénom</label>
                                            <input class="form-input"
                                                   type="text"
                                                   name="emergency_contact_name"
                                                   value="{{ old('emergency_contact_name') }}"
                                                   placeholder="Nom et prénom">
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Téléphone</label>
                                            <div class="form-input-icon">
                                                <div class="icon-wrapper">
                                                    <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                                                </div>
                                                <input class="form-input"
                                                       type="tel"
                                                       name="emergency_contact_phone"
                                                       value="{{ old('emergency_contact_phone') }}"
                                                       placeholder="06 12 34 56 78">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style="margin-top: 1.5rem;">
                                    <label class="form-label">Notes et commentaires</label>
                                    <textarea class="form-textarea"
                                              name="notes"
                                              placeholder="Informations complémentaires sur le locataire..."
                                              rows="3">{{ old('notes') }}</textarea>
                                </div>

                                <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                                    <button type="button" class="button button-primary" onclick="validateAndGo('infos', 'contact')">
                                        Suivant : Coordonnées
                                        <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Tab 2: Coordonnées -->
                            <div id="tab-contact" class="section" style="display: none;">
                                <h2 class="section-title">
                                    <i data-lucide="mail" style="width: 20px; height: 20px;"></i>
                                    Coordonnées
                                </h2>

                                <div class="form-grid form-grid-2">
                                    <div class="form-group">
                                        <label class="form-label">
                                            Email <span class="required">*</span>
                                        </label>
                                        <div class="form-input-icon">
                                            <div class="icon-wrapper">
                                                <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                                            </div>
                                            <input class="form-input @error('email') input-error @enderror"
                                                   type="email"
                                                   name="email"
                                                   value="{{ old('email') }}"
                                                   placeholder="jean.dupont@exemple.com"
                                                   required>
                                        </div>
                                        @error('email')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Téléphone <span class="required">*</span>
                                        </label>
                                        <div class="form-input-icon">
                                            <div class="icon-wrapper">
                                                <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                                            </div>
                                            <input class="form-input @error('phone') input-error @enderror"
                                                   type="tel"
                                                   name="phone"
                                                   value="{{ old('phone') }}"
                                                   placeholder="06 12 34 56 78"
                                                   required>
                                        </div>
                                        @error('phone')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Adresse <span class="required">*</span>
                                        </label>
                                        <div class="form-input-icon">
                                            <div class="icon-wrapper">
                                                <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
                                            </div>
                                            <input class="form-input @error('address') input-error @enderror"
                                                   type="text"
                                                   name="address"
                                                   value="{{ old('address') }}"
                                                   placeholder="123 Rue de la Paix"
                                                   required>
                                        </div>
                                        @error('address')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Code postal <span class="required">*</span>
                                        </label>
                                        <input class="form-input @error('zip_code') input-error @enderror"
                                               type="text"
                                               name="zip_code"
                                               value="{{ old('zip_code') }}"
                                               placeholder="75000"
                                               required>
                                        @error('zip_code')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Ville <span class="required">*</span>
                                        </label>
                                        <input class="form-input @error('city') input-error @enderror"
                                               type="text"
                                               name="city"
                                               value="{{ old('city') }}"
                                               placeholder="Paris"
                                               required>
                                        @error('city')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">
                                            Pays <span class="required">*</span>
                                        </label>
                                        <input class="form-input @error('country') input-error @enderror"
                                               type="text"
                                               name="country"
                                               value="{{ old('country', 'France') }}"
                                               placeholder="France"
                                               required>
                                        @error('country')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                                    <button type="button" class="button button-secondary" onclick="showTab('infos')">
                                        <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                        Précédent
                                    </button>
                                    <button type="button" class="button button-primary" onclick="validateAndGo('contact', 'pro')">
                                        Suivant : Situation professionnelle
                                        <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Tab 3: Situation professionnelle -->
                            <div id="tab-pro" class="section" style="display: none;">
                                <h2 class="section-title">
                                    <i data-lucide="briefcase" style="width: 20px; height: 20px;"></i>
                                    Situation professionnelle
                                </h2>

                                <div class="form-grid form-grid-2">
                                    <div class="form-group">
                                        <label class="form-label">
                                            Profession <span class="required">*</span>
                                        </label>
                                        <input class="form-input @error('profession') input-error @enderror"
                                               type="text"
                                               name="profession"
                                               value="{{ old('profession') }}"
                                               placeholder="Ex: Développeur web"
                                               required>
                                        @error('profession')
                                            <div class="field-error">
                                                <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                                <span>{{ $message }}</span>
                                            </div>
                                        @enderror
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">Employeur</label>
                                        <input class="form-input"
                                               type="text"
                                               name="employer"
                                               value="{{ old('employer') }}"
                                               placeholder="Nom de l'entreprise">
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">Revenu annuel (€)</label>
                                        <div class="form-input-icon">
                                            <div class="icon-wrapper">
                                                <i data-lucide="euro" style="width: 16px; height: 16px;"></i>
                                            </div>
                                            <input class="form-input"
                                                   type="number"
                                                   name="annual_income"
                                                   value="{{ old('annual_income') }}"
                                                   placeholder="45000"
                                                   min="0"
                                                   step="0.01">
                                        </div>
                                        <p class="helper-text">Optionnel</p>
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">Type de contrat</label>
                                        <select class="form-select" name="contract_type">
                                            <option value="">Sélectionner un type de contrat</option>
                                            <option value="cdi" {{ old('contract_type') == 'cdi' ? 'selected' : '' }}>CDI</option>
                                            <option value="cdd" {{ old('contract_type') == 'cdd' ? 'selected' : '' }}>CDD</option>
                                            <option value="interim" {{ old('contract_type') == 'interim' ? 'selected' : '' }}>Intérim</option>
                                            <option value="independant" {{ old('contract_type') == 'independant' ? 'selected' : '' }}>Indépendant</option>
                                            <option value="etudiant" {{ old('contract_type') == 'etudiant' ? 'selected' : '' }}>Étudiant</option>
                                            <option value="retraite" {{ old('contract_type') == 'retraite' ? 'selected' : '' }}>Retraité</option>
                                            <option value="autre" {{ old('contract_type') == 'autre' ? 'selected' : '' }}>Autre</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                                    <button type="button" class="button button-secondary" onclick="showTab('contact')">
                                        <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                        Précédent
                                    </button>
                                    <button type="button" class="button button-primary" onclick="validateAndGo('pro', 'garant')">
                                        Suivant : Garant
                                        <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Tab 4: Garant -->
                            <div id="tab-garant" class="section" style="display: none;">
                                <h2 class="section-title">
                                    <i data-lucide="user" style="width: 20px; height: 20px;"></i>
                                    Garant
                                </h2>

                                <div class="switch-item" style="margin-bottom: 1.5rem;">
                                    <div class="switch" id="hasGuarantorSwitch" onclick="toggleGuarantor()">
                                        <div class="switch-thumb"></div>
                                    </div>
                                    <span class="switch-label">Le locataire a-t-il un garant ?</span>
                                </div>

                                <div id="guarantorFields" style="display: none;">
                                    <div style="background: rgba(99,102,241,.08); padding: 1.5rem; border-radius: 14px; border: 1px solid rgba(99,102,241,.18); margin-bottom: 1.5rem;">
                                        <h3 class="form-label" style="margin-bottom: 1rem;">
                                            Informations du garant
                                        </h3>

                                        <div class="form-grid form-grid-2">
                                            <div class="form-group">
                                                <label class="form-label">
                                                    Nom et prénom <span class="required">*</span>
                                                </label>
                                                <input class="form-input"
                                                       type="text"
                                                       name="guarantor_name"
                                                       value="{{ old('guarantor_name') }}"
                                                       placeholder="Nom et prénom du garant">
                                            </div>

                                            <div class="form-group">
                                                <label class="form-label">
                                                    Téléphone <span class="required">*</span>
                                                </label>
                                                <div class="form-input-icon">
                                                    <div class="icon-wrapper">
                                                        <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                                                    </div>
                                                    <input class="form-input"
                                                           type="tel"
                                                           name="guarantor_phone"
                                                           value="{{ old('guarantor_phone') }}"
                                                           placeholder="06 12 34 56 78">
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label class="form-label">
                                                    Email <span class="required">*</span>
                                                </label>
                                                <div class="form-input-icon">
                                                    <div class="icon-wrapper">
                                                        <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                                                    </div>
                                                    <input class="form-input"
                                                           type="email"
                                                           name="guarantor_email"
                                                           value="{{ old('guarantor_email') }}"
                                                           placeholder="garant@exemple.com">
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label class="form-label">
                                                    Profession <span class="required">*</span>
                                                </label>
                                                <input class="form-input"
                                                       type="text"
                                                       name="guarantor_profession"
                                                       value="{{ old('guarantor_profession') }}"
                                                       placeholder="Profession du garant">
                                            </div>

                                            <div class="form-group">
                                                <label class="form-label">
                                                    Revenu annuel (€) <span class="required">*</span>
                                                </label>
                                                <div class="form-input-icon">
                                                    <div class="icon-wrapper">
                                                        <i data-lucide="euro" style="width: 16px; height: 16px;"></i>
                                                    </div>
                                                    <input class="form-input"
                                                           type="number"
                                                           name="guarantor_income"
                                                           value="{{ old('guarantor_income') }}"
                                                           placeholder="60000"
                                                           min="0"
                                                           step="0.01">
                                                </div>
                                            </div>

                                            <div class="form-group" style="grid-column: 1 / -1;">
                                                <label class="form-label">
                                                    Adresse <span class="required">*</span>
                                                </label>
                                                <input class="form-input"
                                                       type="text"
                                                       name="guarantor_address"
                                                       value="{{ old('guarantor_address') }}"
                                                       placeholder="Adresse complète du garant">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                                    <button type="button" class="button button-secondary" onclick="showTab('pro')">
                                        <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                        Précédent
                                    </button>

                                    <button type="button" class="button button-secondary" onclick="showTab('infos')">
                                        <i data-lucide="home" style="width: 16px; height: 16px;"></i>
                                        Retour au début
                                    </button>

                                    <button type="submit" class="button button-primary">
                                        <i data-lucide="save" style="width: 16px; height: 16px;"></i>
                                        Enregistrer le locataire
                                    </button>
                                </div>
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

    // Confirmation d'annulation
    function confirmCancel() {
        if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
            navigateTo('/coproprietaire/tenants');
        }
    }

    // Gestion des onglets
    function showTab(tabName) {
        ['infos', 'contact', 'pro', 'garant'].forEach(tab => {
            const element = document.getElementById(`tab-${tab}`);
            if (element) element.style.display = 'none';
        });

        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeTab = document.getElementById(`tab-${tabName}`);
        if (activeTab) activeTab.style.display = 'block';

        const activeBtn = Array.from(document.querySelectorAll('.tab-button')).find(btn =>
            btn.textContent.includes(tabName === 'infos' ? 'Informations' :
                                   tabName === 'contact' ? 'Coordonnées' :
                                   tabName === 'pro' ? 'professionnelle' : 'Garant')
        );
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Validation des onglets
    function validateAndGo(current, next) {
        let valid = true;
        const currentTab = document.getElementById(`tab-${current}`);

        const requiredInputs = currentTab.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                valid = false;
                input.classList.add('input-error');

                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('field-error')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'field-error';
                    errorDiv.innerHTML = `
                        <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                        <span>Ce champ est requis.</span>
                    `;
                    input.parentNode.insertBefore(errorDiv, input.nextSibling);
                    lucide.createIcons();
                }
            } else {
                input.classList.remove('input-error');
                if (input.nextElementSibling && input.nextElementSibling.classList.contains('field-error')) {
                    input.nextElementSibling.remove();
                }
            }
        });

        if (valid) {
            showTab(next);
        } else {
            alert('Merci de compléter les champs requis.');
        }
    }

    // Gestion du garant
    function toggleGuarantor() {
        const switchEl = document.getElementById('hasGuarantorSwitch');
        const fields = document.getElementById('guarantorFields');

        switchEl.classList.toggle('active');
        fields.style.display = switchEl.classList.contains('active') ? 'block' : 'none';
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
