@extends('layouts.co-owner')

@section('title', 'Liste des Locataires')

@section('content')
    <div class="dashboard-container">
        <div class="dashboard-card">
            <!-- Header -->
            <div class="dashboard-header">
                <div class="header-art" aria-hidden="true">
                    <!-- Art background (optional) -->
                </div>

                <div class="header-row">
                    <div>
                        <h1>
                            Liste des locataires
                        </h1>
                        <p>Créez un nouveau contrat entre un bien et un locataire</p>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs-container" style="margin-bottom: 16px;">
                    <div class="tabs" style="display: flex; gap: 10px;">

                        <a href="{{ route('co-owner.tenants.index', array_merge(request()->except('status'), ['status' => 'active'])) }}"
                            style="
               padding: 10px 18px;
               border-radius: 8px;
               font-weight: 600;
               font-size: 14px;
               text-decoration: none;
               transition: all 0.2s ease;
               background-color:  #70AE48;
               color: #ffffff;
               border: 1px solid #000000;
               box-shadow: {{ $status === 'active' ? '0 4px 10px rgba(5,150,105,0.3)' : 'none' }};
           "
                            onmouseover="this.style.backgroundColor='#377df4'; this.style.color='#fff'"
                            onmouseout="this.style.backgroundColor='{{ $status === 'active' ? '#377df4' : '#ECFDF5' }}'; this.style.color='{{ $status === 'active' ? '#fff' : '#065F46' }}'">
                            Actifs
                        </a>

                        <a href="{{ route('co-owner.tenants.index', array_merge(request()->except('status'), ['status' => 'archived'])) }}"
                            style="
               padding: 10px 18px;
               border-radius: 8px;
               font-weight: 600;
               font-size: 14px;
               text-decoration: none;
               transition: all 0.2s ease;
               background-color: {{ $status === 'archived' ? '#059669' : '#ECFDF5' }};
               color: {{ $status === 'archived' ? '#ffffff' : '#065F46' }};
               border: 1px solid #059669;
               box-shadow: {{ $status === 'archived' ? '0 4px 10px rgba(5,150,105,0.3)' : 'none' }};
           "
                            onmouseover="this.style.backgroundColor='#059669'; this.style.color='#fff'"
                            onmouseout="this.style.backgroundColor='{{ $status === 'archived' ? '#059669' : '#ECFDF5' }}'; this.style.color='{{ $status === 'archived' ? '#fff' : '#065F46' }}'">
                            Archives
                        </a>

                    </div>
                </div>

                @if (session('success'))
                    <div
                        style="margin-bottom: 1rem; background: rgba(236,253,245,.92); border: 1px solid rgba(16,185,129,.30); border-radius: 14px; padding: 12px 14px; color: #065f46; font-weight: 950; display: flex; align-items: center; gap: 10px;">
                        <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>
                        <span>{{ session('success') }}</span>
                    </div>
                @endif

                @if (session('error'))
                    <div
                        style="margin-bottom: 1rem; background: rgba(255,241,242,.92); border: 1px solid rgba(244,63,94,.30); border-radius: 14px; padding: 12px 14px; color: #9f1239; font-weight: 950; display: flex; align-items: center; gap: 10px;">
                        <i data-lucide="alert-circle" style="width: 18px; height: 18px;"></i>
                        <span>{{ session('error') }}</span>
                    </div>
                @endif

            </div>

            <div class="dashboard-body">
                <!-- Actions buttons -->
                <div class="top-actions">
                    <a href="#" class="btn-back" onclick="goToReact('/coproprietaire/dashboard'); return false;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Retour au tableau de bord
                    </a>
                    <a href="{{ route('co-owner.tenants.create') }}" class="btn-primary" style="background-color: #70AE48;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Créer un locataire
                    </a>
                </div>

                <!-- Filter Section -->
                <div class="filters-section">
                    <div class="filters-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                        FILTRER - UTILISEZ LES OPTIONS CI-DESSOUS
                    </div>

                    <form method="GET" action="{{ route('co-owner.tenants.index') }}" id="filter-form">
                        <input type="hidden" name="status" value="{{ $status }}">

                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>Bien</label>
                                <select name="property_id" class="filter-select" onchange="this.form.submit()">
                                    <option value="">Tous les biens</option>
                                    @foreach ($delegatedProperties as $property)
                                        @if ($property)
                                            <option value="{{ $property->id }}"
                                                {{ $propertyId == $property->id ? 'selected' : '' }}>
                                                {{ $property->name ?? 'Bien #' . $property->id }}
                                            </option>
                                        @endif
                                    @endforeach
                                </select>
                            </div>

                            <div class="filter-group">
                                <label>Lignes par page</label>
                                <select name="per_page" class="filter-select" onchange="this.form.submit()">
                                    <option value="10" {{ $perPage == 10 ? 'selected' : '' }}>10 lignes</option>
                                    <option value="20" {{ $perPage == 20 ? 'selected' : '' }}>20 lignes</option>
                                    <option value="50" {{ $perPage == 50 ? 'selected' : '' }}>50 lignes</option>
                                    <option value="100" {{ $perPage == 100 ? 'selected' : '' }}>100 lignes</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Search and Actions -->
                <form method="GET" action="{{ route('co-owner.tenants.index') }}" class="search-actions">
                    <input type="hidden" name="status" value="{{ $status }}">
                    <input type="hidden" name="property_id" value="{{ $propertyId }}">
                    <input type="hidden" name="per_page" value="{{ $perPage }}">

                    <div class="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input type="text" name="search" placeholder="Rechercher" class="search-input"
                            value="{{ $search }}" onkeyup="if(event.keyCode === 13) this.form.submit()">
                    </div>

                    <button type="submit" class="btn-view">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M21 9H3M9 21V9" />
                        </svg>
                        Affichage
                    </button>
                </form>

                <!-- Tenant List -->
                <div class="tenants-list-section">
                    @if ($tenants && $tenants->count() > 0)
                        <!-- Results info -->
                        <div class="results-info">
                            <p>{{ $tenants->total() }} résultat(s) trouvé(s)</p>
                        </div>

                        <div class="table-container">
                            <table class="tenants-table">
                                <thead>
                                    <tr>
                                        <th>Locataire</th>
                                        <th>Type</th>
                                        <th>Bien</th>
                                        <th>Téléphone</th>
                                        <th>Email</th>
                                        <th>Solde</th>
                                        <th>Etat</th>
                                        <th>Invitation</th>
                                        <th>Modèle</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($tenants as $tenant)
                                        @php
                                            // Récupérer email et téléphone depuis user ou meta
                                            $tenantEmail =
                                                $tenant->user->email ?? ($tenant->meta['email'] ?? 'Non renseigné');
                                            $tenantPhone =
                                                $tenant->user->phone ?? ($tenant->meta['phone'] ?? 'Non renseigné');

                                            // Récupérer le type de locataire EXACT depuis la base
                                            $tenantType = $tenant->tenant_type ?? 'Non renseigné';

                                            // Récupérer le bien associé
                                            $property = null;
                                            if ($tenant->leases && $tenant->leases->count() > 0) {
                                                $property = $tenant->leases->first()->property ?? null;
                                            }

                                            // Statut de l'invitation - vérifier dans tenant_invitations
$invitation = null;
$invitationStatus = 'unknown';

if (isset($tenant->meta['invitation_id'])) {
    $invitation = \App\Models\TenantInvitation::find(
        $tenant->meta['invitation_id'],
    );
    if ($invitation) {
        if ($invitation->accepted_at) {
            $invitationStatus = 'accepted';
        } elseif ($invitation->expires_at < now()) {
            $invitationStatus = 'expired';
        } else {
            $invitationStatus = 'pending';
        }
    }
}

$invitationBadge = match ($invitationStatus) {
    'accepted' => '<span class="status-badge active">✅ Acceptée</span>',
    'pending' => '<span class="status-badge pending">⏳ En attente</span>',
    'expired' => '<span class="status-badge expired">❌ Expirée</span>',
    default => '<span class="status-badge unknown">❓ Inconnue</span>',
                                            };
                                        @endphp
                                        <tr>
                                            <td>
                                                <div class="tenant-name">
                                                    <strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="badge type-badge">
                                                    {{ ucfirst($tenantType) }}
                                                </span>
                                            </td>
                                            <td>
                                                @if ($property)
                                                    {{ $property->name ?? 'Bien #' . $property->id }}
                                                @else
                                                    <span class="text-muted">Aucun bien</span>
                                                @endif
                                            </td>
                                            <td>
                                                {{ $tenantPhone }}
                                            </td>
                                            <td>
                                                {{ $tenantEmail }}
                                            </td>
                                            <td>
                                                <span class="balance">0 FCFA</span>
                                            </td>
                                            <td>
                                                @if ($status === 'active')
                                                    <span class="status-badge active">Actif</span>
                                                @else
                                                    <span class="status-badge archived">Archivé</span>
                                                @endif
                                            </td>
                                            <td>
                                                {!! $invitationBadge !!}
                                            </td>
                                            <td>
                                                <span class="model-count">{{ $tenant->leases->count() }} Bail(s)</span>
                                            </td>
                                            <td>
                                                <div class="action-buttons">
                                                    <a href="{{ route('co-owner.tenants.show', $tenant) }}"
                                                        class="btn-action">
                                                        Voir
                                                    </a>
                                                    @if ($status === 'active')
                                                        <button type="button" class="btn-action btn-archive"
                                                            onclick="showArchiveConfirmation('{{ $tenant->id }}', '{{ $tenant->first_name }} {{ $tenant->last_name }}')">
                                                            Archiver
                                                        </button>
                                                    @else
                                                        <button type="button" class="btn-action btn-restore"
                                                            onclick="showRestoreConfirmation('{{ $tenant->id }}', '{{ $tenant->first_name }} {{ $tenant->last_name }}')">
                                                            Restaurer
                                                        </button>
                                                    @endif
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        @if ($tenants->hasPages())
                            <div class="pagination">
                                {{ $tenants->appends([
                                        'status' => $status,
                                        'search' => $search,
                                        'property_id' => $propertyId,
                                        'per_page' => $perPage,
                                    ])->links('vendor.pagination.custom') }}
                            </div>
                        @endif

                        <!-- Add tenant button at bottom -->
                        <div class="add-tenant-bottom">
                            <a href="{{ route('co-owner.tenants.create') }}" class="btn-add-tenant">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Ajouter un locataire
                            </a>
                        </div>
                    @else
                        <!-- Empty state -->
                        <div class="empty-state">
                            <div class="empty-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>Aucun locataire trouvé</h3>
                            <p>Vous pouvez inviter vos locataires pour leur donner accès à la zone membres.</p>
                            <a href="{{ route('co-owner.tenants.create') }}" class="btn-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Créer un locataire
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirmationModal" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3 id="modalTitle">Confirmation</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="modalIcon" class="modal-icon"></div>
                <p id="modalMessage"></p>
                <div id="modalDetails" class="modal-details"></div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-cancel" onclick="closeModal()">Annuler</button>
                <form id="actionForm" method="POST" style="display: inline;">
                    @csrf
                    @method('PUT')
                    <button type="submit" class="modal-btn modal-btn-confirm" id="confirmBtn"></button>
                </form>
            </div>
        </div>
    </div>

    <style>
        /* Base styles */
        :root {
            --primary: #10B981;
            --primary-dark: #059669;
            --secondary: #3B82F6;
            --light-bg: #F9FAFB;
            --border-color: #E5E7EB;
            --text-primary: #111827;
            --text-secondary: #6B7280;
            --text-muted: #9CA3AF;
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
            --white: #FFFFFF;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--light-bg);
            color: var(--text-primary);
        }

        .dashboard-container {
            min-height: 100vh;
            padding: 24px;
        }

        .dashboard-card {
            background: var(--white);
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            overflow: hidden;
        }

        /* Header */
        .dashboard-header {
            color: rgb(0, 0, 0);
            padding: 32px 32px 0 32px;
            position: relative;
        }

        .dashboard-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }

        .dashboard-header p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 32px;
        }

        /* Tabs */
        .tabs-container {
            margin-top: 24px;
        }

        /* Body */
        .dashboard-body {
            padding: 32px;
        }

        /* Top Actions */
        .top-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: var(--white);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn-back:hover {
            background: #F3F4F6;
            border-color: #D1D5DB;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: var(--primary);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: background 0.2s;
            cursor: pointer;
        }

        .btn-primary:hover {
            background: var(--primary-dark);
        }

        /* Filters Section */
        .filters-section {
            background: #F8FAFC;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }

        .filters-title {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
        }

        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .filter-group label {
            display: block;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .filter-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 14px;
            color: var(--text-primary);
            background: white;
            cursor: pointer;
            transition: border-color 0.2s;
        }

        .filter-select:hover {
            border-color: #9CA3AF;
        }

        .filter-select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        /* Search and Actions */
        .search-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            width: 300px;
        }

        .search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            color: var(--text-primary);
        }

        .search-input::placeholder {
            color: var(--text-muted);
        }

        .btn-view {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-view:hover {
            background: #F3F4F6;
        }

        /* Results info */
        .results-info {
            margin-bottom: 16px;
            color: var(--text-secondary);
            font-size: 14px;
        }

        /* Table */
        .table-container {
            overflow-x: auto;
            margin-bottom: 24px;
        }

        .tenants-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .tenants-table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: var(--text-secondary);
            border-bottom: 2px solid var(--border-color);
            white-space: nowrap;
        }

        .tenants-table td {
            padding: 16px;
            border-bottom: 1px solid var(--border-color);
            vertical-align: middle;
        }

        .tenants-table tbody tr:hover {
            background: #F9FAFB;
        }

        .text-muted {
            color: var(--text-muted);
            font-style: italic;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
        }

        .type-badge {
            background: #EFF6FF;
            color: #1D4ED8;
            border: 1px solid #BFDBFE;
        }

        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-badge.active {
            background: #D1FAE5;
            color: #065F46;
            border: 1px solid #A7F3D0;
        }

        .status-badge.archived {
            background: #FEF3C7;
            color: #92400E;
            border: 1px solid #FDE68A;
        }

        .status-badge.pending {
            background: #FEF3C7;
            color: #92400E;
            border: 1px solid #FDE68A;
        }

        .status-badge.expired {
            background: #FEE2E2;
            color: #991B1B;
            border: 1px solid #FECACA;
        }

        .status-badge.unknown {
            background: #E5E7EB;
            color: #374151;
            border: 1px solid #D1D5DB;
        }

        .balance {
            color: var(--text-primary);
            font-weight: 600;
        }

        .model-count {
            color: var(--text-secondary);
        }

        /* Action buttons */
        .action-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .btn-action {
            padding: 6px 12px;
            background: #F3F4F6;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            color: var(--text-primary);
            font-size: 12px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
            font-family: inherit;
        }

        .btn-action:hover {
            background: #E5E7EB;
        }

        .btn-archive {
            background: #FEF3C7;
            color: #92400E;
            border: 1px solid #FDE68A;
        }

        .btn-archive:hover {
            background: #FDE68A;
        }

        .btn-restore {
            background: #D1FAE5;
            color: #065F46;
            border: 1px solid #A7F3D0;
        }

        .btn-restore:hover {
            background: #A7F3D0;
        }

        /* Pagination */
        .pagination {
            display: flex;
            justify-content: center;
            margin: 24px 0;
        }

        .pagination ul {
            display: flex;
            list-style: none;
            gap: 8px;
        }

        .pagination li {
            margin: 0;
        }

        .pagination a,
        .pagination span {
            display: inline-block;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            text-decoration: none;
            color: var(--text-secondary);
            font-size: 14px;
        }

        .pagination a:hover {
            background: #F3F4F6;
        }

        .pagination .active span {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        /* Add tenant bottom */
        .add-tenant-bottom {
            text-align: center;
            padding: 24px;
            border-top: 1px solid var(--border-color);
        }

        .btn-add-tenant {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: white;
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn-add-tenant:hover {
            border-color: var(--primary);
            color: var(--primary);
            background: #F0FDF4;
        }

        /* Empty state */
        .empty-state {
            text-align: center;
            padding: 64px 24px;
            background: #F9FAFB;
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            margin: 24px 0;
        }

        .empty-icon {
            margin-bottom: 24px;
            color: var(--text-muted);
        }

        .empty-state h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
        }

        .empty-state p {
            color: var(--text-secondary);
            margin-bottom: 24px;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }

        /* Modal Styles */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        }

        .modal-container {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            animation: slideIn 0.3s ease;
            overflow: hidden;
        }

        .modal-header {
            padding: 24px 24px 16px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
        }

        .modal-close:hover {
            background: #F3F4F6;
            color: var(--text-primary);
        }

        .modal-body {
            padding: 24px;
            text-align: center;
        }

        .modal-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 32px;
        }

        .modal-icon.archive {
            background: #FEF3C7;
            color: #92400E;
        }

        .modal-icon.restore {
            background: #D1FAE5;
            color: #065F46;
        }

        .modal-body p {
            font-size: 16px;
            color: var(--text-primary);
            line-height: 1.5;
            margin-bottom: 16px;
        }

        .modal-details {
            background: #F9FAFB;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
        }

        .modal-details strong {
            color: var(--text-primary);
            font-weight: 600;
        }

        .modal-footer {
            padding: 16px 24px 24px;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .modal-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .modal-btn-cancel {
            background: white;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
        }

        .modal-btn-cancel:hover {
            background: #F3F4F6;
        }

        .modal-btn-confirm {
            background: var(--primary);
            color: white;
            border: 1px solid var(--primary);
        }

        .modal-btn-confirm:hover {
            background: var(--primary-dark);
        }

        /* Animation */
        @keyframes fadeIn {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .dashboard-container {
                padding: 12px;
            }

            .dashboard-body {
                padding: 20px;
            }

            .filters-grid {
                grid-template-columns: 1fr;
            }

            .search-actions {
                flex-direction: column;
                gap: 16px;
                align-items: stretch;
            }

            .search-box {
                width: 100%;
            }

            .top-actions {
                flex-direction: column;
                gap: 12px;
                align-items: stretch;
            }

            .tenants-table {
                display: block;
            }

            .tenants-table th,
            .tenants-table td {
                padding: 12px 8px;
                font-size: 13px;
            }

            .action-buttons {
                flex-direction: column;
            }

            .btn-action {
                width: 100%;
                text-align: center;
            }

            .modal-container {
                width: 95%;
                margin: 20px;
            }

            .modal-footer {
                flex-direction: column;
            }

            .modal-btn {
                width: 100%;
            }
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-submit search on Enter key
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.addEventListener('keyup', function(e) {
                    if (e.key === 'Enter') {
                        this.form.submit();
                    }
                });
            }

            // Clear search button
            if (searchInput && searchInput.value) {
                const clearSearchBtn = document.createElement('button');
                clearSearchBtn.type = 'button';
                clearSearchBtn.innerHTML = '×';
                clearSearchBtn.style.cssText =
                    'background: none; border: none; cursor: pointer; font-size: 18px; color: #9CA3AF;';

                searchInput.parentNode.appendChild(clearSearchBtn);

                clearSearchBtn.addEventListener('click', function() {
                    searchInput.value = '';
                    searchInput.focus();
                    searchInput.form.submit();
                });
            }
        });

        // Modal functions
        // Modal functions
        let currentTenantId = null;

        function showArchiveConfirmation(tenantId, tenantName) {
            currentTenantId = tenantId;

            document.getElementById('modalTitle').textContent = 'Archiver le locataire';
            document.getElementById('modalMessage').textContent = `Êtes-vous sûr de vouloir archiver ce locataire ?`;

            const details = document.getElementById('modalDetails');
            details.innerHTML = `
        <div style="text-align: left;">
            <p><strong>Locataire :</strong> ${tenantName}</p>
            <p><strong>ID :</strong> ${tenantId}</p>
            <p style="color: #92400E; margin-top: 8px;">
                ⚠️ Le locataire sera déplacé vers les archives et ne sera plus visible dans la liste active.
            </p>
        </div>
    `;

            const icon = document.getElementById('modalIcon');
            icon.className = 'modal-icon archive';
            icon.innerHTML = '📁';

            const form = document.getElementById('actionForm');
            // CORRECTION : Utiliser la route correcte
            form.action = `/coproprietaire/tenants/${tenantId}/archive`;

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'http://localhost:8080';
            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation vers React:', fullUrl);
            window.location.href = fullUrl;
        }

        // Fonction pour aller vers Laravel (port 8000)
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

            console.log('Navigation vers Laravel:', fullUrl);
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
            const parent = submenu.parentElement;

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

        // Fermer la sidebar quand on clique sur l'overlay
        document.getElementById('overlay').addEventListener('click', toggleSidebar);

        // Logout
        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
            }
        }

        // Gestion du thème (basique)
        document.querySelector('.theme-toggle').addEventListener('click', function() {
            const icon = this.querySelector('i');
            const currentIcon = icon.getAttribute('data-lucide');

            if (currentIcon === 'sun') {
                icon.setAttribute('data-lucide', 'moon');
                document.documentElement.style.setProperty('--ink', '#f8fafc');
                document.documentElement.style.setProperty('--muted', '#cbd5e1');
                document.body.style.backgroundColor = '#0f172a';
            } else {
                icon.setAttribute('data-lucide', 'sun');
                document.documentElement.style.setProperty('--ink', '#0f172a');
                document.documentElement.style.setProperty('--muted', '#64748b');
                document.body.style.backgroundColor = 'white';
            }

            lucide.createIcons();
        });

        // Close modal when clicking outside
        document.getElementById('confirmationModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
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
