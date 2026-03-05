@extends('layouts.co-owner')

@section('title', 'Contrats de bail - Co-propriétaire')

@section('content')
<div class="leases-container">
    <!-- Header -->
    <div class="leases-header">
        <div class="header-content">
            <h1>Contrats de bail</h1>
            <p class="subtitle">Générez automatiquement vos contrats de bail personnalisés en quelques clics.<br>Documents conformes et prêts à signer.</p>
        </div>
        <a href="{{ route('co-owner.assign-property.create') }}" class="btn-new-lease">
            <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
            Contrat de bail
        </a>
    </div>

    <!-- Filtres -->
    <div class="filters-section">
        <div class="filters-card">
            <h3 class="filters-title">FILTRER PAR BIEN</h3>

            <form method="GET" action="{{ route('co-owner.leases.index') }}" class="filters-form">
                <div class="filter-row">
                    <div class="filter-select-wrapper">
                        <select name="property_id" class="filter-select" onchange="this.form.submit()">
                            <option value="all" {{ request('property_id') == 'all' || !request('property_id') ? 'selected' : '' }}>Tous les biens</option>
                            @foreach($properties as $property)
                                <option value="{{ $property->id }}" {{ request('property_id') == $property->id ? 'selected' : '' }}>
                                    {{ $property->name }}
                                </option>
                            @endforeach
                        </select>
                        <i data-lucide="chevron-down" class="select-icon"></i>
                    </div>
                </div>

                <div class="filter-row search-row">
                    <div class="search-input-wrapper">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text"
                               name="search"
                               class="search-input"
                               placeholder="Rechercher"
                               value="{{ request('search') }}">
                    </div>
                    <button type="submit" class="btn-display">
                        <i data-lucide="settings" style="width: 16px; height: 16px;"></i>
                        Affichage
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Liste des contrats -->
    <div class="contracts-grid">
        @forelse($leases as $lease)
            <div class="contract-card">
                <!-- Type de bail -->
                <div class="contract-type">
                    {{ $lease->type == 'furnished' ? 'BAIL MEUBLÉ' : "BAIL D'HABITATION NU" }}
                </div>

                <!-- Titre du contrat -->
                <h3 class="contract-title">Contrat - {{ $lease->tenant->first_name }} {{ $lease->tenant->last_name }}</h3>

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

                <!-- Détails financiers et dates -->
                <div class="contract-details">
                    <div class="detail-group">
                        <div class="detail-label">LOYER MENSUEL</div>
                        <div class="detail-value">{{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">DÉPÔT DE GARANTIE</div>
                        <div class="detail-value">{{ number_format($lease->deposit_amount ?? $lease->rent_amount * 2, 0, ',', ' ') }} FCFA</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">DATE DE DÉBUT</div>
                        <div class="detail-value">{{ $lease->start_date->format('d M Y') }}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">DATE DE FIN</div>
                        <div class="detail-value">{{ $lease->end_date->format('d M Y') }}</div>
                    </div>
                </div>

                <!-- Statut et actions -->
                <div class="contract-footer">
                    @php
                        $now = now();
                        $isActive = $lease->start_date <= $now && $lease->end_date >= $now;
                        $isPending = $lease->start_date > $now;
                    @endphp

                    @if($isActive)
                        <span class="status-badge status-active">
                            <i data-lucide="check" style="width: 12px; height: 12px;"></i>
                            Actif
                        </span>
                    @elseif($isPending)
                        <span class="status-badge status-pending">
                            <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
                            En attente de signature
                        </span>
                    @else
                        <span class="status-badge status-expired">
                            <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                            Expiré
                        </span>
                    @endif

                    <div class="contract-actions">



                        <a href="{{ route('co-owner.leases.documents.index', $lease) }}" class="action-btn btn-edit" title="Modifier">
                           <i data-lucide="download" style="width: 16px; height: 16px;"></i>
                        </a>

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

    /* Header */
    .leases-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        gap: 2rem;
    }

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
        let fullUrl = baseUrl + path;

        .search-row {
            flex-direction: column;
        }

        .btn-display {
            width: 100%;
            justify-content: center;
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
