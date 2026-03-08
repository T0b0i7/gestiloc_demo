
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

    .content-container::before {
        content: "";
        position: fixed;
        inset: 0;
        background:
            radial-gradient(900px 520px at 12% -8%, rgba(102,126,234,.16) 0%, rgba(102,126,234,0) 62%),
            radial-gradient(900px 520px at 92% 8%, rgba(118,75,162,.14) 0%, rgba(118,75,162,0) 64%),
            radial-gradient(700px 420px at 40% 110%, rgba(16,185,129,.10) 0%, rgba(16,185,129,0) 60%);
        pointer-events: none;
        z-index: -2;
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

    .alert-error {
        background: rgba(254,242,242,.92);
        border-color: rgba(248,113,113,.30);
        color: #991b1b;
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

    .form-card {
        background: white;
        border-radius: 18px;
        padding: 2rem;
        border: 2px solid rgba(102,126,234,.15);
        box-shadow: 0 12px 40px rgba(0,0,0,.08);
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: block;
        font-size: 0.9rem;
        font-weight: 950;
        color: var(--ink);
        margin-bottom: 0.5rem;
    }

    .form-control {
        width: 100%;
        padding: 0.9rem 1rem;
        border-radius: 12px;
        border: 2px solid rgba(148,163,184,.25);
        font-size: 0.95rem;
        transition: all 0.2s ease;
        background: rgba(255,255,255,.92);
    }

    .form-control:focus {
        outline: none;
        border-color: #70AE48;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.15);
    }

    .form-select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
        background-size: 16px;
        padding-right: 2.5rem;
    }

    .form-textarea {
        min-height: 120px;
        resize: vertical;
    }

    .lease-info {
        background: rgba(112, 174, 72, 0.08);
        border-radius: 14px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        border: 2px solid rgba(112, 174, 72, 0.20);
    }

    .lease-info h3 {
        font-size: 1rem;
        font-weight: 950;
        color: #70AE48;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .lease-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 0.75rem;
    }

    .detail-item {
        font-size: 0.9rem;
    }

    .detail-label {
        font-weight: 850;
        color: var(--muted);
    }

    .detail-value {
        color: var(--ink);
        font-weight: 700;
    }

    .input-error {
        border-color: rgba(239,68,68,.72) !important;
        box-shadow: 0 0 0 3px rgba(239,68,68,.15) !important;
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
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

            // Formater le loyer
            const monthlyRent = !isNaN(lease?.rent_amount)
                ? new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0
                  }).format(Number(lease.rent_amount))
                : 'Non spécifié';

            // Construire le nom du locataire
            const tenantName = lease.tenant
                ? `${lease.tenant.first_name ?? ''} ${lease.tenant.last_name ?? ''}`.trim()
                : 'Non spécifié';

            detailsDiv.innerHTML = `
                <div class="detail-item">
                    <div class="detail-label">Bien</div>
                    <div class="detail-value">${lease.property?.address || 'Non spécifié'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Locataire</div>
                    <div class="detail-value">${tenantName}</div>
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
    });
</script>
@endsection
