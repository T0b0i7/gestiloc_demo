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

                <!-- Adresse du bien -->
                <div class="contract-location">
                    <i data-lucide="map-pin" style="width: 14px; height: 14px; color: #e74c3c;"></i>
                    <span>{{ $lease->property->name ?? 'Bien sans nom' }} - {{ $lease->property->address ?? 'Adresse non spécifiée' }}</span>
                </div>

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
                        <div class="detail-value">
                            {{ $lease->start_date ? $lease->start_date->format('d M Y') : 'Non défini' }}
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">DATE DE FIN</div>
                        <div class="detail-value">
                            {{ $lease->end_date ? $lease->end_date->format('d M Y') : 'Non défini' }}
                        </div>
                    </div>
                </div>

                <!-- Statut et actions -->
                <div class="contract-footer">
                    @php
                        $now = now();
                        $hasValidDates = $lease->start_date && $lease->end_date;
                        $isActive = $hasValidDates && $lease->start_date <= $now && $lease->end_date >= $now;
                        $isPending = $lease->start_date && $lease->start_date > $now;
                        $isExpired = $lease->end_date && $lease->end_date < $now;
                    @endphp

                    @if(!$hasValidDates)
                        <span class="status-badge status-pending">
                            <i data-lucide="alert-circle" style="width: 12px; height: 12px;"></i>
                            Dates non définies
                        </span>
                    @elseif($isActive)
                        <span class="status-badge status-active">
                            <i data-lucide="check" style="width: 12px; height: 12px;"></i>
                            Actif
                        </span>
                    @elseif($isPending)
                        <span class="status-badge status-pending">
                            <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
                            En attente de signature
                        </span>
                    @elseif($isExpired)
                        <span class="status-badge status-expired">
                            <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                            Expiré
                        </span>
                    @else
                        <span class="status-badge status-expired">
                            <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                            Statut inconnu
                        </span>
                    @endif

                    <div class="contract-actions">
                        <a href="{{ route('co-owner.leases.documents.index', $lease) }}" class="action-btn btn-download" title="Télécharger">
                            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
                        </a>
                    </div>
                </div>

                <!-- Date de création -->
                <div class="contract-date">
                    Créé le {{ $lease->created_at ? $lease->created_at->format('d M Y') : 'Date inconnue' }}
                </div>
            </div>
        @empty
            <div class="empty-state">
                <i data-lucide="file-text" style="width: 64px; height: 64px; color: #cbd5e1;"></i>
                <h3>Aucun contrat de bail</h3>
                <p>Vous n'avez pas encore créé de contrat de bail pour les biens qui vous sont délégués.</p>
                <a href="{{ route('co-owner.assign-property.create') }}" class="btn-new-lease">
                    <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                    Créer un contrat
                </a>
            </div>
        @endforelse
    </div>
</div>

<style>
    .leases-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        background: #f8fafc;
        min-height: 100vh;
    }

    /* Header */
    .leases-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        gap: 2rem;
    }

    .header-content h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.5rem 0;
    }

    .subtitle {
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;
    }

    .btn-new-lease {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #70AE48;
        color: white;
        padding: 0.875rem 1.5rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .btn-new-lease:hover {
        background: #5a8f3a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(112, 174, 72, 0.3);
    }

    /* Filtres */
    .filters-section {
        margin-bottom: 2rem;
    }

    .filters-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .filters-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.05em;
        margin: 0 0 1rem 0;
        text-transform: uppercase;
    }

    .filters-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .filter-row {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .filter-select-wrapper {
        position: relative;
        width: 100%;
    }

    .filter-select {
        width: 100%;
        padding: 0.75rem 1rem;
        padding-right: 2.5rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.95rem;
        color: #000000;
        background: #ffffff;
        appearance: none;
        cursor: pointer;
        transition: border-color 0.2s;
    }

    .filter-select:focus {
        outline: none;
        border-color: #70AE48 !important;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .select-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: #6b7280;
        pointer-events: none;
    }

    .search-row {
        display: flex;
        gap: 1rem;
    }

    .search-input-wrapper {
        position: relative;
        flex: 1;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: #9ca3af;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.95rem;
        color: #374151;
        transition: border-color 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: #70AE48;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .search-input::placeholder {
        color: #9ca3af;
    }

    .btn-display {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: white;
        color: #374151;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .btn-display:hover {
        background: #f9fafb;
        border-color: #9ca3af;
    }

    /* Grille de contrats */
    .contracts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 1.5rem;
    }

    .contract-card {
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .contract-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: #70AE48;
    }

    .contract-type {
        font-size: 0.7rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .contract-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
    }

    .contract-location {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 0.5rem;
    }

    .contract-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        padding: 1rem 0;
        border-top: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
    }

    .detail-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .detail-label {
        font-size: 0.65rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.05em;
    }

    .detail-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
    }

    .contract-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.5rem;
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .status-active {
        background: #dcfce7;
        color: #166534;
    }

    .status-pending {
        background: #fef3c7;
        color: #92400e;
    }

    .status-expired {
        background: #f3f4f6;
        color: #6b7280;
    }

    .contract-actions {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
    }

    .action-btn:hover {
        background: #f1f5f9;
        color: #374151;
    }

    .btn-download:hover {
        color: #70AE48;
    }

    .contract-date {
        font-size: 0.75rem;
        color: #94a3b8;
        margin-top: 0.5rem;
    }

    /* Empty state */
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 12px;
        border: 2px dashed #e2e8f0;
    }

    .empty-state h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
        margin: 1rem 0 0.5rem 0;
    }

    .empty-state p {
        color: #6b7280;
        margin-bottom: 1.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .leases-header {
            flex-direction: column;
            align-items: stretch;
        }

        .contracts-grid {
            grid-template-columns: 1fr;
        }

        .search-row {
            flex-direction: column;
        }

        .btn-display {
            width: 100%;
            justify-content: center;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
</script>
@endsection
