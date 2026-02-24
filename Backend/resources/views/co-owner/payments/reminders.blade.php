@extends('layouts.co-owner')

@section('title', 'Rappels de paiement')

@section('content')
<div class="reminders-container">
    <!-- En-tête -->
    <div class="content-header">
        <div class="header-left">
            <h1>
                <i data-lucide="bell" style="width: 28px; height: 28px;"></i>
                Rappels de paiement
            </h1>
            <p>Gérez les rappels pour les paiements en retard</p>
        </div>
        <div class="header-actions">
            <a href="{{ route('co-owner.payments.index') }}" class="button button-secondary">
                <i data-lucide="arrow-left"></i>
                Retour aux paiements
            </a>
        </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon warning">
                <i data-lucide="clock"></i>
            </div>
            <div class="stat-content">
                <span class="stat-label">Paiements en retard</span>
                <span class="stat-value">{{ $latePayments->count() }}</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon danger">
                <i data-lucide="alert-triangle"></i>
            </div>
            <div class="stat-content">
                <span class="stat-label">Montant total</span>
                <span class="stat-value">{{ number_format($latePayments->sum('amount_total'), 0, ',', ' ') }} FCFA</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon info">
                <i data-lucide="users"></i>
            </div>
            <div class="stat-content">
                <span class="stat-label">Locataires concernés</span>
                <span class="stat-value">{{ $latePayments->pluck('lease.tenant_id')->unique()->count() }}</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon success">
                <i data-lucide="home"></i>
            </div>
            <div class="stat-content">
                <span class="stat-label">Biens concernés</span>
                <span class="stat-value">{{ $latePayments->pluck('lease.property_id')->unique()->count() }}</span>
            </div>
        </div>
    </div>

    <!-- Liste des rappels -->
    <div class="reminders-list">
        @if($latePayments->isEmpty())
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-lucide="check-circle" style="width: 64px; height: 64px;"></i>
                </div>
                <h3>Aucun rappel en attente</h3>
                <p>Tous les paiements sont à jour. Aucun rappel nécessaire pour le moment.</p>
                <a href="{{ route('co-owner.payments.index') }}" class="button button-primary">
                    <i data-lucide="arrow-left"></i>
                    Retour aux paiements
                </a>
            </div>
        @else
            @foreach($latePayments as $payment)
                <div class="reminder-card">
                    <div class="reminder-header">
                        <div class="tenant-info">
                            <div class="tenant-avatar">
                                {{ substr($payment->lease->tenant->user->first_name ?? 'L', 0, 1) }}{{ substr($payment->lease->tenant->user->last_name ?? 'T', 0, 1) }}
                            </div>
                            <div class="tenant-details">
                                <h3>{{ $payment->lease->tenant->user->full_name ?? 'Locataire inconnu' }}</h3>
                                <p>
                                    <i data-lucide="mail" style="width: 14px; height: 14px;"></i>
                                    {{ $payment->lease->tenant->user->email ?? 'Email non renseigné' }}
                                </p>
                                <p>
                                    <i data-lucide="phone" style="width: 14px; height: 14px;"></i>
                                    {{ $payment->lease->tenant->user->phone ?? 'Téléphone non renseigné' }}
                                </p>
                            </div>
                        </div>
                        <div class="payment-status">
                            <span class="status-badge danger">
                                <i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i>
                                {{ $payment->paid_at ? $payment->paid_at->diffForHumans() : 'En retard' }}
                            </span>
                        </div>
                    </div>

                    <div class="reminder-body">
                        <div class="property-info">
                            <i data-lucide="home"></i>
                            <div>
                                <strong>{{ $payment->lease->property->name }}</strong>
                                <span>{{ $payment->lease->property->address }}</span>
                            </div>
                        </div>

                        <div class="payment-details">
                            <div class="detail-item">
                                <span class="detail-label">Montant dû</span>
                                <span class="detail-value highlight">{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Date d'échéance</span>
                                <span class="detail-value">{{ $payment->invoice->due_date->format('d/m/Y') ?? 'Non définie' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Jours de retard</span>
                                <span class="detail-value danger">{{ $payment->invoice->due_date->diffInDays(now()) ?? 0 }} jours</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Méthode</span>
                                <span class="detail-value">{{ $payment->provider === 'manual' ? 'Manuel' : 'FEDAPAY' }}</span>
                            </div>
                        </div>

                        @if($payment->invoice && $payment->invoice->period_start)
                        <div class="period-info">
                            <i data-lucide="calendar"></i>
                            <span>Période : du {{ $payment->invoice->period_start->format('d/m/Y') }} au {{ $payment->invoice->period_end->format('d/m/Y') }}</span>
                        </div>
                        @endif
                    </div>

                    <div class="reminder-footer">
                        <div class="footer-left">
                            <span class="payment-id">#{{ $payment->id }}</span>
                            <span class="payment-date">Créé le {{ $payment->created_at->format('d/m/Y') }}</span>
                        </div>
                        <div class="footer-actions">
                            <button class="button button-primary send-reminder" data-payment-id="{{ $payment->id }}">
                                <i data-lucide="send"></i>
                                Envoyer un rappel
                            </button>
                            <a href="{{ route('co-owner.payments.show', $payment) }}" class="button button-secondary">
                                <i data-lucide="eye"></i>
                                Voir
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach

            <!-- Actions groupées -->
            <div class="bulk-actions">
                <button class="button button-primary" id="sendAllReminders">
                    <i data-lucide="mail"></i>
                    Envoyer tous les rappels
                </button>
                <button class="button button-secondary" id="exportReminders">
                    <i data-lucide="download"></i>
                    Exporter la liste
                </button>
            </div>
        @endif
    </div>
</div>

<style>
    :root {
        --gradA: #70AE48;
        --gradB: #8BC34A;
        --warning: #f59e0b;
        --danger: #ef4444;
        --success: #10b981;
        --info: #3b82f6;
        --ink: #0f172a;
        --muted: #64748b;
        --light-bg: #f8fafc;
        --border: #e2e8f0;
    }

    .reminders-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1.5rem;
    }

    /* En-tête */
    .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .header-left h1 {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--ink);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 0 0.5rem 0;
    }

    .header-left p {
        color: var(--muted);
        font-size: 0.95rem;
        margin: 0;
    }

    /* Grille de statistiques */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: white;
        border-radius: 16px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--border);
        transition: all 0.2s;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon.warning {
        background: rgba(245, 158, 11, 0.1);
        color: var(--warning);
    }

    .stat-icon.danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
    }

    .stat-icon.info {
        background: rgba(59, 130, 246, 0.1);
        color: var(--info);
    }

    .stat-icon.success {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
    }

    .stat-content {
        flex: 1;
    }

    .stat-label {
        display: block;
        font-size: 0.8rem;
        color: var(--muted);
        margin-bottom: 0.25rem;
    }

    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ink);
    }

    /* Liste des rappels */
    .reminders-list {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .reminder-card {
        background: white;
        border-radius: 20px;
        border: 1px solid var(--border);
        overflow: hidden;
        transition: all 0.2s;
    }

    .reminder-card:hover {
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }

    .reminder-header {
        padding: 1.25rem 1.5rem;
        background: linear-gradient(to right, rgba(239, 68, 68, 0.02), transparent);
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .tenant-info {
        display: flex;
        gap: 1rem;
    }

    .tenant-avatar {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--gradA), var(--gradB));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.1rem;
    }

    .tenant-details h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--ink);
    }

    .tenant-details p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: var(--muted);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 100px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .status-badge.danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
    }

    .reminder-body {
        padding: 1.5rem;
    }

    .property-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--light-bg);
        border-radius: 12px;
        margin-bottom: 1.25rem;
    }

    .property-info i {
        color: var(--gradA);
        width: 20px;
        height: 20px;
    }

    .property-info div {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .property-info strong {
        color: var(--ink);
        font-size: 1rem;
    }

    .property-info span {
        color: var(--muted);
        font-size: 0.9rem;
    }

    .payment-details {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-bottom: 1rem;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .detail-label {
        font-size: 0.8rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .detail-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--ink);
    }

    .detail-value.highlight {
        color: var(--gradA);
    }

    .detail-value.danger {
        color: var(--danger);
    }

    .period-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: var(--light-bg);
        border-radius: 8px;
        font-size: 0.9rem;
        color: var(--muted);
    }

    .period-info i {
        color: var(--gradA);
        width: 16px;
        height: 16px;
    }

    .reminder-footer {
        padding: 1rem 1.5rem;
        background: var(--light-bg);
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .footer-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .payment-id {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--gradA);
    }

    .payment-date {
        font-size: 0.85rem;
        color: var(--muted);
    }

    .footer-actions {
        display: flex;
        gap: 0.75rem;
    }

    /* Boutons */
    .button {
        padding: 0.6rem 1.2rem;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        text-decoration: none;
    }

    .button-primary {
        background: linear-gradient(135deg, var(--gradA), var(--gradB));
        color: white;
        box-shadow: 0 4px 12px rgba(112, 174, 72, 0.2);
    }

    .button-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(112, 174, 72, 0.3);
    }

    .button-secondary {
        background: white;
        color: var(--ink);
        border: 1px solid var(--border);
    }

    .button-secondary:hover {
        background: var(--light-bg);
        border-color: var(--gradA);
    }

    /* Actions groupées */
    .bulk-actions {
        margin-top: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 16px;
        border: 1px solid var(--border);
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    /* État vide */
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 24px;
        border: 1px solid var(--border);
    }

    .empty-icon {
        color: var(--success);
        margin-bottom: 1.5rem;
    }

    .empty-state h3 {
        font-size: 1.5rem;
        color: var(--ink);
        margin: 0 0 0.5rem 0;
    }

    .empty-state p {
        color: var(--muted);
        margin: 0 0 2rem 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .payment-details {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .reminders-container {
            padding: 1rem;
        }

        .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .reminder-header {
            flex-direction: column;
            gap: 1rem;
        }

        .tenant-info {
            width: 100%;
        }

        .payment-details {
            grid-template-columns: 1fr;
        }

        .reminder-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .footer-actions {
            width: 100%;
        }

        .footer-actions .button {
            flex: 1;
            justify-content: center;
        }

        .bulk-actions {
            flex-direction: column;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Envoi d'un rappel individuel
        document.querySelectorAll('.send-reminder').forEach(button => {
            button.addEventListener('click', function() {
                const paymentId = this.dataset.paymentId;

                // Modale de confirmation
                if (confirm('Voulez-vous envoyer un rappel de paiement à ce locataire ?')) {
                    // Redirection vers la route d'envoi
                    window.location.href = `{{ route('co-owner.payments.reminders') }}/${paymentId}/send`;
                }
            });
        });

        // Envoi de tous les rappels
        const sendAllBtn = document.getElementById('sendAllReminders');
        if (sendAllBtn) {
            sendAllBtn.addEventListener('click', function() {
                if (confirm('Voulez-vous envoyer des rappels à tous les locataires concernés ?')) {
                    alert('Fonctionnalité à implémenter : envoi groupé des rappels');
                }
            });
        }

        // Export des rappels
        const exportBtn = document.getElementById('exportReminders');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                alert('Fonctionnalité à implémenter : export des rappels');
            });
        }
    });
</script>
@endsection
