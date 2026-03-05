@extends('layouts.co-owner')

@section('title', $tenant->first_name . ' ' . $tenant->last_name . ' - Fiche Locataire')

@section('content')
<div class="content-container">
    <div class="top-actions">
        <a href="{{ route('co-owner.tenants.index') }}" class="button button-secondary" onclick="navigateTo('/coproprietaire/tenants'); return false;">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
            Retour à la liste
        </a>

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
 <div class="tenant-avatar" style="background: #70AE48 !important;">
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
                                {{ number_format($lease->rent_amount, 2) }} FCFA/mois
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
                    <i data-lucide="fcfa" style="width: 14px; height: 14px;"></i>
                    Revenu annuel
                </span>
                <span class="info-value">
                    @if($tenant->annual_income)
                        {{ number_format($tenant->annual_income, 2) }} FCFA
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

    .content-container {
        padding: 1.5rem;
        max-width: 84rem;
        margin: 0 auto;
    }

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
        let fullUrl = baseUrl + path;

        .tenant-header {
            flex-direction: column;
            text-align: center;
        }

        .tenant-meta {
            justify-content: center;
        }

        .property-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .info-grid {
            grid-template-columns: 1fr;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

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
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
</script>
@endsection
