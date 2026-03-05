@extends('layouts.co-owner')

@section('title', 'États des lieux')

@section('content')
<style>
    .condition-reports-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
    }

    .header-content h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
    }

    .header-description {
        color: #6b7280;
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;
    }

    .create-btn {
        background: #70AE48;
        color: white;
        padding: 0.875rem 1.5rem;
        border-radius: 2rem;
        font-weight: 500;
        font-size: 0.95rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
    }

    .create-btn:hover {
        background: #70AE48;
        transform: translateY(-1px);
    }

    .create-btn svg {
        width: 20px;
        height: 20px;
    }

    /* Tabs */
    .tabs-container {
        background: #f3f4f6;
        border-radius: 0.75rem;
        padding: 0.375rem;
        display: inline-flex;
        gap: 0.25rem;
        margin-bottom: 1.5rem;
    }

    .tab-btn {
        padding: 0.625rem 1.25rem;
        border-radius: 0.5rem;
        border: none;
        background: transparent;
        color: #6b7280;
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .tab-btn.active {
        background: #70AE48;
        color: white;
    }

    .tab-btn:not(.active):hover {
        color: #377DF4;
    }

    /* Filter Section */
    .filter-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .filter-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.025em;
    }

    .property-select {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 1px solid #84cc16;
        border-radius: 0.75rem;
        font-size: 0.95rem;
        color: #6b7280;
        margin-bottom: 1rem;
        background: white;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
    }

    .property-select:focus {
        outline: none;
        border-color: #65a30d;
    }

    .filter-row {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .search-input-wrapper {
        position: relative;
        flex: 1;
    }

    .search-input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 2.5rem;
        border: 1px solid #84cc16;
        border-radius: 0.75rem;
        font-size: 0.95rem;
        color: #374151;
        background: white;
    }

    .search-input:focus {
        outline: none;
        border-color: #65a30d;
    }

    .search-input::placeholder {
        color: #9ca3af;
    }

    .search-icon {
        position: absolute;
        left: 0.875rem;
        top: 50%;
        transform: translateY(-50%);
        color: #84cc16;
        width: 18px;
        height: 18px;
    }

    .display-btn {
        padding: 0.875rem 1.25rem;
        border: 1px solid #84cc16;
        background: white;
        color: #374151;
        border-radius: 0.75rem;
        font-weight: 500;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }

    .display-btn:hover {
        background: #f9fafb;
    }

    /* Reports Grid */
    .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 1.5rem;
    }

    .report-card {
        background: white;
        border-radius: 1rem;
        overflow: hidden;
        transition: all 0.2s ease;
        border: 1px solid #e5e7eb;
        border-left: 4px solid transparent;
    }

    .report-card.entry {
        border-left-color: #84cc16;
    }

    .report-card.exit {
        border-left-color: #ef4444;
    }

    .report-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .report-header {
        padding: 1.25rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .report-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        margin-bottom: 0.75rem;
    }

    .report-badge.entry {
        background: #ecfdf5;
        color: #059669;
    }

    .report-badge.exit {
        background: #fef2f2;
        color: #dc2626;
    }

    .report-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.375rem;
    }

    .report-location {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: #84cc16;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .report-location svg {
        width: 14px;
        height: 14px;
        color: #84cc16;
    }

    .report-body {
        padding: 1.25rem;
    }

    .report-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem 2rem;
        margin-bottom: 1rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-label {
        font-size: 0.7rem;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .info-value {
        font-size: 0.9rem;
        font-weight: 600;
        color: #111827;
    }

    .status-value {
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }

    .status-check {
        color: #111827;
        font-weight: 600;
    }

    .photo-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 0.875rem;
        background: #f9fafb;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: #374151;
    }

    .photo-count svg {
        width: 16px;
        height: 16px;
        color: #6b7280;
    }

    .report-footer {
        padding: 0.875rem 1.25rem;
        background: #f9fafb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .creation-date {
        font-size: 0.8rem;
        color: #6b7280;
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 0.5rem;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
    }

    .action-btn svg {
        width: 16px;
        height: 16px;
    }

    .action-btn.download {
        color: #377DF4;
    }

    .action-btn.download:hover {
        background: rgba(55, 125, 244, 0.1);
    }

    .action-btn.edit {
        color: #f59e0b;
    }

    .action-btn.edit:hover {
        background: rgba(245, 158, 11, 0.1);
    }

    .action-btn.more {
        color: #9ca3af;
    }

    .action-btn.more:hover {
        background: #e5e7eb;
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 1rem;
        border: 2px dashed #e5e7eb;
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .empty-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.5rem;
    }

    .empty-description {
        color: #6b7280;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
    }

    /* Pagination */
    .pagination-container {
        margin-top: 2rem;
        display: flex;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .header-section {
            flex-direction: column;
            gap: 1rem;
        }

        .reports-grid {
            grid-template-columns: 1fr;
        }

        .filter-row {
            flex-direction: column;
        }

        .display-btn {
            width: 100%;
            justify-content: center;
        }
    }
</style>

<div class="condition-reports-container">
    <!-- Header -->
    <div class="header-section">
        <div class="header-content">
            <h1>États des lieux</h1>
            <p class="header-description">
                Documentez l'état de vos biens avec photos et descriptions détaillées.<br>
                Générez des PDF professionnels en quelques clics.
            </p>
        </div>
        <a href="{{ route('co-owner.condition-reports.create') }}" class="create-btn">
            <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Créer un nouvel état de lieu
        </a>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
        <button class="tab-btn {{ !request('type') ? 'active' : '' }}" onclick="filterByType('')">
            Tous
        </button>
        <button class="tab-btn {{ request('type') == 'entry' ? 'active' : '' }}" onclick="filterByType('entry')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12l7-7 7 7"/>
            </svg>
            Entrée
        </button>
        <button class="tab-btn {{ request('type') == 'exit' ? 'active' : '' }}" onclick="filterByType('exit')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            Sortie
        </button>
    </div>

    <!-- Filters -->
    <div class="filter-section">
        <h3 class="filter-title">Filtrer par bien</h3>

        <form id="filterForm" action="{{ route('co-owner.condition-reports.index') }}" method="GET">
            <input type="hidden" name="type" id="typeInput" value="{{ request('type') }}">

            <select name="property_id" class="property-select" onchange="this.form.submit()">
                <option value="">Tous les biens</option>
                @foreach($properties as $property)
                    <option value="{{ $property->id }}" {{ request('property_id') == $property->id ? 'selected' : '' }}>
                        {{ $property->name }}
                    </option>
                @endforeach
            </select>

            <div class="filter-row">
                <div class="search-input-wrapper">
                    <svg class="search-icon" viewBox="0 0 20 20" fill="none">
                        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <input type="text" name="search" class="search-input" placeholder="Rechercher" value="{{ request('search') }}">
                </div>
                <button type="button" class="display-btn">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="2" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M10 6V2M10 18v-4M6 10H2M18 10h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    Affichage
                </button>
            </div>
        </form>
    </div>

    <!-- Reports Grid -->
    @if($reports->isEmpty())
        <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h4 class="empty-title">Aucun état des lieux trouvé</h4>
            <p class="empty-description">Commencez par créer votre premier état des lieux.</p>
            <a href="{{ route('co-owner.condition-reports.create') }}" class="create-btn">
                <svg viewBox="0 0 20 20" fill="none" style="width: 18px; height: 18px;">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Créer un état des lieux
            </a>
        </div>
    @else
        <div class="reports-grid">
            @foreach($reports as $report)
            <div class="report-card {{ $report->type }}">
                <!-- Header -->
                <div class="report-header">
                    <div class="report-badge {{ $report->type }}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        @if($report->type == 'entry')
                            État des lieux d'entrée
                        @else
                            État des lieux de sortie
                        @endif
                    </div>
                    <h3 class="report-title">EDL - {{ $report->tenant_name }}</h3>
                    <div class="report-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {{ $report->property_name }}
                    </div>
                </div>

                <!-- Body -->
                <div class="report-body">
                    <div class="report-info-grid">
                        <div class="info-item">
                            <span class="info-label">Locataire</span>
                            <span class="info-value">{{ $report->tenant_name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date</span>
                            <span class="info-value">{{ \Carbon\Carbon::parse($report->report_date)->format('d M Y') }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">État général</span>
                            <span class="info-value">{{ $report->general_condition }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Signé</span>
                            <span class="info-value status-value">
                                <span class="status-check">✓</span> {{ $report->is_signed ? 'Oui' : 'Non' }}
                            </span>
                        </div>
                    </div>

                    <div class="photo-count">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style="font-weight: 600;">{{ $report->photos_count }} photos</span>
                    </div>
                </div>

                <!-- Footer -->
                <div class="report-footer">
                    <span class="creation-date">Créé le {{ $report->created_at->format('d M Y') }}</span>
                    <div class="action-buttons">
                        <a href="{{ route('co-owner.condition-reports.download', $report->id) }}" class="action-btn download" title="Télécharger PDF">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </a>
                        <a href="{{ route('co-owner.condition-reports.edit', $report->id) }}" class="action-btn edit" title="Modifier">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </a>
                        <button type="button" class="action-btn more" title="Plus d'options" onclick="showOptions({{ $report->id }})">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            @endforeach
        </div>

        <!-- Pagination -->
        <div class="pagination-container">
            {{ $reports->links() }}
        </div>
    @endif
</div>

<script>
function filterByType(type) {
    document.getElementById('typeInput').value = type;
    document.getElementById('filterForm').submit();
}

function showOptions(reportId) {
    // Afficher un menu contextuel avec options supplémentaires
    console.log('Options for report:', reportId);
}
</script>
@endsection
