@extends('layouts.co-owner')

@section('title', 'Demande de maintenance - Détails')

@section('content')
<div class="content-container">
    <div class="content-card">
        <div class="content-body">
            <a href="{{ route('co-owner.maintenance.index') }}" class="back-button">
                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                Retour à la liste
            </a>

            @if(session('success'))
                <div class="alert-box alert-success">
                    <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                    <div>
                        <strong>Succès</strong>
                        <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('success') }}</p>
                    </div>
                </div>
            @endif

            @if(session('error'))
                <div class="alert-box alert-error">
                    <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                    <div>
                        <strong>Erreur</strong>
                        <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('error') }}</p>
                    </div>
                </div>
            @endif

            <div class="details-grid">
                <!-- Informations principales -->
                <div class="detail-section">
                    <h3 class="detail-section-title">
                        <i data-lucide="info"></i>
                        Informations de la demande
                    </h3>

                    <div class="detail-row">
                        <span class="detail-label">Titre</span>
                        <span class="detail-value">{{ $maintenance->title }}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Statut</span>
                        <span class="detail-value">
                            <span class="badge badge-{{ $maintenance->status }}">
                                @if($maintenance->status == 'open')
                                    <i data-lucide="clock" style="width: 12px; height: 12px;"></i> En attente
                                @elseif($maintenance->status == 'in_progress')
                                    <i data-lucide="loader" style="width: 12px; height: 12px;"></i> En cours
                                @elseif($maintenance->status == 'resolved')
                                    <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Résolu
                                @else
                                    <i data-lucide="x-circle" style="width: 12px; height: 12px;"></i> Annulé
                                @endif
                            </span>
                        </span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Priorité</span>
                        <span class="detail-value">
                            <span class="badge badge-{{ $maintenance->priority }}">
                                @if($maintenance->priority == 'emergency')
                                    <i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i> Urgence
                                @elseif($maintenance->priority == 'high')
                                    <i data-lucide="alert-circle" style="width: 12px; height: 12px;"></i> Élevée
                                @elseif($maintenance->priority == 'medium')
                                    <i data-lucide="info" style="width: 12px; height: 12px;"></i> Moyenne
                                @else
                                    <i data-lucide="check" style="width: 12px; height: 12px;"></i> Faible
                                @endif
                            </span>
                        </span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Catégorie</span>
                        <span class="detail-value">
                            @php
                                $categories = [
                                    'plumbing' => 'Plomberie',
                                    'electricity' => 'Électricité',
                                    'heating' => 'Chauffage',
                                    'other' => 'Autre',
                                ];
                                echo $categories[$maintenance->category] ?? $maintenance->category;
                            @endphp
                        </span>
                    </div>

                    @if($maintenance->assigned_provider)
                        <div class="detail-row">
                            <span class="detail-label">Prestataire assigné</span>
                            <span class="detail-value">{{ $maintenance->assigned_provider }}</span>
                        </div>
                    @endif

                    @if($maintenance->resolved_at)
                        <div class="detail-row">
                            <span class="detail-label">Résolue le</span>
                            <span class="detail-value">{{ $maintenance->resolved_at->format('d/m/Y H:i') }}</span>
                        </div>
                    @endif

                    <div class="detail-row">
                        <span class="detail-label">Créée le</span>
                        <span class="detail-value">{{ $maintenance->created_at->format('d/m/Y H:i') }}</span>
                    </div>
                </div>

                <!-- Informations du bien et du locataire -->
                <div class="detail-section">
                    <h3 class="detail-section-title">
                        <i data-lucide="home"></i>
                        Contexte
                    </h3>

                    <div class="detail-row">
                        <span class="detail-label">Bien concerné</span>
                        <span class="detail-value">{{ $maintenance->property->address ?? 'Bien inconnu' }}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Locataire</span>
                        <span class="detail-value">{{ $maintenance->tenant->user->name ?? 'Locataire inconnu' }}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Email locataire</span>
                        <span class="detail-value">{{ $maintenance->tenant->user->email ?? 'Email inconnu' }}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Propriétaire principal</span>
                        <span class="detail-value">{{ $maintenance->landlord->user->name ?? 'Propriétaire inconnu' }}</span>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div class="detail-section">
                <h3 class="detail-section-title">
                    <i data-lucide="file-text"></i>
                    Description du problème
                </h3>
                <div style="white-space: pre-line; color: var(--ink); line-height: 1.6; padding: 1rem; background: rgba(249,250,251,0.8); border-radius: 12px;">
                    {{ $maintenance->description ?? 'Aucune description fournie.' }}
                </div>
            </div>

            <!-- Créneaux préférés -->
            @if(!empty($maintenance->preferred_slots))
                <div class="detail-section">
                    <h3 class="detail-section-title">
                        <i data-lucide="calendar"></i>
                        Créneaux de disponibilité du locataire
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                        @foreach($maintenance->preferred_slots as $slot)
                            @if(is_array($slot))
                                <div style="padding: 1rem; background: rgba(249,250,251,0.8); border-radius: 12px; border: 1px solid rgba(102,126,234,.15);">
                                    <div style="font-weight: 700; color: var(--ink); margin-bottom: 0.5rem;">
                                        <i data-lucide="calendar" style="width: 14px; height: 14px; margin-right: 0.5rem;"></i>
                                        {{ $slot['date'] ?? 'Date non spécifiée' }}
                                    </div>
                                    <div style="color: #64748b; font-size: 0.9rem;">
                                        {{ $slot['from'] ?? '' }} → {{ $slot['to'] ?? '' }}
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Photos -->
            @if(!empty($maintenance->photos))
                <div class="detail-section">
                    <h3 class="detail-section-title">
                        <i data-lucide="image"></i>
                        Photos jointes
                    </h3>
                    <div class="photos-grid">
                        @foreach($maintenance->photos as $photo)
                            @if(is_string($photo))
                                @php
                                    $photoUrl = asset('storage/' . ltrim($photo, '/'));
                                @endphp
                                <div class="photo-item">
                                    <img src="{{ $photoUrl }}" alt="Photo du problème"
                                         onclick="openModal('{{ $photoUrl }}')"
                                         style="cursor: pointer;">
                                </div>
                            @endif
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Actions -->
            <div class="action-section">
                <h3 class="detail-section-title">
                    <i data-lucide="settings"></i>
                    Actions
                </h3>

                <div class="action-buttons">
                    @if($maintenance->status == 'open')
                        <form action="{{ route('co-owner.maintenance.start', $maintenance) }}" method="POST" style="display: inline;">
                            @csrf
                            <button type="submit" class="button button-primary">
                                <i data-lucide="play" style="width: 16px; height: 16px;"></i>
                                Prendre en charge
                            </button>
                        </form>

                        <form action="{{ route('co-owner.maintenance.assign', $maintenance) }}" method="POST" style="display: none;" id="assign-form">
                            @csrf
                            <div class="form-group">
                                <label class="form-label">Nom du prestataire</label>
                                <input type="text" name="provider" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Contact</label>
                                <input type="text" name="contact_info" class="form-input">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Coût estimé (€)</label>
                                <input type="number" step="0.01" name="estimated_cost" class="form-input">
                            </div>
                            <button type="submit" class="button button-primary">
                                <i data-lucide="user-check" style="width: 16px; height: 16px;"></i>
                                Assigner prestataire
                            </button>
                        </form>

                        <button onclick="toggleAssignForm()" class="button button-secondary">
                            <i data-lucide="user-check" style="width: 16px; height: 16px;"></i>
                            Assigner un prestataire
                        </button>

                        <form action="{{ route('co-owner.maintenance.cancel', $maintenance) }}" method="POST" style="display: none;" id="cancel-form">
                            @csrf
                            <div class="form-group">
                                <label class="form-label">Raison de l'annulation</label>
                                <textarea name="reason" class="form-textarea" required></textarea>
                            </div>
                            <button type="submit" class="button button-danger">
                                <i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>
                                Confirmer l'annulation
                            </button>
                        </form>

                        <button onclick="toggleCancelForm()" class="button button-danger">
                            <i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>
                            Annuler la demande
                        </button>

                    @elseif($maintenance->status == 'in_progress')
                        <form action="{{ route('co-owner.maintenance.resolve', $maintenance) }}" method="POST" style="display: none;" id="resolve-form">
                            @csrf
                            <div class="form-group">
                                <label class="form-label">Détails de la résolution</label>
                                <textarea name="resolution_details" class="form-textarea"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Coût final (€)</label>
                                <input type="number" step="0.01" name="actual_cost" class="form-input">
                            </div>
                            <button type="submit" class="button button-success">
                                <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
                                Marquer comme résolu
                            </button>
                        </form>

                        <button onclick="toggleResolveForm()" class="button button-success">
                            <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
                            Marquer comme résolu
                        </button>
                    @endif
                </div>

                <!-- Répondre au locataire -->
                <div class="reply-section">
                    <h3 class="detail-section-title">
                        <i data-lucide="message-square"></i>
                        Répondre au locataire
                    </h3>
                   <form action="{{ route('co-owner.maintenance.reply', $maintenance) }}" method="POST" class="reply-form">
                        @csrf
                        <div class="form-group">
                            <label class="form-label">Votre message</label>
                            <textarea name="reply_message" class="form-textarea"  placeholder="Envoyez un message au locataire pour l'informer de l'avancement..." required></textarea>
                        </div>

                        <!-- Conteneur pour bouton aligné à droite -->
                        <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                            <button type="submit" class="button button-primary" style="display: inline-flex; align-items: center; gap: 6px;">
                                <i data-lucide="send" style="width: 16px; height: 16px;"></i>
                                Envoyer au locataire
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal pour les photos -->
<div id="photoModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; align-items: center; justify-content: center;">
    <img id="modalImage" src="" alt="" style="max-width: 90%; max-height: 90%; border-radius: 12px;">
    <button onclick="closeModal()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; color: white; font-size: 24px; cursor: pointer; padding: 10px 15px; border-radius: 50%;">
        <i data-lucide="x"></i>
    </button>
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
        width: 70%;
        margin: 0 auto;
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

    .alert-success {
        background: rgba(240,253,244,.92);
        border-color: rgba(74,222,128,.30);
        color: #166534;
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
        background: rgba(239,68,68,.10);
        color: var(--red);
        border: 2px solid rgba(239,68,68,.20);
    }

    .button-danger:hover {
        background: rgba(239,68,68,.15);
    }

    .button-success {
        background: rgba(34,197,94,.10);
        color: #166534;
        border: 2px solid rgba(34,197,94,.20);
    }

    .button-success:hover {
        background: rgba(34,197,94,.15);
    }

    .back-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #64748b;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
    }

    .back-button:hover {
        color: #70AE48;
    }

    .details-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    @media (max-width: 1024px) {
        .details-grid {
            grid-template-columns: 1fr;
        }
    }

    .detail-section {
        background: rgba(255,255,255,.95);
        border: 2px solid rgba(102,126,234,.10);
        border-radius: 16px;
        padding: 1.5rem;
    }

    .detail-section-title {
        font-size: 1.1rem;
        font-weight: 950;
        color: var(--ink);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(102,126,234,.08);
    }

    .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .detail-label {
        font-weight: 700;
        color: #64748b;
        font-size: 0.9rem;
    }

    .detail-value {
        font-weight: 600;
        color: var(--ink);
        text-align: right;
        max-width: 70%;
    }

    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 850;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }

    .badge-open {
        background: rgba(245,158,11,.15);
        color: #92400e;
        border: 1px solid rgba(245,158,11,.25);
    }

    .badge-in_progress {
        background: rgba(59,130,246,.15);
        color: #1d4ed8;
        border: 1px solid rgba(59,130,246,.25);
    }

    .badge-resolved {
        background: rgba(34,197,94,.15);
        color: #166534;
        border: 1px solid rgba(34,197,94,.25);
    }

    .badge-cancelled {
        background: rgba(148,163,184,.15);
        color: #475569;
        border: 1px solid rgba(148,163,184,.25);
    }

    .badge-emergency {
        background: rgba(239,68,68,.15);
        color: #991b1b;
        border: 1px solid rgba(239,68,68,.25);
    }

    .badge-high {
        background: rgba(245,158,11,.15);
        color: #92400e;
        border: 1px solid rgba(245,158,11,.25);
    }

    .badge-medium {
        background: rgba(59,130,246,.15);
        color: #1d4ed8;
        border: 1px solid rgba(59,130,246,.25);
    }

    .badge-low {
        background: rgba(34,197,94,.15);
        color: #166534;
        border: 1px solid rgba(34,197,94,.25);
    }

    .photos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .photo-item {
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(102,126,234,.15);
        transition: all 0.3s ease;
    }

    .photo-item:hover {
        transform: translateY(-2px);
        border-color: #70AE48;
        box-shadow: 0 10px 25px rgba(112, 174, 72, 0.15);
    }

    .photo-item img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        display: block;
    }

    .action-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: rgba(255,255,255,.95);
        border: 2px solid rgba(102,126,234,.10);
        border-radius: 16px;
    }

    .action-buttons {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
    }

    .reply-section {
        margin-top: 2rem;
    }

    .reply-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        font-weight: 700;
        color: var(--ink);
        font-size: 0.9rem;
    }

    .form-input,
    .form-textarea {
        padding: 0.75rem 1rem;
        border-radius: 10px;
        border: 1px solid rgba(102,126,234,.25);
        background: white;
        color: var(--ink);
        font-size: 0.875rem;
        font-family: inherit;
    }

    .form-textarea {
        min-height: 120px;
        resize: vertical;
    }

    .form-input:focus,
    .form-textarea:focus {
        outline: none;
        border-color: #70AE48;
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.15);
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // Gestion des formulaires d'action
    function toggleAssignForm() {
        const form = document.getElementById('assign-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }

    function toggleCancelForm() {
        const form = document.getElementById('cancel-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }

    function toggleResolveForm() {
        const form = document.getElementById('resolve-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }

    // Modal pour les photos
    function openModal(imageSrc) {
        document.getElementById('modalImage').src = imageSrc;
        document.getElementById('photoModal').style.display = 'flex';

        // Réinitialiser les icônes pour le modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function closeModal() {
        document.getElementById('photoModal').style.display = 'none';
    }

    // Fermer modal avec ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Fermer modal en cliquant à côté
    document.getElementById('photoModal').addEventListener('click', function(e) {
        if (e.target.id === 'photoModal') {
            closeModal();
        }
    });
</script>
@endsection
