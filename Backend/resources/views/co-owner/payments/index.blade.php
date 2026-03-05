@extends('layouts.co-owner')

@section('title', 'Gestion des paiements')

@section('content')
    <div class="payment-management">
        <!-- Header -->
        <div class="page-header">
            <h1>Gestion des paiements</h1>
            <p class="subtitle">Créez et recevez/confirmez en quelques clics et en toute sécurité</p>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
            <div class="tabs">
                <button class="tab {{ request('status') != 'archived' ? 'active' : '' }}" onclick="switchTab('active')">
                    <span class="check-icon">✓</span>
                    Actifs
                    <span class="badge green">{{ $activeCount }}</span>
                </button>
                <button class="tab {{ request('status') == 'archived' ? 'active' : '' }}" onclick="switchTab('archived')">
                    <span class="folder-icon">📁</span>
                    Archives
                    <span class="badge gray">{{ $archivedCount }}</span>
                </button>
            </div>
        </div>

        <!-- Filters Section -->
        <div class="filters-card">
            <h3>FILTRER - UTILISEZ LES OPTIONS CI-DESSOUS</h3>
            <div class="filters-grid">
                <div class="filter-group">
                    <label>Bien</label>
                    <select id="property-filter" onchange="applyFilters()">
                        <option value="all"
                            {{ request('property_id') == 'all' || !request('property_id') ? 'selected' : '' }}>Tous les
                            biens</option>
                        @foreach ($properties as $property)
                            <option value="{{ $property->id }}"
                                {{ request('property_id') == $property->id ? 'selected' : '' }}>{{ $property->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="filter-group">
                    <label>Lignes par page</label>
                    <select id="per-page" onchange="applyFilters()">
                        <option value="10" {{ request('per_page', 100) == 10 ? 'selected' : '' }}>10 lignes</option>
                        <option value="25" {{ request('per_page', 100) == 25 ? 'selected' : '' }}>25 lignes</option>
                        <option value="50" {{ request('per_page', 100) == 50 ? 'selected' : '' }}>50 lignes</option>
                        <option value="100" {{ request('per_page', 100) == 100 ? 'selected' : '' }}>100 lignes</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Search & Display -->
        <div class="search-card">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="search-input" placeholder="Rechercher par locataire, email, bien..."
                    value="{{ request('search') }}" onkeyup="debounceSearch()">
            </div>
            <button class="btn-display" onclick="resetFilters()">
                <span class="gear-icon">⟲</span>
                Réinitialiser
            </button>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
            <!-- Loyers attendus -->
            <div class="stat-card green-border">
                <div class="stat-header">
                    <span class="stat-title">Loyers attendus</span>
                    <span class="stat-icon money">💵</span>
                </div>
                <div class="stat-amount">{{ number_format($stats['expected_rent'], 0, ',', ' ') }} FCFA</div>
                <div class="stat-meta">{{ $stats['total_payments'] }} paiements ce mois</div>
            </div>

            <!-- Loyers reçus -->
            <div class="stat-card blue-border">
                <div class="stat-header">
                    <span class="stat-title">Loyers reçus</span>
                    <span class="stat-icon check">✅</span>
                </div>
                <div class="stat-amount">{{ number_format($stats['received_rent'], 0, ',', ' ') }} FCFA</div>
                <div class="stat-meta">{{ $stats['paid_count'] }} paiements ce mois</div>
            </div>

            <!-- En retard -->
            <div class="stat-card red-border">
                <div class="stat-header">
                    <span class="stat-title">En retard</span>
                    <span class="stat-icon warning">⚠️</span>
                </div>
                <div class="stat-amount">{{ number_format($stats['late_amount'], 0, ',', ' ') }} FCFA</div>
                <div class="stat-meta">
                    {{ $payments->where('status', 'pending')->filter(function ($p) {return $p->invoice && $p->invoice->due_date < now();})->count() }}
                    paiements en retard
                </div>
            </div>

            <!-- Taux de recouvrement -->
            <div class="stat-card orange-border">
                <div class="stat-header">
                    <span class="stat-title">Taux de recouvrement</span>
                    <span class="stat-icon chart">📊</span>
                </div>
                <div class="stat-amount">{{ $stats['recovery_rate'] }}%</div>
                <div class="stat-meta trend-up">Mois en cours</div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="actions-bar">
            <a href="{{ route('co-owner.payments.create') }}" class="btn-primary" style="background-color: #70AE48;">
                <span class="plus-icon">+</span>
                Enregistrer un paiement
            </a>
            <a href="{{ route('co-owner.payments.reminders') }}" class="btn-secondary">
                <span class="bell-icon">🔔</span>
                Rappels
            </a>
            <button class="btn-secondary" onclick="showExportModal()">
                <span class="export-icon">📤</span>
                Exporter
            </button>
        </div>

        <!-- Payments Table -->
        <div class="table-container">
            <table class="payments-table">
                <thead>
                    <tr>
                        <th>Locataire</th>
                        <th>Bien</th>
                        <th>Montant</th>
                        <th>Échéance</th>
                        <th>Statut</th>
                        <th>Date de paiement</th>
                        <th>Mode</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($payments as $payment)
                        <tr>
                            <td>
                                <div class="tenant-info">
                                <strong class="tenant-link" style="color: #70AE48;">
    {{ trim(($payment->lease->tenant->first_name ?? '') . ' ' . ($payment->lease->tenant->last_name ?? '')) ?: 'N/A' }}
</strong>


                                    <small>{{ $payment->lease->tenant->user->email ?? '' }}</small>
                                </div>
                            </td>
                            <td>
                                <div class="property-info">
                                    <span class="property-name">{{ $payment->lease->property->name ?? 'N/A' }}</span>
                                    <small>{{ Str::limit($payment->lease->property->address ?? '', 30) }}</small>
                                </div>
                            </td>
                            <td class="amount">{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</td>
                            <td>{{ $payment->invoice ? $payment->invoice->due_date->format('d/m/Y') : '-' }}</td>
                            <td>
                                @php
                                    $statusClass = match ($payment->status) {
                                        'approved', 'success' => 'status-paid',
                                        'pending', 'initiated' => 'status-pending',
                                        'cancelled', 'failed', 'declined' => 'status-late',
                                        default => 'status-pending',
                                    };
                                    $statusLabel = match ($payment->status) {
                                        'approved', 'success' => 'Payé',
                                        'pending', 'initiated' => 'En attente',
                                        'cancelled' => 'Annulé',
                                        'failed' => 'Échoué',
                                        'declined' => 'Refusé',
                                        default => 'En attente',
                                    };
                                @endphp
                                <span class="status-badge {{ $statusClass }}">
                                    @if ($payment->status === 'approved')
                                        <span class="status-icon">✓</span>
                                    @elseif(in_array($payment->status, ['pending', 'initiated']))
                                        <span class="status-icon">⏳</span>
                                    @else
                                        <span class="status-icon">⚠</span>
                                    @endif
                                    {{ $statusLabel }}
                                </span>
                            </td>
                            <td>{{ $payment->paid_at ? $payment->paid_at->format('d/m/Y') : '-' }}</td>
                            <td>
                                <span class="payment-mode">
                                    @php
                                        $method = $payment->provider_payload
                                            ? json_decode($payment->provider_payload)->payment_method ?? 'manual'
                                            : 'manual';
                                        $methodLabel = match ($method) {
                                            'virement' => 'Virement',
                                            'cheque' => 'Chèque',
                                            'especes' => 'Espèces',
                                            'mobile_money' => 'Mobile Money',
                                            'card' => 'Carte',
                                            'manual' => 'Manuel',
                                            default => 'Virement',
                                        };
                                    @endphp
                                    {{ $methodLabel }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <a href="{{ route('co-owner.payments.show', $payment->id) }}" class="btn-action view"
                                        title="Voir les détails">
                                        👁️
                                    </a>
                                    @if ($payment->status === 'approved')
                                        <a href="{{ route('co-owner.payments.receipt', $payment->id) }}"
                                            class="btn-action pdf" title="Télécharger la quittance" target="_blank">
                                            📄
                                        </a>
                                        <button
                                            onclick="showSendReceiptModal({{ $payment->id }}, '{{ $payment->lease->tenant->user->full_name ?? ($payment->lease->tenant->user->name ?? 'Locataire') }}', '{{ $payment->lease->tenant->user->email ?? '' }}')"
                                            class="btn-action email" title="Envoyer la quittance par email">
                                            ✉️
                                        </button>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="empty-state">
                                <div class="empty-state-content">
                                    <span class="empty-icon">💰</span>
                                    <h3>Aucun paiement trouvé</h3>
                                    <p>Aucun paiement ne correspond à vos critères de recherche.</p>
                                    <a href="{{ route('co-owner.payments.create') }}" class="btn-primary"
                                        style="background-color: #0b7dda; margin-top: 1rem; display: inline-flex;">
                                        <span class="plus-icon">+</span>
                                        Enregistrer un paiement
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if ($payments->hasPages())
            <div class="pagination-container">
                {{ $payments->appends(request()->query())->links() }}
            </div>
        @endif
    </div>

    <!-- MODALE DE CONFIRMATION D'ENVOI DE QUITTANCE -->
    <div id="sendReceiptModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-icon email-icon">✉️</div>
                <h2>Envoyer la quittance</h2>
                <button class="modal-close" onclick="closeModal('sendReceiptModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-info">
                    <div class="info-row">
                        <span class="info-label">Locataire :</span>
                        <span class="info-value" id="receipt-tenant-name"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email :</span>
                        <span class="info-value" id="receipt-tenant-email"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Document :</span>
                        <span class="info-value">Quittance de loyer (PDF)</span>
                    </div>
                </div>
                <div class="modal-message">
                    <p>Vous allez envoyer la quittance de loyer par email au locataire.</p>
                    <p class="small">Un accusé de réception sera envoyé une fois le mail délivré.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal('sendReceiptModal')">Annuler</button>
                <button class="btn-confirm" id="confirmSendReceiptBtn" onclick="confirmSendReceipt()">
                    <span class="btn-icon">✉️</span>
                    Envoyer la quittance
                </button>
            </div>
        </div>
    </div>

    <!-- MODALE D'EXPORT -->
    <div id="exportModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-icon export-icon">📤</div>
                <h2>Exporter les paiements</h2>
                <button class="modal-close" onclick="closeModal('exportModal')">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-description">Choisissez le format d'exportation de vos données de paiements.</p>
                <div class="export-options">
                    <div class="export-option" onclick="selectExportFormat('csv')" id="export-csv">
                        <div class="option-radio" id="radio-csv">
                            <div class="radio-inner"></div>
                        </div>
                        <div class="option-content">
                            <span class="option-icon">📊</span>
                            <div class="option-text">
                                <strong>CSV</strong>
                                <span>Format tableur (Excel, LibreOffice)</span>
                            </div>
                        </div>
                    </div>
                    <div class="export-option" onclick="selectExportFormat('pdf')" id="export-pdf">
                        <div class="option-radio" id="radio-pdf">
                            <div class="radio-inner"></div>
                        </div>
                        <div class="option-content">
                            <span class="option-icon">📄</span>
                            <div class="option-text">
                                <strong>PDF</strong>
                                <span>Format document (lecture seule)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <input type="hidden" id="selected-format" value="csv">
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal('exportModal')">Annuler</button>
                <button class="btn-confirm" onclick="confirmExport()">
                    <span class="btn-icon">📥</span>
                    Exporter
                </button>
            </div>
        </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div id="toast" class="toast">
        <div class="toast-icon" id="toast-icon">✅</div>
        <div class="toast-content">
            <div class="toast-title" id="toast-title">Succès</div>
            <div class="toast-message" id="toast-message">Action effectuée avec succès</div>
        </div>
        <button class="toast-close" onclick="closeToast()">&times;</button>
    </div>

    <!-- OVERLAY -->
    <div id="overlay" class="overlay" onclick="closeAllModals()"></div>

    <style>
        .payment-management {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .page-header h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #666;
            font-size: 1rem;
            margin-bottom: 2rem;
        }

        /* Tabs */
        .tabs-container {
            margin-bottom: 2rem;
            border-bottom: 2px solid #e0e0e0;
        }

        .tabs {
            display: flex;
            gap: 2rem;
        }

        .tab {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 0;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            color: #666;
            position: relative;
            transition: color 0.3s;
        }

        .tab.active {
            color: #70AE48;
            font-weight: 600;
        }

        .tab.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 3px;
            background: #70AE48;
        }

        .badge {
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge.green {
            background: #70AE48;
            color: white;
        }

        .badge.gray {
            background: #9e9e9e;
            color: white;
        }

        /* Filters */
        .filters-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .filters-card h3 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }

        .filters-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .filter-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }

        .filter-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #70AE48;
            border-radius: 8px;
            background: white;
            font-size: 0.9rem;
            color: #333;
            cursor: pointer;
            outline: none;
        }

        .filter-group select:focus {
            border-color: #70AE48;
            box-shadow: 0 0 0 3px rgba(11, 125, 218, 0.1);
        }

        /* Search */
        .search-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .search-box {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: #f5f5f5;
            border: 1px solid #70AE48;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            max-width: 600px;
        }

        .search-box input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 0.95rem;
            outline: none;
        }

        .btn-display {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: 1px solid #70AE48;
            border-radius: 8px;
            background: white;
            color: #000000;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }

        .btn-display:hover {
            background: #0b7dda;
            color: white;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: #f8f9fa;
            border-radius: 16px;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            border-left: 4px solid;
        }

        .green-border {
            border-left-color: #4CAF50;
        }

        .blue-border {
            border-left-color: #0b7dda;
        }

        .red-border {
            border-left-color: #f44336;
        }

        .orange-border {
            border-left-color: #FF9800;
        }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .stat-title {
            font-size: 0.9rem;
            color: #666;
            font-weight: 500;
        }

        .stat-icon {
            font-size: 1.5rem;
        }

        .stat-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
        }

        .stat-meta {
            font-size: 0.8rem;
            color: #999;
        }

        .trend-up {
            color: #4CAF50;
        }

        /* Actions Bar */
        .actions-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            background: #70AE48;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
        }

        .btn-primary:hover {
            background: #70AE48;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(11, 125, 218, 0.3);
        }

        .btn-secondary {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            background: white;
            color: #0b7dda;
            border: 1px solid #0b7dda;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
        }

        .btn-secondary:hover {
            background: #e6f0fa;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(11, 125, 218, 0.1);
        }

        /* Table */
        .table-container {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            overflow-x: auto;
            margin-bottom: 2rem;
        }

        .payments-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1000px;
        }

        .payments-table th {
            text-align: left;
            padding: 1rem;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e0e0e0;
            font-size: 0.9rem;
        }

        .payments-table td {
            padding: 1rem;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: middle;
        }

        .tenant-info,
        .property-info {
            display: flex;
            flex-direction: column;
        }

        .tenant-link {
            color: #0b7dda;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.3s;
        }

        .tenant-link:hover {
            color: #0a6ab8;
            text-decoration: underline;
        }

        .property-name {
            font-weight: 600;
            color: #333;
        }

        .tenant-info small,
        .property-info small {
            color: #999;
            font-size: 0.8rem;
        }

        .amount {
            font-weight: 600;
            color: #333;
        }

        /* Status Badges */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .status-paid {
            background: #4CAF50;
            color: white;
        }

        .status-pending {
            background: #FF9800;
            color: white;
        }

        .status-late {
            background: #f44336;
            color: white;
        }

        .payment-mode {
            color: #0b7dda;
            font-weight: 500;
        }

        /* Action Buttons */
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }

        .btn-action {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            color: #666;
            text-decoration: none;
            transition: all 0.3s;
            font-size: 1rem;
        }

        .btn-action:hover {
            background: #f5f5f5;
            border-color: #0b7dda;
            color: #0b7dda;
            transform: translateY(-2px);
        }

        .btn-action.view:hover {
            background: #e3f2fd;
            border-color: #0b7dda;
        }

        .btn-action.pdf:hover {
            background: #ffebcc;
            border-color: #FF9800;
            color: #FF9800;
        }

        .btn-action.email:hover {
            background: #e8f5e9;
            border-color: #4CAF50;
            color: #4CAF50;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 3rem;
        }

        .empty-state-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .empty-state h3 {
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 0.5rem;
        }

        .empty-state p {
            color: #999;
            margin-bottom: 0.5rem;
        }

        /* Pagination */
        .pagination-container {
            display: flex;
            justify-content: center;
            margin-top: 2rem;
        }

        .pagination-container .pagination {
            display: flex;
            gap: 0.5rem;
            list-style: none;
            padding: 0;
        }

        .pagination-container .page-link {
            padding: 0.5rem 1rem;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            color: #0b7dda;
            text-decoration: none;
            transition: all 0.3s;
        }

        .pagination-container .page-link:hover {
            background: #0b7dda;
            color: white;
            border-color: #0b7dda;
        }

        .pagination-container .page-item.active .page-link {
            background: #0b7dda;
            color: white;
            border-color: #0b7dda;
        }

        .pagination-container .page-item.disabled .page-link {
            color: #999;
            pointer-events: none;
            background: #f5f5f5;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            .payment-management {
                padding: 1rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .filters-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .actions-bar {
                flex-wrap: wrap;
            }

            .actions-bar a,
            .actions-bar button {
                flex: 1;
                min-width: 100%;
                justify-content: center;
            }

            .search-card {
                flex-direction: column;
                gap: 1rem;
            }

            .search-box {
                max-width: 100%;
            }

            .btn-display {
                width: 100%;
                justify-content: center;
            }
        }

        /* MODAL STYLES */
        .overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            z-index: 999;
            animation: fadeIn 0.3s ease;
        }

        .modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 500px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }

        .modal-content {
            display: flex;
            flex-direction: column;
        }

        .modal-header {
            display: flex;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e0e0e0;
            position: relative;
        }

        .modal-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-right: 1rem;
        }

        .modal-icon.email-icon {
            background: #e3f2fd;
            color: #0b7dda;
        }

        .modal-icon.export-icon {
            background: #e8f5e9;
            color: #4CAF50;
        }

        .modal-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
            margin: 0;
        }

        .modal-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #999;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .modal-close:hover {
            background: #f5f5f5;
            color: #333;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .modal-description {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.5;
        }

        .modal-info {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
        }

        .info-row {
            display: flex;
            margin-bottom: 0.75rem;
        }

        .info-row:last-child {
            margin-bottom: 0;
        }

        .info-label {
            width: 100px;
            color: #666;
            font-size: 0.9rem;
        }

        .info-value {
            flex: 1;
            color: #333;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .modal-message {
            padding: 0.5rem 0;
        }

        .modal-message p {
            color: #666;
            margin-bottom: 0.5rem;
            line-height: 1.5;
        }

        .modal-message p.small {
            font-size: 0.85rem;
            color: #999;
        }

        /* Export Options */
        .export-options {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 0.5rem;
        }

        .export-option {
            display: flex;
            align-items: center;
            padding: 1rem;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .export-option:hover {
            border-color: #0b7dda;
            background: #f0f7ff;
        }

        .export-option.selected {
            border-color: #0b7dda;
            background: #f0f7ff;
        }

        .option-radio {
            width: 20px;
            height: 20px;
            border: 2px solid #ccc;
            border-radius: 50%;
            margin-right: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .export-option.selected .option-radio {
            border-color: #0b7dda;
        }

        .radio-inner {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #0b7dda;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .export-option.selected .radio-inner {
            opacity: 1;
        }

        .option-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        }

        .option-icon {
            font-size: 24px;
        }

        .option-text {
            display: flex;
            flex-direction: column;
        }

        .option-text strong {
            color: #333;
            margin-bottom: 0.25rem;
        }

        .option-text span {
            font-size: 0.8rem;
            color: #999;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1.5rem;
            border-top: 1px solid #e0e0e0;
        }

        .btn-cancel {
            padding: 0.75rem 1.5rem;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            color: #666;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-cancel:hover {
            background: #f5f5f5;
            border-color: #999;
        }

        .btn-confirm {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #0b7dda;
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-confirm:hover {
            background: #0a6ab8;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(11, 125, 218, 0.3);
        }

        .btn-icon {
            font-size: 1.1rem;
        }

        /* TOAST NOTIFICATION */
        .toast {
            display: none;
            position: fixed;
            top: 30px;
            right: 30px;
            width: 350px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            padding: 1.25rem;
            align-items: flex-start;
            gap: 1rem;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            border-left: 4px solid;
        }

        .toast.success {
            border-left-color: #4CAF50;
        }

        .toast.error {
            border-left-color: #f44336;
        }

        .toast.warning {
            border-left-color: #FF9800;
        }

        .toast.info {
            border-left-color: #0b7dda;
        }

        .toast-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }

        .toast-content {
            flex: 1;
        }

        .toast-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.25rem;
        }

        .toast-message {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }

        .toast-close {
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 1.25rem;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .toast-close:hover {
            background: #f5f5f5;
            color: #333;
        }

        /* ANIMATIONS */
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
                transform: translate(-50%, -60%);
            }

            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    </style>

    <script>
        // VARIABLES GLOBALES
        let currentPaymentId = null;
        let toastTimeout = null;

        // FONCTIONS DE RECHERCHE ET FILTRES
        let searchTimeout;

        function debounceSearch() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 500);
        }

        function applyFilters() {
            const propertyId = document.getElementById('property-filter').value;
            const perPage = document.getElementById('per-page').value;
            const search = document.getElementById('search-input').value;
            const status = document.querySelector('.tab.active')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] ||
                'active';

            const params = new URLSearchParams();
            if (propertyId !== 'all') params.append('property_id', propertyId);
            if (perPage) params.append('per_page', perPage);
            if (search) params.append('search', search);
            if (status) params.append('status', status);

            window.location.href = '{{ route('co-owner.payments.index') }}?' + params.toString();
        }

        function resetFilters() {
            window.location.href = '{{ route('co-owner.payments.index') }}';
        }

        function switchTab(tab) {
            const params = new URLSearchParams(window.location.search);
            params.set('status', tab);
            window.location.href = window.location.pathname + '?' + params.toString();
        }

        // FONCTIONS DE MODALE
        function showSendReceiptModal(paymentId, tenantName, tenantEmail) {
            currentPaymentId = paymentId;
            document.getElementById('receipt-tenant-name').textContent = tenantName;
            document.getElementById('receipt-tenant-email').textContent = tenantEmail;
            openModal('sendReceiptModal');
        }

        function showExportModal() {
            selectExportFormat('csv');
            openModal('exportModal');
        }

        function openModal(modalId) {
            document.getElementById('overlay').style.display = 'block';
            document.getElementById(modalId).style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById(modalId).style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        function closeAllModals() {
            document.getElementById('overlay').style.display = 'none';
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
        }

        // FONCTIONS D'EXPORT
        function selectExportFormat(format) {
            document.getElementById('selected-format').value = format;

            document.querySelectorAll('.export-option').forEach(option => {
                option.classList.remove('selected');
            });

            if (format === 'csv') {
                document.getElementById('export-csv').classList.add('selected');
            } else {
                document.getElementById('export-pdf').classList.add('selected');
            }
        }

        function confirmExport() {
            const format = document.getElementById('selected-format').value;
            closeModal('exportModal');
            showToast('info', 'Export en cours', 'Génération du fichier ' + format.toUpperCase() + '...');
            window.location.href = '{{ route('co-owner.payments.export') }}?format=' + format;
        }

        // FONCTION D'ENVOI DE QUITTANCE
        function confirmSendReceipt() {
            if (!currentPaymentId) return;

            const confirmBtn = document.getElementById('confirmSendReceiptBtn');
            const originalText = confirmBtn.innerHTML;

            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="btn-icon">⏳</span> Envoi en cours...';

            fetch(`/coproprietaire/paiements/${currentPaymentId}/send-receipt`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    closeModal('sendReceiptModal');

                    if (data.success) {
                        showToast('success', 'Quittance envoyée', data.success);
                    } else if (data.error) {
                        showToast('error', 'Erreur', data.error);
                    }
                })
                .catch(error => {
                    closeModal('sendReceiptModal');
                    showToast('error', 'Erreur', 'Erreur lors de l\'envoi de la quittance');
                    console.error(error);
                })
                .finally(() => {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = originalText;
                    currentPaymentId = null;
                });
        }

        // FONCTION DE TOAST
        function showToast(type, title, message) {
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }

            const toast = document.getElementById('toast');

            toast.className = 'toast ' + type;
            document.getElementById('toast-title').textContent = title;
            document.getElementById('toast-message').textContent = message;

            const iconMap = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            document.getElementById('toast-icon').textContent = iconMap[type] || '✅';

            toast.style.display = 'flex';

            toastTimeout = setTimeout(() => {
                closeToast();
            }, 5000);
        }

        function closeToast() {
            const toast = document.getElementById('toast');
            toast.style.display = 'none';
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }
        }

        // INITIALISATION
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const searchInput = document.getElementById('search-input');

            if (urlParams.has('search')) {
                searchInput.value = urlParams.get('search');
            }

            @if (session('success'))
                showToast('success', 'Succès', '{{ session('success') }}');
                @php session()->forget('success'); @endphp
            @endif

            @if (session('error'))
                showToast('error', 'Erreur', '{{ session('error') }}');
                @php session()->forget('error'); @endphp
            @endif

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeAllModals();
                    closeToast();
                }
            });
        });
    </script>
@endsection
