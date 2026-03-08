@extends('layouts.co-owner')

@section('title', 'Répartitions et travaux - Copropriétaire')

@section('content')
<div class="maintenance-container">
    <!-- Header -->
    <div class="page-header">
        <div class="header-content">
            <h1>Répartitions et travaux</h1>
            <p class="subtitle">Gérez vos interventions, suivez les demandes de vos locataires et planifiez les travaux.<br>Centralisez tous les devis, factures et suivis de chantier au même endroit.</p>
        </div>
        <a href="{{ route('co-owner.maintenance.create') }}" class="btn-create">
            <i data-lucide="plus" style="width: 20px; height: 20px;"></i>
            Créer une intervention
        </a>
    </div>

    <!-- Statistiques -->
    <div class="stats-row">
        <div class="stat-box">
            <div class="stat-label">INTERVENTIONS URGENTES</div>
            <div class="stat-value urgent">{{ $stats['urgent'] ?? 0 }}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">EN COURS</div>
            <div class="stat-value in-progress">{{ $stats['in_progress'] ?? 0 }}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">PLANIFIÉES</div>
            <div class="stat-value planned">{{ $stats['planned'] ?? 0 }}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">COÛT TOTAL {{ date('Y') }}</div>
            <div class="stat-value cost">{{ number_format($stats['total_cost'] ?? 0, 0, ',', ' ') }} FCFA</div>
        </div>
    </div>

    <!-- Filtres par statut (pills) -->
    <div class="status-filters">
        <a href="{{ route('co-owner.maintenance.index') }}"
           class="status-pill {{ $currentFilter === 'all' || !isset($currentFilter) ? 'active' : '' }}">
            Tous
        </a>
        <a href="{{ route('co-owner.maintenance.index', ['status_filter' => 'urgent']) }}"
           class="status-pill {{ $currentFilter === 'urgent' ? 'active' : '' }}">
            Urgentes
        </a>
        <a href="{{ route('co-owner.maintenance.index', ['status_filter' => 'in_progress']) }}"
           class="status-pill {{ $currentFilter === 'in_progress' ? 'active' : '' }}">
            En cours
        </a>
        <a href="{{ route('co-owner.maintenance.index', ['status_filter' => 'planned']) }}"
           class="status-pill {{ $currentFilter === 'planned' ? 'active' : '' }}">
            Planifiées
        </a>
        <a href="{{ route('co-owner.maintenance.index', ['status_filter' => 'completed']) }}"
           class="status-pill {{ $currentFilter === 'completed' ? 'active' : '' }}">
            Terminées
        </a>
    </div>

    <!-- Filtres avancés -->
    <div class="filters-card">
        <h3 class="filters-title">FILTRE</h3>
        <form method="GET" action="{{ route('co-owner.maintenance.index') }}" class="filters-form">
            @if(request('status_filter'))
                <input type="hidden" name="status_filter" value="{{ request('status_filter') }}">
            @endif

            <div class="filters-row">
                <div class="filter-select-wrapper">
                    <select name="property_id" class="filter-select" onchange="this.form.submit()">
                        <option value="all" {{ request('property_id') == 'all' || !request('property_id') ? 'selected' : '' }}>Tous les biens</option>
                        @foreach($properties as $property)
                            <option value="{{ $property->id }}" {{ request('property_id') == $property->id ? 'selected' : '' }}>
                                {{ $property->name ?? $property->address }}
                            </option>
                        @endforeach
                    </select>
                    <i data-lucide="chevron-down" class="select-icon"></i>
                </div>

                <div class="filter-select-wrapper">
                    <select name="year" class="filter-select" onchange="this.form.submit()">
                        <option value="all" {{ request('year') == 'all' || !request('year') ? 'selected' : '' }}>Toutes les années</option>
                        @foreach($years as $year)
                            <option value="{{ $year }}" {{ request('year') == $year ? 'selected' : '' }}>{{ $year }}</option>
                        @endforeach
                    </select>
                    <i data-lucide="chevron-down" class="select-icon"></i>
                </div>
            </div>

            <div class="search-row">
                <div class="search-input-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text"
                           name="search"
                           class="search-input"
                           placeholder="Rechercher"
                           value="{{ request('search') }}">
                </div>
            </div>
        </form>
    </div>

    <!-- Liste des interventions -->
    <div class="interventions-grid">
        @forelse($maintenanceRequests as $request)
            @php
                $statusClass = match($request->status) {
                    'open' => $request->priority === 'emergency' ? 'urgent' : 'planned',
                    'in_progress' => 'in-progress',
                    'resolved' => 'completed',
                    default => 'planned'
                };

                $statusLabel = match($request->status) {
                    'open' => $request->priority === 'emergency' ? 'URGENT' : 'PLANIFIÉE',
                    'in_progress' => 'EN COURS',
                    'resolved' => 'TERMINÉE',
                    default => 'PLANIFIÉE'
                };

                $categoryLabels = [
                    'plumbing' => 'Plomberie',
                    'electricity' => 'Électricité',
                    'heating' => 'Chauffage',
                    'other' => 'Autre',
                ];

                $priorityLabels = [
                    'low' => 'Faible',
                    'medium' => 'Moyenne',
                    'high' => 'Élevée',
                    'emergency' => 'Urgente',
                ];
            @endphp

            <div class="intervention-card">
                <!-- Badge statut -->
                <div class="status-badge {{ $statusClass }}">
                    @if($request->priority === 'emergency' || $statusClass === 'urgent')
                        <i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i>
                    @elseif($statusClass === 'in-progress')
                        <i data-lucide="loader" style="width: 12px; height: 12px;"></i>
                    @elseif($statusClass === 'completed')
                        <i data-lucide="check" style="width: 12px; height: 12px;"></i>
                    @else
                        <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
                    @endif
                    {{ $statusLabel }}
                </div>

                <!-- Titre -->
                <h3 class="intervention-title">{{ $request->title }}</h3>

                <!-- Localisation -->
                <div class="intervention-location">
                    <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                    <span>{{ $request->property->name ?? 'Bien' }} • {{ $request->property->city ?? 'Ville non spécifiée' }}</span>
                </div>

                <!-- Détails en grille -->
                <div class="intervention-details">
                    <div class="detail-item">
                        <span class="detail-label">TYPE</span>
                        <span class="detail-value">{{ $categoryLabels[$request->category] ?? $request->category }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">PRIORITÉ</span>
                        <span class="detail-value">{{ $priorityLabels[$request->priority] ?? $request->priority }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DEMANDÉ LE</span>
                        <span class="detail-value">{{ $request->created_at->format('d M Y') }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">PRESTATAIRE</span>
                        <span class="detail-value">{{ $request->assigned_provider ?? 'À affecter' }}</span>
                    </div>

                    @if($request->status === 'in_progress' && $request->started_at)
                        <div class="detail-item">
                            <span class="detail-label">DÉBUT TRAVAUX</span>
                            <span class="detail-value">{{ \Carbon\Carbon::parse($request->started_at)->format('d M Y') }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">AVANCEMENT</span>
                            <span class="detail-value">{{ $request->progress ?? '0' }}%</span>
                        </div>
                    @elseif($request->status === 'resolved')
                        <div class="detail-item">
                            <span class="detail-label">DATE RÉALISATION</span>
                            <span class="detail-value">{{ $request->resolved_at ? $request->resolved_at->format('d M Y') : 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">FACTURE</span>
                            <span class="detail-value">{{ $request->actual_cost ? 'Payée' : 'En attente' }}</span>
                        </div>
                    @else
                        <div class="detail-item">
                            <span class="detail-label">DEVIS ESTIMÉ</span>
                            <span class="detail-value cost-value">{{ $request->estimated_cost ? number_format($request->estimated_cost, 0, ',', ' ') . ' FCFA' : '—' }}</span>
                        </div>
                    @endif
                </div>

                <!-- Coût en grand si disponible -->
                @if($request->estimated_cost || $request->actual_cost)
                    <div class="intervention-cost">
                        <span class="cost-label">DEVIS {{ $request->status === 'resolved' ? 'FINAL' : 'ACCEPTÉ' }}</span>
                        <span class="cost-amount">{{ number_format($request->actual_cost ?? $request->estimated_cost, 0, ',', ' ') }} FCFA</span>
                    </div>
                @endif

                <!-- Footer -->
                <div class="intervention-footer">
                    <span class="creation-date">
                        @if($request->status === 'resolved')
                            Terminé le {{ $request->resolved_at ? $request->resolved_at->format('d M Y') : 'N/A' }}
                        @elseif($request->status === 'in_progress' && $request->estimated_end_date)
                            Fin prévue : {{ \Carbon\Carbon::parse($request->estimated_end_date)->format('d M Y') }}
                        @else
                            Créé le {{ $request->created_at->format('d M Y') }}
                        @endif
                    </span>

                    <div class="intervention-actions">
                        <a href="{{ route('co-owner.maintenance.show', $request) }}" class="action-btn" title="Voir">
                            <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                        </a>
                        @if($request->status === 'open')
                            <form action="{{ route('co-owner.maintenance.start', $request) }}" method="POST" style="display: inline;">
                                @csrf
                                <button type="submit" class="action-btn btn-primary" title="Prendre en charge">
                                    <i data-lucide="play" style="width: 16px; height: 16px;"></i>
                                </button>
                            </form>
                        @endif
                        <a href="{{ route('co-owner.maintenance.edit', $request) }}" class="action-btn" title="Modifier">
                            <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                        </a>
                    </div>
                </div>
            </div>
        @empty
            <div class="empty-state">
                <i data-lucide="wrench" style="width: 64px; height: 64px; color: #cbd5e1;"></i>
                <h3>Aucune intervention</h3>
                <p>Vous n'avez pas encore d'interventions pour les biens délégués.</p>
                <a href="{{ route('co-owner.maintenance.create') }}" class="btn-create">
                    <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                    Créer une intervention
                </a>
            </div>
        @endforelse
    </div>
</div>

<style>
    .maintenance-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        background: #f8fafc;
        min-height: 100vh;
    }

    /* Header */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        gap: 2rem;
    }

    .header-content h1 {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.75rem 0;
    }

    .subtitle {
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
        margin: 0;
    }

    .btn-create {
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

    .btn-create:hover {
        background: #5a8f3a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(112, 174, 72, 0.3);
    }

    /* Stats Row */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-box {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .stat-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 1.8rem;
        font-weight: 700;
    }

    .stat-value.urgent {
        color: #dc2626;
    }

    .stat-value.in-progress {
        color: #70AE48;
    }

    .stat-value.planned {
        color: #1e293b;
    }

    .stat-value.cost {
        color: #ea580c;
    }

    /* Status Filters (Pills) */
    .status-filters {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .status-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        background: #e2e8f0;
        color: #475569;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
    }

    .status-pill:hover {
        background: #cbd5e1;
    }

    .status-pill.active {
        background: #70AE48;
        color: white;
    }

    /* Filters Card */
    .filters-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .filters-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: #1e293b;
        letter-spacing: 0.05em;
        margin: 0 0 1rem 0;
    }

    .filters-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .filters-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .filter-select-wrapper {
        position: relative;
    }

    .filter-select {
        width: 100%;
        padding: 0.875rem 1rem;
        padding-right: 2.5rem;
        border: 1px solid #70AE48;
        border-radius: 10px;
        font-size: 0.95rem;
        color: #64748b;
        background: white;
        appearance: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .filter-select:focus {
        outline: none;
        border-color: #5a8f3a;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .select-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: #64748b;
        pointer-events: none;
    }

    .search-row {
        width: 100%;
    }

    .search-input-wrapper {
        position: relative;
        width: 100%;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        color: #70AE48;
    }

    .search-input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 2.75rem;
        border: 1px solid #70AE48;
        border-radius: 10px;
        font-size: 0.95rem;
        color: #374151;
        transition: all 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: #5a8f3a;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .search-input::placeholder {
        color: #94a3b8;
    }

    /* Interventions Grid */
    .interventions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 1.5rem;
    }

    .intervention-card {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .intervention-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: #70AE48;
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.875rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        width: fit-content;
    }

    .status-badge.urgent {
        background: #fee2e2;
        color: #dc2626;
    }

    .status-badge.in-progress {
        background: #dbeafe;
        color: #2563eb;
    }

    .status-badge.planned {
        background: #fef3c7;
        color: #d97706;
    }

    .status-badge.completed {
        background: #d1fae5;
        color: #059669;
    }

    .intervention-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
    }

    .intervention-location {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #64748b;
    }

    .intervention-location i {
        color: #e74c3c;
    }

    .intervention-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem 1.5rem;
        padding: 1rem 0;
        border-top: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
    }

    .detail-item {
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
        font-size: 0.9rem;
        font-weight: 600;
        color: #1e293b;
    }

    .detail-value.cost-value {
        color: #ea580c;
    }

    .intervention-cost {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
    }

    .cost-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.05em;
    }

    .cost-amount {
        font-size: 1.25rem;
        font-weight: 700;
        color: #ea580c;
    }

    .intervention-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 0.75rem;
    }

    .creation-date {
        font-size: 0.8rem;
        color: #94a3b8;
    }

    .intervention-actions {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: white;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
    }

    .action-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #374151;
    }

    .action-btn.btn-primary {
        background: #70AE48;
        border-color: #70AE48;
        color: white;
    }

    .action-btn.btn-primary:hover {
        background: #5a8f3a;
    }

    /* Empty State */
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 16px;
        border: 2px dashed #e2e8f0;
    }

    .empty-state h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
        margin: 1rem 0 0.5rem 0;
    }

    .empty-state p {
        color: #64748b;
        margin-bottom: 1.5rem;
    }

    /* Responsive */
    @media (max-width: 1024px) {
        .stats-row {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            align-items: stretch;
        }

        .stats-row {
            grid-template-columns: 1fr;
        }

        .filters-row {
            grid-template-columns: 1fr;
        }

        .interventions-grid {
            grid-template-columns: 1fr;
        }

        .status-filters {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 0.5rem;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
</script>
@endsection
