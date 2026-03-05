@extends('layouts.co-owner')

@section('title', 'Documents du bail - ' . ($lease->property->name ?? 'Bien sans nom'))

@section('content')
<div class="content-container">
    <br><br>
    <div class="content-card">


        <div class="content-body">
            <div class="top-actions">
                <button onclick="history.back()" class="button button-secondary">
                    <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                    Retour aux baux
                </button>
                <div class="top-actions-right">
                    <a href="{{ route('co-owner.leases.documents.download', $lease) }}"
                        class="button button-primary">
                        <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                        Télécharger le contrat PDF
                    </a>
                    <a href="{{ route('co-owner.leases.documents.preview', $lease) }}" target="_blank"
                        class="button button-success">
                        <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                        Prévisualiser
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

            <!-- Informations du bail -->
            <div class="lease-info-card">
                <div class="lease-info-header">
                    <div class="lease-title">
                        <i data-lucide="home" style="width: 24px; height: 24px;"></i>
                        {{ $lease->property->name ?? 'Bien sans nom' }}
                        <span class="badge badge-active">
                            <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i>
                            Actif
                        </span>
                    </div>
                </div>

                <div class="lease-details">
                    <div class="detail-item">
                        <span class="detail-label">Locataire</span>
                        <span class="detail-value">
                            {{ $lease->tenant->first_name }} {{ $lease->tenant->last_name }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Loyer mensuel</span>
                        <span class="detail-value">
                            {{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Charges</span>
                        <span class="detail-value">
                            {{ number_format($lease->charges_amount, 0, ',', ' ') }} FCFA
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Début du bail</span>
                        <span class="detail-value">
                            {{ $lease->start_date->format('d/m/Y') }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Durée</span>
                        <span class="detail-value">
                            {{ $lease->end_date ? 'Déterminée' : 'Indéterminée' }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Type de bail</span>
                        <span class="detail-value">
                            {{ $lease->type === 'meuble' ? 'Meublé' : 'Non meublé' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Documents existants -->
            <div class="documents-section">
                <div class="documents-header"
                    style="
                        background: #70AE48;
                        color: #ffffff;
                        padding: 16px 20px;
                        border-radius: 14px;
                        box-shadow: 0 10px 25px rgba(29, 78, 216, 0.25);
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                    <i data-lucide="files" style="width: 22px; height: 22px;"></i>
                    <h2 class="section-title" style="margin: 0; font-weight: 600; color:#ffffff;">
                        Historique des documents
                    </h2>
                </div>

                @if(count($documents) == 0)
                    <div class="empty-state">
                        <i data-lucide="file-text" class="empty-state-icon" style="width: 64px; height: 64px;"></i>
                        <h3 class="empty-state-title">Aucun document généré</h3>
                        <p class="empty-state-text">Générez votre premier contrat de bail en cliquant sur "Télécharger le contrat PDF".</p>
                    </div>
                @else
                    <div class="documents-grid">
                        @foreach($documents as $document)
                            <div class="document-card">
                                <div class="document-header">
                                    <div class="document-icon">
                                        <i data-lucide="file-text" style="width: 24px; height: 24px;"></i>
                                    </div>
                                    <div class="document-info">
                                        <div class="document-name">{{ $document['original_name'] ?? $document['filename'] }}</div>
                                        <div class="document-meta">
                                            <span>{{ strtoupper($document['type'] ?? 'DOCUMENT') }}</span>
                                            <span>•</span>
                                            <span>{{ isset($document['created_at']) ? \Carbon\Carbon::parse($document['created_at'])->format('d/m/Y H:i') : 'Date inconnue' }}</span>
                                            @if(isset($document['size']))
                                                <span>•</span>
                                                <span>{{ round($document['size'] / 1024, 1) }} KB</span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                                <div class="document-actions">
                                    <a href="{{ route('co-owner.leases.documents.download', $lease) }}?regenerate=true"
                                        class="button button-secondary btn-sm">
                                        <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                                        Retélécharger
                                    </a>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
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

    .content-card {
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

    // Logout
    function logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
        }
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
        color: #70AE48;
        border: 2px solid rgba(67, 56, 202, .20);
    }

    .button-secondary:hover {
        background: rgba(67, 56, 202, .06);
    }

    .button-success {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        color: #fff;
        box-shadow: 0 14px 30px rgba(16, 185, 129, .22);
    }

    .button-success:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 18px 34px rgba(16, 185, 129, .28);
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

    .alert-success {
        background: rgba(240, 253, 244, .92);
        border-color: rgba(74, 222, 128, .30);
        color: #166534;
    }

    .alert-error {
        background: rgba(254, 242, 242, .92);
        border-color: rgba(248, 113, 113, .30);
        color: #991b1b;
    }

    .lease-info-card {
        background: rgba(255, 255, 255, .95);
        border: 2px solid rgba(102, 126, 234, .15);
        border-radius: 16px;
        padding: 1.75rem;
        margin-bottom: 2rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, .05);
    }

    .lease-info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .lease-title {
        font-size: 1.4rem;
        font-weight: 950;
        color: var(--ink);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .lease-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .detail-label {
        font-size: 0.85rem;
        font-weight: 850;
        color: var(--muted);
    }

    .detail-value {
        font-size: 1.1rem;
        font-weight: 950;
        color: var(--ink);
    }

    .documents-section {
        margin-top: 2rem;
    }

    .documents-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .section-title {
        font-size: 1.2rem;
        font-weight: 950;
        color: var(--ink);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .documents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .document-card {
        background: rgba(255, 255, 255, .95);
        border: 2px solid rgba(148, 163, 184, .15);
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
    }

    .document-card:hover {
        border-color: rgba(102, 126, 234, .35);
        box-shadow: 0 10px 30px rgba(102, 126, 234, .15);
        transform: translateY(-2px);
    }

    .document-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .document-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(59, 130, 246, .15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1d4ed8;
        flex-shrink: 0;
    }

    .document-info {
        flex: 1;
    }

    .document-name {
        font-size: 1rem;
        font-weight: 950;
        color: var(--ink);
        margin-bottom: 0.25rem;
        word-break: break-word;
    }

    .document-meta {
        font-size: 0.85rem;
        color: var(--muted);
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .document-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
        border-radius: 10px;
    }

    .btn-danger {
        background: rgba(239, 68, 68, .10);
        color: #dc2626;
        border: 2px solid rgba(239, 68, 68, .20);
    }

    .btn-danger:hover {
        background: rgba(239, 68, 68, .15);
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
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

    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 850;
    }

    .badge-active {
        background: rgba(34, 197, 94, .15);
        color: #166534;
        border: 1px solid rgba(34, 197, 94, .25);
    }
</style>
@endsection
