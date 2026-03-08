@extends('layouts.co-owner')

@section('title', $tenant->first_name . ' ' . $tenant->last_name . ' - Fiche Locataire')

@section('content')
<div class="content-container">
    <div class="top-actions">
        <a href="{{ route('co-owner.tenants.index') }}" class="button button-secondary">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
            Retour à la liste
        </a>
        <div class="top-actions-right">
            <a href="{{ route('co-owner.tenants.edit', $tenant) }}" class="button button-primary">
                <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                Modifier
            </a>
        </div>
    </div>

    @if (session('success'))
        <div class="alert alert-success">
            <i data-lucide="check-circle" style="width: 20px; height: 20px; color: #70AE48;"></i>
            <div>
                <strong>Succès !</strong>
                <p style="margin: 0.25rem 0 0 0;">{{ session('success') }}</p>
            </div>
        </div>
    @endif

    @if (session('error'))
        <div class="alert alert-warning">
            <i data-lucide="alert-circle" style="width: 20px; height: 20px; color: #d97706;"></i>
            <div>
                <strong>Attention !</strong>
                <p style="margin: 0.25rem 0 0 0;">{{ session('error') }}</p>
            </div>
        </div>
    @endif

    <!-- En-tête locataire -->
    <div class="section-card">
        <div class="tenant-header">
            <div class="tenant-avatar" style="background: #70AE48 !important;">
                {{ strtoupper(substr($tenant->first_name, 0, 1)) }}{{ strtoupper(substr($tenant->last_name, 0, 1)) }}
            </div>

            <div class="tenant-info">
                <h1 class="tenant-name">
                    {{ $tenant->first_name }} {{ $tenant->last_name }}
                    <span class="tenant-badge {{ $tenant->status === 'active' ? 'badge-active' : 'badge-pending' }}">
                        <i data-lucide="{{ $tenant->status === 'active' ? 'check-circle' : 'clock' }}" style="width: 14px; height: 14px;"></i>
                        {{ $tenant->status === 'active' ? 'Actif' : 'En attente' }}
                    </span>
                </h1>
                <div class="tenant-meta">
                    <span class="meta-item">
                        <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                        {{ $tenant->user->email ?? 'Non défini' }}
                    </span>
                    <span class="meta-item">
                        <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                        {{ $tenant->user->phone ?? 'Non défini' }}
                    </span>
                    <span class="meta-item">
                        <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                        Créé le {{ $tenant->created_at->format('d/m/Y') }}
                    </span>
                    <span class="meta-item">
                        <i data-lucide="user-check" style="width: 16px; height: 16px;"></i>
                        Email vérifié :
                        @if($tenant->user->email_verified_at)
                            <span class="badge-small badge-success">
                                <i data-lucide="check" style="width: 12px; height: 12px;"></i>
                                Oui
                            </span>
                        @else
                            <span class="badge-small badge-warning">
                                <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                                Non
                            </span>
                        @endif
                    </span>
                </div>
            </div>
        </div>

        @if($tenant->status === 'candidate')
            <div class="alert alert-warning">
                <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #d97706;"></i>
                <div style="flex: 1;">
                    <strong>En attente d'acceptation</strong>
                    <p style="margin: 0.25rem 0 0 0;">Le locataire n'a pas encore accepté l'invitation.</p>
                    <form action="{{ route('co-owner.tenants.resend-invitation', $tenant) }}"
                          method="POST" style="margin-top: 0.75rem;">
                        @csrf
                        <button type="submit" class="button" style="background: rgba(245,158,11,.12); color: #854d0e; border-color: rgba(245,158,11,.25);">
                            <i data-lucide="paper-plane" style="width: 16px; height: 16px;"></i>
                            Renvoyer l'invitation
                        </button>
                    </form>
                </div>
            </div>
        @endif
    </div>

    <!-- Statistiques -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon primary">
                <i data-lucide="home" style="width: 20px; height: 20px;"></i>
            </div>
            <div class="stat-value">{{ $tenant->leases->count() }}</div>
            <div class="stat-label">Biens assignés</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon success">
                <i data-lucide="calendar" style="width: 20px; height: 20px;"></i>
            </div>
            <div class="stat-value">{{ $tenant->created_at->diffForHumans() }}</div>
            <div class="stat-label">Dans le système</div>
        </div>

        <div class="stat-card">
            <div class="stat-icon warning">
                <i data-lucide="file-text" style="width: 20px; height: 20px;"></i>
            </div>
            <div class="stat-value">{{ $tenant->leases->where('status', 'active')->count() }}</div>
            <div class="stat-label">Baux actifs</div>
        </div>
    </div>

    <!-- Biens assignés -->
    <div class="section-card">
        <div class="section-title">
            <span>
                <i data-lucide="home" style="width: 20px; height: 20px;"></i>
                Biens assignés
            </span>
            <span class="pill" style="background: rgba(112, 174, 72, 0.12); color: #70AE48;">
                {{ $tenant->leases->count() }} bien(s)
            </span>
        </div>

        @if($tenant->leases->count() > 0)
            <div class="property-grid">
                @foreach($tenant->leases as $lease)
                    <div class="property-card">
                        <div class="property-header">
                            <div>
                                <h3 class="property-name">{{ $lease->property->name }}</h3>
                                <p class="property-address">
                                    <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                                    {{ $lease->property->address }}, {{ $lease->property->city }}
                                </p>
                            </div>
                            <div class="property-rent">
                                {{ number_format($lease->rent_amount, 2) }} FCFA/mois
                            </div>
                        </div>

                        <div class="property-details">
                            <div class="detail-item">
                                <span class="detail-label">Période</span>
                                <span class="detail-value">
                                    {{ $lease->start_date->format('d/m/Y') }}
                                    @if($lease->end_date)
                                        - {{ $lease->end_date->format('d/m/Y') }}
                                    @else
                                        - Indéterminée
                                    @endif
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Statut</span>
                                <span class="detail-value">
                                    <span class="badge-small {{ $lease->status === 'active' ? 'badge-success' : 'badge-warning' }}">
                                        {{ $lease->status === 'active' ? 'Actif' : ucfirst($lease->status) }}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div class="property-actions">
                            <form action="{{ route('co-owner.tenants.unassign', [$tenant, $lease->property]) }}"
                                  method="POST" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit"
                                        class="button button-danger"
                                        style="font-size: 0.85rem; padding: 0.6rem 1rem;"
                                        onclick="return confirm('Êtes-vous sûr de vouloir désassigner ce bien ?')">
                                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                                    Désassigner
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="empty-state">
                <i data-lucide="home" class="empty-icon"></i>
                <h3 style="color: var(--muted); margin-bottom: 0.5rem;">Aucun bien assigné</h3>
                <p style="color: var(--muted2); margin-bottom: 1.5rem;">Ce locataire n'a pas encore de bien assigné.</p>
                <a href="{{ route('co-owner.assign-property.create') }}" class="button button-primary">
                    <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                    Assigner un bien
                </a>
            </div>
        @endif
    </div>

    <!-- Informations personnelles -->
    <div class="section-card">
        <div class="section-title">
            <span>
                <i data-lucide="user" style="width: 20px; height: 20px;"></i>
                Informations personnelles
            </span>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">
                    <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                    Date de naissance
                </span>
                <span class="info-value">{{ $tenant->birth_date ? \Carbon\Carbon::parse($tenant->birth_date)->format('d/m/Y') : 'Non défini' }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">
                    <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                    Lieu de naissance
                </span>
                <span class="info-value">{{ $tenant->birth_place ?? 'Non défini' }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">
                    <i data-lucide="users" style="width: 14px; height: 14px;"></i>
                    Situation familiale
                </span>
                <span class="info-value">
                    @php
                        $statuses = [
                            'single' => 'Célibataire',
                            'married' => 'Marié(e)',
                            'divorced' => 'Divorcé(e)',
                            'widowed' => 'Veuf/Veuve',
                            'pacs' => 'PACS',
                            'concubinage' => 'Concubinage'
                        ];
                    @endphp
                    {{ $statuses[$tenant->marital_status] ?? 'Non défini' }}
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">
                    <i data-lucide="briefcase" style="width: 14px; height: 14px;"></i>
                    Profession
                </span>
                <span class="info-value">{{ $tenant->profession ?? 'Non défini' }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">
                    <i data-lucide="building" style="width: 14px; height: 14px;"></i>
                    Employeur
                </span>
                <span class="info-value">{{ $tenant->employer ?? 'Non défini' }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">
                    <i data-lucide="fcfa" style="width: 14px; height: 14px;"></i>
                    Revenu annuel
                </span>
                <span class="info-value">
                    @if($tenant->annual_income)
                        {{ number_format($tenant->annual_income, 2) }} FCFA
                    @else
                        Non défini
                    @endif
                </span>
            </div>
        </div>

        @if($tenant->notes)
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(17,24,39,.08);">
                <h3 class="form-label" style="margin-bottom: 0.75rem;">
                    <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                    Notes
                </h3>
                <p style="color: var(--ink); line-height: 1.6;">{{ $tenant->notes }}</p>
            </div>
        @endif
    </div>

    <!-- Contact d'urgence -->
    @if($tenant->emergency_contact_name || $tenant->emergency_contact_phone)
        <div class="section-card">
            <div class="section-title">
                <span>
                    <i data-lucide="alert-triangle" style="width: 20px; height: 20px;"></i>
                    Contact d'urgence
                </span>
            </div>

            <div class="info-grid">
                @if($tenant->emergency_contact_name)
                    <div class="info-item">
                        <span class="info-label">
                            <i data-lucide="user" style="width: 14px; height: 14px;"></i>
                            Nom et prénom
                        </span>
                        <span class="info-value">{{ $tenant->emergency_contact_name }}</span>
                    </div>
                @endif

                @if($tenant->emergency_contact_phone)
                    <div class="info-item">
                        <span class="info-label">
                            <i data-lucide="phone" style="width: 14px; height: 14px;"></i>
                            Téléphone
                        </span>
                        <span class="info-value">{{ $tenant->emergency_contact_phone }}</span>
                    </div>
                @endif
            </div>
        </div>
    @endif
</div>

<style>
    :root {
        --gradA: #70AE48;
        --gradB: #8BC34A;
        --indigo: #70AE48;
        --violet: #8BC34A;
        --emerald: #10b981;
        --ink: #0f172a;
        --muted: #64748b;
        --muted2: #94a3b8;
        --line: rgba(15,23,42,.10);
        --line2: rgba(15,23,42,.08);
        --shadow: 0 22px 70px rgba(0,0,0,.18);
    }

    .content-container {
        padding: 1.5rem;
        max-width: 84rem;
        margin: 0 auto;
    }

    .top-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .top-actions-right {
        display: flex;
        gap: .75rem;
        flex-wrap: wrap;
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
        background: #70AE48;
        color: #fff;
        box-shadow: 0 14px 30px rgba(112, 174, 72, 0.22);
    }

    .button-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 18px 34px rgba(112, 174, 72, 0.28);
    }

    .button-secondary {
        background: rgba(255,255,255,.92);
        color: #70AE48;
        border: 2px solid rgba(112, 174, 72, 0.20);
    }

    .button-secondary:hover {
        background: rgba(112, 174, 72, 0.06);
    }

    .button-danger {
        background: rgba(255,255,255,.92);
        color: #e11d48;
        border: 2px solid rgba(225,29,72,.18);
    }

    .button-danger:hover {
        background: rgba(225,29,72,.06);
    }

    .alert {
        padding: 1.25rem;
        border-radius: 14px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        border: 1px solid rgba(15,23,42,.08);
        backdrop-filter: blur(10px);
    }

    .alert-warning {
        background: rgba(254,252,232,.92);
        border-color: rgba(245,158,11,.30);
    }

    .alert-success {
        background: rgba(112, 174, 72, 0.1);
        border-color: rgba(112, 174, 72, 0.3);
    }

    .section-card {
        background: rgba(255,255,255,.92);
        border: 1px solid rgba(17,24,39,.08);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px rgba(17,24,39,.06);
        backdrop-filter: blur(10px);
    }

    .tenant-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .tenant-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
        font-weight: bold;
        box-shadow: 0 14px 30px rgba(112, 174, 72, 0.22);
    }

    .tenant-info {
        flex: 1;
    }

    .tenant-name {
        font-size: 1.8rem;
        font-weight: 900;
        color: var(--ink);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .tenant-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        font-weight: 950;
        font-size: 0.82rem;
        border: 1px solid rgba(255,255,255,.18);
    }

    .badge-active {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
    }

    .badge-pending {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
    }

    .tenant-meta {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        margin-top: 0.75rem;
    }

    .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--muted);
        font-weight: 650;
    }

    .badge-small {
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 850;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }

    .badge-success {
        background: rgba(16,185,129,.12);
        color: #065f46;
        border: 1px solid rgba(16,185,129,.18);
    }

    .badge-warning {
        background: rgba(245,158,11,.12);
        color: #854d0e;
        border: 1px solid rgba(245,158,11,.18);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: rgba(255,255,255,.92);
        border: 1px solid rgba(17,24,39,.08);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(17,24,39,.06);
        backdrop-filter: blur(10px);
    }

    .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .stat-icon.primary {
        background: rgba(112, 174, 72, 0.12);
        color: #70AE48;
    }

    .stat-icon.success {
        background: rgba(16,185,129,.12);
        color: var(--emerald);
    }

    .stat-icon.warning {
        background: rgba(245,158,11,.12);
        color: #f59e0b;
    }

    .stat-value {
        font-size: 1.8rem;
        font-weight: 900;
        color: var(--ink);
        margin: 0.25rem 0;
    }

    .stat-label {
        font-size: 0.85rem;
        color: var(--muted);
        font-weight: 650;
    }

    .section-title {
        font-size: 1.2rem;
        font-weight: 900;
        color: var(--ink);
        margin-bottom: 1.5rem;
        padding-bottom: 0.85rem;
        border-bottom: 2px solid rgba(112, 174, 72, 0.28);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        gap: .45rem;
        padding: .25rem .6rem;
        border-radius: 999px;
        background: rgba(112, 174, 72, 0.10);
        border: 1px solid rgba(112, 174, 72, 0.18);
        color: #70AE48;
        font-weight: 950;
        font-size: .78rem;
    }

    .property-grid {
        display: grid;
        gap: 1.25rem;
    }

    .property-card {
        background: white;
        border: 1px solid rgba(17,24,39,.08);
        border-radius: 14px;
        padding: 1.5rem;
        transition: all 0.2s ease;
        border-left: 4px solid #70AE48;
        box-shadow: 0 8px 25px rgba(17,24,39,.05);
    }

    .property-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 35px rgba(17,24,39,.08);
    }

    .property-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .property-name {
        font-size: 1.1rem;
        font-weight: 900;
        color: var(--ink);
        margin-bottom: 0.25rem;
    }

    .property-address {
        font-size: 0.9rem;
        color: var(--muted);
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }

    .property-rent {
        background: linear-gradient(135deg, #70AE48 0%, #5d8f3a 100%);
        color: white;
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        font-weight: 950;
        font-size: 0.9rem;
    }

    .property-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(17,24,39,.08);
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .detail-label {
        font-size: 0.8rem;
        font-weight: 650;
        color: var(--muted);
    }

    .detail-value {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--ink);
    }

    .property-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(17,24,39,.08);
    }

    .d-inline {
        display: inline;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--muted);
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }

    .info-value {
        font-size: 1rem;
        font-weight: 700;
        color: var(--ink);
    }

    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--muted);
    }

    .empty-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        color: rgba(148,163,184,.35);
    }

    /* Mobile styles */
    @media (max-width: 768px) {
        .content-container {
            padding: 1rem;
        }

        .section-card {
            padding: 1.25rem;
        }

        .tenant-header {
            flex-direction: column;
            text-align: center;
        }

        .tenant-meta {
            justify-content: center;
        }

        .property-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .info-grid {
            grid-template-columns: 1fr;
        }

        .stats-grid {
            grid-template-columns: 1fr;
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
