@extends('layouts.co-owner')

@section('title', 'Comptabilité et travaux - Copropriétaire')

@section('content')

@if(isset($error))
    <div class="alert alert-danger" style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #f87171;">
        <strong>Erreur:</strong> {{ $error }}
    </div>
@endif

<div class="accounting-container">
    <!-- Header -->
    <div class="page-header">
        <div class="header-content">
            <h1>Comptabilité et travaux</h1>
            <p class="subtitle">Suivez vos revenus et dépenses locatives en temps réel.<br>Exportez vos données comptables et générez vos déclarations fiscales.</p>
        </div>
        <div class="header-actions">
            <button class="btn-export" onclick="exportData()">
                <i data-lucide="download" style="width: 18px; height: 18px;"></i>
                Exporter
            </button>
            <a href="{{ route('co-owner.payments.create') }}" class="btn-add">
                <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                Ajouter une transaction
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
        <div class="stat-card stat-primary">
            <div class="stat-label">RÉSULTAT NET {{ $currentYear }}</div>
            <div class="stat-value">+ {{ $stats['resultat_net_formatted'] }}</div>
            <div class="stat-variation">{{ $stats['variation'] }} vs {{ $currentYear - 1 }}</div>
        </div>

        <div class="stat-card">
            <div class="stat-label">REVENUS LOCATIFS</div>
            <div class="stat-value text-green">{{ $stats['revenus_formatted'] }}</div>
            <div class="stat-sublabel">{{ $stats['active_properties'] }} biens actifs</div>
        </div>

        <div class="stat-card">
            <div class="stat-label">CHARGES TOTALES</div>
            <div class="stat-value text-red">{{ $stats['charges_formatted'] }}</div>
            <div class="stat-sublabel">{{ $stats['transactions_count'] }} transactions</div>
        </div>

        <div class="stat-card">
            <div class="stat-label">TAUX DE RENTABILITÉ</div>
            <div class="stat-value text-green">{{ $stats['rentabilite'] }}%</div>
            <div class="stat-sublabel">Brut annuel</div>
        </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
        <div class="chart-card chart-large">
            <div class="chart-header">
                <div class="chart-title">
                    <i data-lucide="trending-up" style="width: 20px; height: 20px;"></i>
                    Revenus mensuels
                </div>
                <select class="year-select" id="chartYear" onchange="updateCharts()">
                    @foreach($years as $year)
                        <option value="{{ $year }}" {{ $year == $currentYear ? 'selected' : '' }}>{{ $year }}</option>
                    @endforeach
                    @if(empty($years))
                        <option value="{{ date('Y') }}" selected>{{ date('Y') }}</option>
                    @endif
                </select>
            </div>
            <div class="chart-container">
                <canvas id="revenueChart"></canvas>
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-dot dot-green"></span>
                    <span>Loyers reçus</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot dot-orange"></span>
                    <span>Moyenne mensuelle</span>
                </div>
            </div>
        </div>

        <div class="chart-card chart-small">
            <div class="chart-title centered">Taux d'occupation</div>
            <div class="chart-container doughnut-container">
                <canvas id="occupancyChart"></canvas>
            </div>
            <div class="occupancy-stats">
                <div class="occupancy-item">
                    <div class="occupancy-number text-green">{{ $stats['occupied'] }}</div>
                    <div class="occupancy-label">Occupés</div>
                </div>
                <div class="occupancy-item">
                    <div class="occupancy-number text-yellow">{{ $stats['vacant'] }}</div>
                    <div class="occupancy-label">Vacants</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Categories Section -->
    <div class="categories-section">
        <div class="category-card">
            <h4><i data-lucide="arrow-up-circle" style="width: 16px; height: 16px; color: #70AE48;"></i> Revenus par catégorie</h4>
            <div class="category-list">
                @foreach($stats['revenus_par_categorie'] as $name => $amount)
                    @if($amount > 0)
                        <div class="category-item">
                            <span>{{ $name }}</span>
                            <span class="amount">{{ number_format($amount, 0, ',', ' ') }} FCFA</span>
                        </div>
                    @endif
                @endforeach
                @if(array_sum($stats['revenus_par_categorie']) == 0)
                    <div class="category-item">
                        <span>Aucun revenu</span>
                        <span class="amount">0 FCFA</span>
                    </div>
                @endif
                <div class="category-item total">
                    <span>Total revenus</span>
                    <span class="amount text-green">{{ number_format(array_sum($stats['revenus_par_categorie']), 0, ',', ' ') }} FCFA</span>
                </div>
            </div>
        </div>

        <div class="category-card">
            <h4><i data-lucide="arrow-down-circle" style="width: 16px; height: 16px; color: #ef4444;"></i> Charges par catégorie</h4>
            <div class="category-list">
                @foreach($stats['charges_par_categorie'] as $name => $amount)
                    @if($amount > 0)
                        <div class="category-item">
                            <span>{{ $name }}</span>
                            <span class="amount">{{ number_format($amount, 0, ',', ' ') }} FCFA</span>
                        </div>
                    @endif
                @endforeach
                @if(array_sum($stats['charges_par_categorie']) == 0)
                    <div class="category-item">
                        <span>Aucune charge</span>
                        <span class="amount">0 FCFA</span>
                    </div>
                @endif
                <div class="category-item total">
                    <span>Total charges</span>
                    <span class="amount text-red">{{ $stats['charges_formatted'] }}</span>
                </div>
            </div>
        </div>

        <div class="category-card">
            <h4><i data-lucide="home" style="width: 16px; height: 16px; color: #70AE48;"></i> Performance par bien</h4>
            <div class="category-list">
                @if(!empty($stats['repartition_par_bien']))
                    @foreach(array_slice($stats['repartition_par_bien'], 0, 5, true) as $name => $data)
                        <div class="category-item">
                            <span title="{{ $name }}">{{ \Illuminate\Support\Str::limit($name, 20) }}</span>
                            <span class="amount {{ $data['resultat'] >= 0 ? 'text-green' : 'text-red' }}">
                                {{ $data['resultat'] >= 0 ? '+' : '' }}{{ number_format($data['resultat'], 0, ',', ' ') }} FCFA
                            </span>
                        </div>
                    @endforeach
                @else
                    <div class="category-item">
                        <span>Aucun résultat</span>
                        <span class="amount">0 FCFA</span>
                    </div>
                @endif
                <div class="category-item total">
                    <span>Résultat total</span>
                    <span class="amount text-green">+{{ $stats['resultat_net_formatted'] }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Pills -->
    <div class="filter-pills">
        <button class="pill active" onclick="filterTransactions('all', this)">Toutes les transactions</button>
        <button class="pill" onclick="filterTransactions('revenu', this)">Revenus</button>
        <button class="pill" onclick="filterTransactions('charge', this)">Charges</button>
        <button class="pill" onclick="filterByMonth('01', this)">Janvier {{ $currentYear }}</button>
        <button class="pill" onclick="filterByMonth('02', this)">Février {{ $currentYear }}</button>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
        <h3 class="filters-title">FILTRER LES TRANSACTIONS</h3>
        <div class="filters-row">
            <div class="filter-select-wrapper">
                <select id="propertyFilter" class="filter-select" onchange="applyFilters()">
                    <option value="all">Tous les biens</option>
                    @foreach($properties as $property)
                        <option value="{{ $property->id }}">{{ \Illuminate\Support\Str::limit($property->name ?? $property->address, 30) }}</option>
                    @endforeach
                </select>
                <i data-lucide="chevron-down" class="select-icon"></i>
            </div>

            <div class="filter-select-wrapper">
                <select id="categoryFilter" class="filter-select" onchange="applyFilters()">
                    <option value="all">Toutes les catégories</option>
                    <option value="Loyer">Loyer</option>
                    <option value="Dépôt de garantie">Dépôt de garantie</option>
                    <option value="Charges">Charges</option>
                    <option value="Réparations">Réparations</option>
                </select>
                <i data-lucide="chevron-down" class="select-icon"></i>
            </div>
        </div>

        <div class="search-row">
            <div class="search-input-wrapper">
                <i data-lucide="search" class="search-icon"></i>
                <input type="text" id="searchInput" class="search-input" placeholder="Rechercher une transaction" onkeyup="applyFilters()">
            </div>
            <div class="transactions-count">
                <span id="transactionCount">{{ $transactions->count() }}</span> transactions
            </div>
        </div>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-card">
        <h3 class="transactions-title">Dernières transactions</h3>
        <div class="table-responsive">
            <table class="transactions-table" id="transactionsTable">
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>TYPE</th>
                        <th>DESCRIPTION</th>
                        <th>BIEN</th>
                        <th>CATÉGORIE</th>
                        <th>MONTANT</th>
                    </tr>
                </thead>
                <tbody id="transactionsBody">
                    @forelse($transactions as $transaction)
                        @php
                            $isRevenu = $transaction->type === 'REVENU';
                            $amountClass = $isRevenu ? 'text-green' : 'text-red';
                            $sign = $isRevenu ? '+' : '-';
                            $date = $transaction->date ? \Carbon\Carbon::parse($transaction->date)->format('d M Y') : 'N/A';
                            $propertyName = $transaction->property_name ?? 'N/A';
                            $typeText = $isRevenu ? 'REVENU' : 'CHARGE';
                            $currency = $transaction->currency ?? 'FCFA';
                        @endphp
                        <tr class="transaction-row" data-type="{{ strtolower($transaction->type) }}" data-property="{{ $transaction->property_id ?? '' }}" data-category="{{ $transaction->category }}">
                            <td>{{ $date }}</td>
                            <td>
                                <span class="badge {{ $isRevenu ? 'badge-revenu' : 'badge-charge' }}">
                                    {{ $typeText }}
                                </span>
                            </td>
                            <td>{{ $transaction->description }}</td>
                            <td>{{ \Illuminate\Support\Str::limit($propertyName, 20) }}</td>
                            <td>{{ $transaction->category }}</td>
                            <td class="amount {{ $amountClass }}">{{ $sign }} {{ number_format($transaction->amount, 0, ',', ' ') }} {{ $currency }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="empty-cell">
                                <div class="empty-state">
                                    <i data-lucide="file-text" style="width: 48px; height: 48px;"></i>
                                    <p>Aucune transaction trouvée</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Données pour les graphiques
    const chartData = @json($chartData);
    const occupancyData = {
        occupied: {{ $stats['occupied'] }},
        vacant: {{ $stats['vacant'] }}
    };

    let revenueChart, occupancyChart;

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        initCharts();
        updateTransactionCount();
    });

    function initCharts() {
        // Graphique des revenus (barres)
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        revenueChart = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.month),
                datasets: [
                    {
                        label: 'Loyers reçus',
                        data: chartData.map(d => d.received),
                        backgroundColor: '#70AE48', // Vert
                        borderRadius: 4,
                        barPercentage: 0.6,
                    },
                    {
                        label: 'Moyenne mensuelle',
                        data: chartData.map(d => d.average),
                        backgroundColor: '#f59e0b', // Orange
                        borderRadius: 4,
                        barPercentage: 0.6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toLocaleString('fr-FR') + ' FCFA';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR') + ' FCFA';
                            }
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Graphique d'occupation (doughnut) - Vert et Jaune
        const occupancyCtx = document.getElementById('occupancyChart').getContext('2d');
        occupancyChart = new Chart(occupancyCtx, {
            type: 'doughnut',
            data: {
                labels: ['Occupés', 'Vacants'],
                datasets: [{
                    data: [occupancyData.occupied, occupancyData.vacant],
                    backgroundColor: ['#70AE48', '#fbbf24'], // Vert et Jaune
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    function updateCharts() {
        const year = document.getElementById('chartYear').value;

        fetch(`{{ route('co-owner.accounting.data') }}?year=${year}`)
            .then(response => response.json())
            .then(data => {
                revenueChart.data.datasets[0].data = data.data.map(d => d.received);
                revenueChart.data.datasets[1].data = data.data.map(d => d.average);
                revenueChart.update();
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour des graphiques:', error);
            });
    }

    function filterTransactions(type, btn) {
        document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');

        const rows = document.querySelectorAll('.transaction-row');
        rows.forEach(row => {
            if (type === 'all' || row.dataset.type === type) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        updateTransactionCount();
    }

    function filterByMonth(month, btn) {
        document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');

        const rows = document.querySelectorAll('.transaction-row');
        rows.forEach(row => {
            const dateCell = row.cells[0].textContent;
            const rowMonth = dateCell.split(' ')[1];

            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const targetMonth = monthNames[parseInt(month) - 1];

            if (dateCell.includes(targetMonth)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        updateTransactionCount();
    }

    function applyFilters() {
        const propertyFilter = document.getElementById('propertyFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        const rows = document.querySelectorAll('.transaction-row');
        rows.forEach(row => {
            let show = true;

            if (propertyFilter !== 'all' && row.dataset.property !== propertyFilter) {
                show = false;
            }

            if (categoryFilter !== 'all') {
                const rowCategory = row.dataset.category;
                if (rowCategory !== categoryFilter) {
                    show = false;
                }
            }

            if (searchTerm) {
                const text = row.textContent.toLowerCase();
                if (!text.includes(searchTerm)) {
                    show = false;
                }
            }

            row.style.display = show ? '' : 'none';
        });

        updateTransactionCount();
    }

    function updateTransactionCount() {
        const visibleRows = document.querySelectorAll('.transaction-row:not([style*="display: none"])');
        document.getElementById('transactionCount').textContent = visibleRows.length;
    }

    function exportData() {
        // Créer un CSV avec les données
        const rows = document.querySelectorAll('.transaction-row');
        let csv = 'Date;Type;Description;Bien;Catégorie;Montant\n';

        rows.forEach(row => {
            if (row.style.display !== 'none') {
                const cells = row.cells;
                const date = cells[0].textContent;
                const type = cells[1].textContent.trim();
                const description = cells[2].textContent.replace(/;/g, ',');
                const bien = cells[3].textContent.replace(/;/g, ',');
                const categorie = cells[4].textContent;
                const montant = cells[5].textContent.replace(' FCFA', '');

                csv += `${date};${type};${description};${bien};${categorie};${montant}\n`;
            }
        });

        // Télécharger le fichier
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'transactions_' + new Date().toISOString().slice(0,10) + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>

<style>
    .accounting-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        background: #f8fafc;
        min-height: 100vh;
    }

    .page-header {
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
        font-size: 1rem;
        line-height: 1.6;
        margin: 0;
    }

    .header-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .btn-export {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: #f97316;
        color: white;
        border: none;
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-export:hover {
        background: #ea580c;
        transform: translateY(-1px);
    }

    .btn-add {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        background: #70AE48;
        color: white;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s;
    }

    .btn-add:hover {
        background: #5d8f3a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(112, 174, 72, 0.3);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .stat-primary {
        background: #70AE48;
        color: white;
        border-color: #70AE48;
    }

    .stat-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }

    .stat-primary .stat-label {
        color: rgba(255, 255, 255, 0.8);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 0.25rem;
    }

    .stat-primary .stat-value {
        color: white;
    }

    .text-green { color: #70AE48; }
    .text-red { color: #ef4444; }
    .text-yellow { color: #f59e0b; }
    .text-blue { color: #3b82f6; }

    .stat-variation {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .stat-sublabel {
        font-size: 0.8rem;
        color: #94a3b8;
    }

    .charts-section {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .chart-card {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .chart-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
    }

    .chart-title.centered {
        justify-content: center;
        margin-bottom: 1rem;
    }

    .chart-title i {
        color: #70AE48;
    }

    .year-select {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.9rem;
        background: white;
        cursor: pointer;
    }

    .chart-container {
        height: 300px;
        position: relative;
    }

    .doughnut-container {
        height: 200px;
        display: flex;
        justify-content: center;
    }

    .chart-legend {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1rem;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #64748b;
    }

    .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }

    .dot-green { background: #70AE48; }
    .dot-orange { background: #f59e0b; }

    .occupancy-stats {
        display: flex;
        justify-content: center;
        gap: 3rem;
        margin-top: 1.5rem;
    }

    .occupancy-item {
        text-align: center;
    }

    .occupancy-number {
        font-size: 2rem;
        font-weight: 700;
    }

    .occupancy-label {
        font-size: 0.875rem;
        color: #64748b;
    }

    .categories-section {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .category-card {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .category-card h4 {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .category-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        color: #374151;
    }

    .category-item.total {
        padding-top: 0.75rem;
        border-top: 1px solid #e2e8f0;
        font-weight: 600;
    }

    .category-item .amount {
        font-weight: 600;
    }

    .filter-pills {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .pill {
        padding: 0.75rem 1.5rem;
        background: #e2e8f0;
        color: #475569;
        border: none;
        border-radius: 50px;
        font-weight: 500;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .pill:hover {
        background: #cbd5e1;
    }

    .pill.active {
        background: #70AE48;
        color: white;
    }

    .filters-card {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
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

    .filters-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
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
    }

    .filter-select:focus {
        outline: none;
        border-color: #5d8f3a;
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
        display: flex;
        align-items: center;
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
    }

    .search-input:focus {
        outline: none;
        border-color: #5d8f3a;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .transactions-count {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
        white-space: nowrap;
    }

    .transactions-card {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .transactions-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 1rem 0;
    }

    .table-responsive {
        overflow-x: auto;
    }

    .transactions-table {
        width: 100%;
        border-collapse: collapse;
    }

    .transactions-table th {
        text-align: left;
        padding: 0.75rem;
        font-size: 0.7rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e2e8f0;
    }

    .transactions-table td {
        padding: 0.875rem 0.75rem;
        font-size: 0.875rem;
        color: #374151;
        border-bottom: 1px solid #f1f5f9;
    }

    .transactions-table tr:hover {
        background: #f8fafc;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.05em;
    }

    .badge-revenu {
        background: #e6f2e0;
        color: #70AE48;
    }

    .badge-charge {
        background: #fee2e2;
        color: #dc2626;
    }

    .amount {
        font-weight: 600;
    }

    .empty-cell {
        text-align: center;
        padding: 3rem;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        color: #94a3b8;
    }

    @media (max-width: 1024px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .charts-section {
            grid-template-columns: 1fr;
        }

        .categories-section {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            align-items: stretch;
        }

        .header-actions {
            flex-direction: row;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .filters-row {
            grid-template-columns: 1fr;
        }

        .search-row {
            flex-direction: column;
            align-items: stretch;
        }

        .transactions-count {
            text-align: center;
        }
    }
</style>
@endsection
