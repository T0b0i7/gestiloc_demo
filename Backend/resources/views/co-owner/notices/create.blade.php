@extends('layouts.co-owner')

@section('title', 'Créer un préavis - Co-propriétaire')

@section('content')
<div class="content-container">
    <div class="content-card">


        <div class="content-body">
            <div class="top-actions">
                <a href="{{ route('co-owner.notices.index') }}" class="button button-secondary">
                    <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                    Retour à la liste
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

            <form method="POST" action="{{ route('co-owner.notices.store') }}" class="form-card">
                @csrf

                <!-- Sélection du bail -->
                <div class="form-group">
                    <label class="form-label">
                        <i data-lucide="file-text" style="width: 16px; height: 16px;"></i> Bail concerné *
                    </label>
                    <select name="lease_id" id="leaseSelect" class="form-control form-select" required onchange="updateLeaseInfo(this.value)">
                        <option value="">Sélectionnez un bail</option>
                        @foreach($leases as $lease)
                            <option value="{{ $lease->id }}" data-lease="{{ json_encode($lease->toArray()) }}">
                                {{ $lease->property->address ?? 'Bien sans nom' }} - {{ $lease->tenant->user->name ?? 'Locataire' }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Informations du bail sélectionné -->
                <div id="leaseInfo" class="lease-info" style="display: none;">
                    <h3><i data-lucide="info" style="width: 16px; height: 16px;"></i> Informations du bail</h3>
                    <div id="leaseDetails" class="lease-details"></div>
                </div>

                <!-- Type de préavis -->
                <div class="form-group">
                    <label class="form-label">
                        <i data-lucide="user" style="width: 16px; height: 16px;"></i> Type de préavis *
                    </label>
                    <select name="type" class="form-control form-select" required>
                        <option value="">Sélectionnez le type</option>
                        <option value="landlord">Préavis bailleur</option>
                        <option value="tenant">Préavis locataire</option>
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
                                   value="{{ old('notice_date', date('Y-m-d')) }}" required>
                        </div>
                        <div>
                            <label class="form-label">
                                <i data-lucide="calendar" style="width: 16px; height: 16px;"></i> Date de fin *
                            </label>
                            <input type="date" name="end_date" class="form-control"
                                   value="{{ old('end_date', date('Y-m-d', strtotime('+3 months'))) }}" required>
                        </div>
                    </div>
                </div>

                <!-- Motif -->
                <div class="form-group">
                    <label class="form-label">
                        <i data-lucide="message-square" style="width: 16px; height: 16px;"></i> Motif *
                    </label>
                    <textarea name="reason" class="form-control form-textarea"
                              placeholder="Détaillez le motif du préavis..." required>{{ old('reason') }}</textarea>
                </div>

                <!-- Notes -->
                <div class="form-group">
                    <label class="form-label">
                        <i data-lucide="file-text" style="width: 16px; height: 16px;"></i> Notes additionnelles
                    </label>
                    <textarea name="notes" class="form-control form-textarea"
                              placeholder="Informations complémentaires...">{{ old('notes') }}</textarea>
                </div>

               <div class="form-group"
     style="display: flex !important;
            flex-direction: row !important;
            justify-content: flex-end !important;
            align-items: center !important;
            flex-wrap: nowrap !important;
            gap: 1rem !important;
            width: 100% !important;
            margin-top: 2rem !important;">

    <button type="submit"
            class="button button-primary"
            style="width: auto !important; flex: 0 0 auto !important;">
        <i data-lucide="check" style="width:16px;height:16px;"></i>
        Créer le préavis
    </button>

    <a href="{{ route('co-owner.notices.index') }}"
       class="button button-secondary"
       style="width: auto !important; flex: 0 0 auto !important;">
        <i data-lucide="x" style="width:16px;height:16px;"></i>
        Annuler
    </a>

</div>

            </form>
        </div>
    </div>
</div>

<style>
    /* Styles spécifiques à cette page */
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

    .content-container {
        min-height: 100vh;
        background: #ffffff;
        padding: 2rem;
        position: relative;
    }

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
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

        // Récupérer les données des baux depuis le template
        const leases = @json($leases->keyBy('id')->toArray());

        // Fonction pour mettre à jour les informations du bail
        window.updateLeaseInfo = function(leaseId) {
            const infoDiv = document.getElementById('leaseInfo');
            const detailsDiv = document.getElementById('leaseDetails');

            if (!leaseId) {
                infoDiv.style.display = 'none';
                return;
            }

            const lease = leases[leaseId];
            if (!lease) {
                infoDiv.style.display = 'none';
                return;
            }

            // Formater la date de début
            const startDate = lease.start_date ? new Date(lease.start_date).toLocaleDateString('fr-FR') : 'Non spécifié';

          const monthlyRent = !isNaN(lease?.rent_amount)
    ? new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(Number(lease.rent_amount))
    : 'Non spécifié';


            detailsDiv.innerHTML = `
                <div class="detail-item">
                    <div class="detail-label">Bien</div>
                    <div class="detail-value">${lease.property?.address || 'Non spécifié'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Locataire</div>
                    <div class="detail-value">
  ${lease.tenant
      ? `${lease.tenant.first_name ?? ''} ${lease.tenant.last_name ?? ''}`.trim()
      : 'Non spécifié'}
</div>

                </div>
                <div class="detail-item">
                    <div class="detail-label">Loyer mensuel</div>
                    <div class="detail-value">${monthlyRent}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Début du bail</div>
                    <div class="detail-value">${startDate}</div>
                </div>
            `;

            infoDiv.style.display = 'block';
        }

        // Initialiser avec la valeur précédente si elle existe
        const selectedLeaseId = document.querySelector('select[name="lease_id"]').value;
        if (selectedLeaseId) {
            updateLeaseInfo(selectedLeaseId);
        }

        // Validation des dates
        const noticeDateInput = document.querySelector('input[name="notice_date"]');
        const endDateInput = document.querySelector('input[name="end_date"]');

        if (noticeDateInput && endDateInput) {
            endDateInput.addEventListener('change', function() {
                const noticeDate = new Date(noticeDateInput.value);
                const endDate = new Date(this.value);

                if (endDate <= noticeDate) {
                    this.classList.add('input-error');
                    alert('La date de fin doit être après la date du préavis.');
                } else {
                    this.classList.remove('input-error');
                }
            });
        }

        // Ajouter la classe pour les erreurs
        const style = document.createElement('style');
        style.textContent = `
            .input-error {
                border-color: rgba(239,68,68,.72) !important;
                box-shadow: 0 0 0 3px rgba(239,68,68,.15) !important;
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
@endsection
