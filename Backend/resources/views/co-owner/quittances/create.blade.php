@extends('layouts.co-owner')

@section('title', 'Créer une quittance - Co-propriétaire')

@section('content')
<div class="content-body">
    <div class="top-actions">
        <a href="{{ route('co-owner.quittances.index') }}" class="button button-back">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
            Retour à la liste
        </a>
    </div>

    @if(session('success'))
        <div class="alert-box alert-success">
            <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
            <div>
                <strong>Succès</strong>
                <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('success') }}</p>
            </div>
        </div>
    @endif

    @if(session('error'))
        <div class="alert-box alert-error">
            <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
            <div>
                <strong>Erreur</strong>
                <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('error') }}</p>
            </div>
        </div>
    @endif

    @if($leases->isEmpty())
        <div class="empty-state">
            <i data-lucide="home" class="empty-state-icon" style="width: 64px; height: 64px;"></i>
            <h3 class="empty-state-title">Aucun bail disponible</h3>
            <p class="empty-state-text">Vous devez avoir au moins un bail actif pour créer une quittance.</p>
            <a href="{{ route('co-owner.leases.index') }}" class="button button-primary">
                <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                Gérer les baux
            </a>
        </div>
    @else
        <div class="form-container">
            <form method="POST" action="{{ route('co-owner.quittances.store') }}">
                @csrf

                <div class="form-grid">
                    <!-- Sélection du bail -->
                    <div class="form-group">
                        <label for="lease_id" class="form-label">Sélectionner le bail *</label>
                        <select name="lease_id" id="lease_id" class="form-control @error('lease_id') is-invalid @enderror" required>
                            <option value="">-- Choisir un bail --</option>
                            @foreach($leases as $lease)
                                <option value="{{ $lease->id }}"
                                    data-property="{{ $lease->property->name }}"
                                    data-tenant="{{ $lease->tenant->first_name }} {{ $lease->tenant->last_name }}"
                                    data-rent="{{ number_format($lease->rent_amount, 2, ',', ' ') }}"
                                    {{ old('lease_id') == $lease->id ? 'selected' : '' }}>
                                    {{ $lease->property->name }} - {{ $lease->tenant->first_name }} {{ $lease->tenant->last_name }}
                                </option>
                            @endforeach
                        </select>
                        @error('lease_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">Choisissez le bail pour lequel créer la quittance</div>
                    </div>

                    <!-- Informations du bail -->
                    <div class="form-group">
                        <div class="info-card">
                            <h6><i data-lucide="info" style="width: 18px; height: 18px;"></i> Informations du bail</h6>
                            <div id="lease-info">
                                <p><i data-lucide="home" style="width: 16px; height: 16px;"></i> <strong>Bien:</strong> <span id="property-name">-</span></p>
                                <p><i data-lucide="user" style="width: 16px; height: 16px;"></i> <strong>Locataire:</strong> <span id="tenant-name">-</span></p>
                                <p><i data-lucide="credit-card" style="width: 16px; height: 16px;"></i> <strong>Loyer mensuel:</strong> <span id="rent-amount">-</span> FCFA</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-grid">
                    <!-- Mois payé -->
                    <div class="form-group">
                        <label for="paid_month" class="form-label">Mois payé *</label>
                        <input type="month"
                               name="paid_month"
                               id="paid_month"
                               class="form-control @error('paid_month') is-invalid @enderror"
                               value="{{ old('paid_month', date('Y-m')) }}"
                               required>
                        @error('paid_month')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">Mois correspondant au loyer payé</div>
                    </div>

                    <!-- Date d'émission -->
                    <div class="form-group">
                        <label for="issued_date" class="form-label">Date d'émission *</label>
                        <input type="date"
                               name="issued_date"
                               id="issued_date"
                               class="form-control @error('issued_date') is-invalid @enderror"
                               value="{{ old('issued_date', date('Y-m-d')) }}"
                               required>
                        @error('issued_date')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">Date à laquelle la quittance est émise</div>
                    </div>

                    <!-- Montant payé -->
                    <div class="form-group">
                        <label for="amount_paid" class="form-label">Montant payé (FCFA) *</label>
                        <input type="number"
                               step="0.01"
                               min="0"
                               name="amount_paid"
                               id="amount_paid"
                               class="form-control @error('amount_paid') is-invalid @enderror"
                               value="{{ old('amount_paid') }}"
                               placeholder="0.00"
                               required>
                        @error('amount_paid')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">Montant effectivement payé par le locataire</div>
                    </div>
                </div>

                <!-- Notes -->
                <div class="form-group">
                    <label for="notes" class="form-label">Notes (optionnel)</label>
                    <textarea name="notes"
                              id="notes"
                              class="form-control @error('notes') is-invalid @enderror"
                              rows="3"
                              placeholder="Notes complémentaires...">{{ old('notes') }}</textarea>
                    @error('notes')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                    <div class="form-text">Informations complémentaires sur ce paiement</div>
                </div>

                <!-- Option email -->
                <div class="form-check">
                    <input type="checkbox"
                           name="send_email"
                           id="send_email"
                           class="form-check-input"
                           value="1"
                           {{ old('send_email') ? 'checked' : '' }}>
                    <label for="send_email" class="form-check-label">
                        <i data-lucide="mail" style="width: 16px; height: 16px; margin-right: 0.5rem;"></i>
                        Envoyer automatiquement la quittance par email au locataire
                    </label>
                </div>

                <!-- Boutons -->
                <div class="form-actions">
                    <button type="submit" class="button button-primary">
                        <i data-lucide="file-plus" style="width: 16px; height: 16px;"></i>
                        Créer la quittance
                    </button>
                    <a href="{{ route('co-owner.quittances.index') }}" class="button button-secondary">
                        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    @endif
</div>



<style>
    /* Styles spécifiques à la page de création de quittance */
    :root {
        --gradA: #70AE48;
        --gradB: #8BC34A;
        --indigo: #70AE48;
        --violet: #8BC34A;
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

    .content-body {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;

    }

    .top-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
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

    .alert-success {
        background: rgba(112, 174, 72, 0.1);
        border-color: rgba(112, 174, 72, 0.3);
        color: #2e5e1e;
    }

    .alert-error {
        background: rgba(254,242,242,.92);
        border-color: rgba(248,113,113,.30);
        color: #991b1b;
    }

    .button {
        padding: 0.9rem 1.35rem;
        border-radius: 12px;
        font-weight: 700;
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
        background: #70AE48;
        color: #fff;
        box-shadow: 0 4px 12px rgba(112, 174, 72, 0.3);
    }

    .button-primary:hover {
        background: #5d8f3a;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(112, 174, 72, 0.4);
    }

    .button-secondary {
        background: white;
        color: #70AE48;
        border: 2px solid rgba(112, 174, 72, 0.3);
    }

    .button-secondary:hover {
        background: rgba(112, 174, 72, 0.05);
        border-color: #70AE48;
    }

    .button-back {
        background: white;
        color: #6B7280;
        border: 2px solid #E5E7EB;
    }

    .button-back:hover {
        background: #F9FAFB;
        color: #70AE48;
        border-color: #70AE48;
    }

    .form-container {
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .form-group {
        margin-bottom: 0;
    }

    .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 700;
        color: #1F2937;
        font-size: 0.9rem;
    }

    .form-control {
        width: 100%;
        padding: 0.85rem 1rem;
        border-radius: 12px;
        border: 2px solid #E5E7EB;
        background: white;
        font-size: 0.95rem;
        font-weight: 500;
        color: #1F2937;
        transition: all 0.2s ease;
    }

    .form-control:focus {
        outline: none;
        border-color: #70AE48;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .form-control.is-invalid {
        border-color: var(--red);
    }

    .invalid-feedback {
        color: var(--red);
        font-size: 0.8rem;
        font-weight: 600;
        margin-top: 0.25rem;
    }

    .form-text {
        color: #9CA3AF;
        font-size: 0.8rem;
        font-weight: 500;
        margin-top: 0.25rem;
    }

    .info-card {
        background: rgba(112, 174, 72, 0.05);
        border: 2px solid rgba(112, 174, 72, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
    }

    .info-card h6 {
        color: #70AE48;
        font-weight: 700;
        margin-bottom: 1rem;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .info-card p {
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: #1F2937;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .info-card p:last-child {
        margin-bottom: 0;
    }

    .info-card span {
        color: #6B7280;
        font-weight: 500;
        margin-left: 0.25rem;
    }

    .form-check {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 1.5rem 0;
        padding: 1rem;
        background: rgba(112, 174, 72, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(112, 174, 72, 0.2);
    }

    .form-check-input {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid #70AE48;
        cursor: pointer;
        appearance: none;
        position: relative;
    }

    .form-check-input:checked {
        background-color: #70AE48;
        border-color: #70AE48;
    }

    .form-check-input:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 2px;
    }

    .form-check-label {
        font-weight: 600;
        color: #1F2937;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .form-check-label i {
        color: #70AE48;
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        padding-top: 0;
        border-top: none;
           margin-bottom: 0% !important;
        padding-bottom: 0% !important;
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        border: 2px dashed #E5E7EB;
        border-radius: 20px;
        background: white;
    }

    .empty-state-icon {
        margin: 0 auto 1rem;
        width: 64px;
        height: 64px;
        color: #9CA3AF;
    }

    .empty-state-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: #4B5563;
        margin-bottom: 0.5rem;
    }

    .empty-state-text {
        color: #9CA3AF;
        font-weight: 500;
        margin-bottom: 1.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .content-body {
            padding: 1rem;
        }

        .form-container {
            padding: 1.5rem;
        }

        .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .form-actions {
            flex-direction: column;
        }

        .button {
            width: 100%;
            justify-content: center;
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

        .badge-paid {
            background: rgba(34,197,94,.15);
            color: #166534;
            border: 1px solid rgba(34,197,94,.25);
        }

        .badge-pending {
            background: rgba(245,158,11,.15);
            color: #92400e;
            border: 1px solid rgba(245,158,11,.25);
        }

        .badge-overdue {
            background: rgba(239,68,68,.15);
            color: #991b1b;
            border: 1px solid rgba(239,68,68,.25);
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
                            <i data-lucide="file-plus" style="width: 32px; height: 32px;"></i>
                            Créer une nouvelle quittance
                        </h1>
                        <p>Remplissez le formulaire pour créer une quittance de loyer</p>
                    </div>

                    <div class="content-body">
                        <div class="top-actions">
                            <a href="{{ route('co-owner.quittances.index') }}" class="button button-back">
                                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                                Retour à la liste
                            </a>
                        </div>

                        @if(session('success'))
                            <div class="alert-box alert-success">
                                <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Succès</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('success') }}</p>
                                </div>
                            </div>
                        @endif

                        @if(session('error'))
                            <div class="alert-box alert-error">
                                <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                                <div>
                                    <strong>Erreur</strong>
                                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('error') }}</p>
                                </div>
                            </div>
                        @endif

                        @if($leases->isEmpty())
                            <div class="empty-state">
                                <i data-lucide="home" class="empty-state-icon" style="width: 64px; height: 64px;"></i>
                                <h3 class="empty-state-title">Aucun bail disponible</h3>
                                <p class="empty-state-text">Vous devez avoir au moins un bail actif pour créer une quittance.</p>
                                <a href="{{ route('co-owner.leases.index') }}" class="button button-primary">
                                    <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                                    Gérer les baux
                                </a>
                            </div>
                        @else
                            <div class="form-container">
                                <form method="POST" action="{{ route('co-owner.quittances.store') }}">
                                    @csrf

                                    <div class="form-grid">
                                        <!-- Sélection du bail -->
                                        <div class="form-group">
                                            <label for="lease_id" class="form-label">Sélectionner le bail *</label>
                                            <select name="lease_id" id="lease_id" class="form-control @error('lease_id') is-invalid @enderror" required>
                                                <option value="">-- Choisir un bail --</option>
                                                @foreach($leases as $lease)
                                                    <option value="{{ $lease->id }}"
                                                        data-property="{{ $lease->property->name }}"
                                                        data-tenant="{{ $lease->tenant->first_name }} {{ $lease->tenant->last_name }}"
                                                        data-rent="{{ number_format($lease->rent_amount, 2, ',', ' ') }}"
                                                        {{ old('lease_id') == $lease->id ? 'selected' : '' }}>
                                                        {{ $lease->property->name }} - {{ $lease->tenant->first_name }} {{ $lease->tenant->last_name }}
                                                    </option>
                                                @endforeach
                                            </select>
                                            @error('lease_id')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">Choisissez le bail pour lequel créer la quittance</div>
                                        </div>

                                        <!-- Informations du bail -->
                                        <div class="form-group">
                                            <div class="info-card">
                                                <h6><i data-lucide="info" style="width: 18px; height: 18px;"></i> Informations du bail</h6>
                                                <div id="lease-info">
                                                    <p><i data-lucide="home" style="width: 16px; height: 16px;"></i> <strong>Bien:</strong> <span id="property-name">-</span></p>
                                                    <p><i data-lucide="user" style="width: 16px; height: 16px;"></i> <strong>Locataire:</strong> <span id="tenant-name">-</span></p>
                                                    <p><i data-lucide="credit-card" style="width: 16px; height: 16px;"></i> <strong>Loyer mensuel:</strong> <span id="rent-amount">-</span> FCFA</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-grid">
                                        <!-- Mois payé -->
                                        <div class="form-group">
                                            <label for="paid_month" class="form-label">Mois payé *</label>
                                            <input type="month"
                                                   name="paid_month"
                                                   id="paid_month"
                                                   class="form-control @error('paid_month') is-invalid @enderror"
                                                   value="{{ old('paid_month', date('Y-m')) }}"
                                                   required>
                                            @error('paid_month')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">Mois correspondant au loyer payé</div>
                                        </div>

                                        <!-- Date d'émission -->
                                        <div class="form-group">
                                            <label for="issued_date" class="form-label">Date d'émission *</label>
                                            <input type="date"
                                                   name="issued_date"
                                                   id="issued_date"
                                                   class="form-control @error('issued_date') is-invalid @enderror"
                                                   value="{{ old('issued_date', date('Y-m-d')) }}"
                                                   required>
                                            @error('issued_date')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">Date à laquelle la quittance est émise</div>
                                        </div>

                                        <!-- Montant payé -->
                                        <div class="form-group">
                                            <label for="amount_paid" class="form-label">Montant payé (FCFA) *</label>
                                            <input type="number"
                                                   step="0.01"
                                                   min="0"
                                                   name="amount_paid"
                                                   id="amount_paid"
                                                   class="form-control @error('amount_paid') is-invalid @enderror"
                                                   value="{{ old('amount_paid') }}"
                                                   placeholder="0.00"
                                                   required>
                                            @error('amount_paid')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">Montant effectivement payé par le locataire</div>
                                        </div>
                                    </div>

                                    <!-- Notes -->
                                    <div class="form-group">
                                        <label for="notes" class="form-label">Notes (optionnel)</label>
                                        <textarea name="notes"
                                                  id="notes"
                                                  class="form-control @error('notes') is-invalid @enderror"
                                                  rows="3"
                                                  placeholder="Notes complémentaires...">{{ old('notes') }}</textarea>
                                        @error('notes')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                        <div class="form-text">Informations complémentaires sur ce paiement</div>
                                    </div>

                                    <!-- Option email -->
                                    <div class="form-check">
                                        <input type="checkbox"
                                               name="send_email"
                                               id="send_email"
                                               class="form-check-input"
                                               value="1"
                                               {{ old('send_email') ? 'checked' : '' }}>
                                        <label for="send_email" class="form-check-label">
                                            <i data-lucide="mail" style="width: 16px; height: 16px; margin-right: 0.5rem;"></i>
                                            Envoyer automatiquement la quittance par email au locataire
                                        </label>
                                    </div>

                                    <!-- Boutons -->
                                    <div class="form-actions">
                                        <button type="submit" class="button button-primary">
                                            <i data-lucide="file-plus" style="width: 16px; height: 16px;"></i>
                                            Créer la quittance
                                        </button>
                                        <a href="{{ route('co-owner.quittances.index') }}" class="button button-secondary">
                                            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                                            Annuler
                                        </a>
                                    </div>
                                </form>
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
                                  path.includes('/notices') ||
                                  path.includes('/quittances') ||
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

        // Mise à jour des informations du bail
        const leaseSelect = document.getElementById('lease_id');
        const propertyName = document.getElementById('property-name');
        const tenantName = document.getElementById('tenant-name');
        const rentAmount = document.getElementById('rent-amount');
        const amountPaid = document.getElementById('amount_paid');

        // Mettre à jour les informations du bail
        leaseSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];

            if (selectedOption.value) {
                propertyName.textContent = selectedOption.getAttribute('data-property');
                tenantName.textContent = selectedOption.getAttribute('data-tenant');
                rentAmount.textContent = selectedOption.getAttribute('data-rent');

                // Pré-remplir le montant payé avec le loyer
                const rentValue = selectedOption.getAttribute('data-rent').replace(/\s/g, '').replace(',', '.');
                amountPaid.value = parseFloat(rentValue) || '';
            } else {
                propertyName.textContent = '-';
                tenantName.textContent = '-';
                rentAmount.textContent = '-';
                amountPaid.value = '';
            }
        });

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
@endsection
