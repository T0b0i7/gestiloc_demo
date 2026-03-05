@extends('layouts.co-owner')

@section('title', 'Nouvel état des lieux')

@section('content')
<style>
    /* Variables et reset */
    .create-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Header avec gradient */
    .create-header {
        background: #70AE48;
        border-radius: 24px;
        padding: 2rem 2.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .header-icon {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        padding: 1rem;
        border-radius: 18px;
    }

    .header-icon svg {
        width: 32px;
        height: 32px;
        color: white;
    }

    .header-title h1 {
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.01em;
    }

    .header-title p {
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: 0.95rem;
    }

    .btn-back {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        padding: 0.875rem 1.75rem;
        border-radius: 14px;
        color: white;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-back:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }

    .btn-back svg {
        width: 18px;
        height: 18px;
    }

    /* Formulaire */
    .form-card {
        background: white;
        border-radius: 24px;
        box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.05);
        border: 1px solid #e5e7eb;
        overflow: hidden;
    }

    .form-section {
        padding: 2rem 2.5rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .form-section:last-child {
        border-bottom: none;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .section-icon {
        background: #70AE48;
        padding: 0.75rem;
        border-radius: 12px;
        box-shadow: 0 8px 15px -3px rgba(37, 99, 235, 0.2);
    }

    .section-icon svg {
        width: 20px;
        height: 20px;
        color: white;
    }

    .section-header h2 {
        font-size: 1.35rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
    }

    .section-header p {
        margin: 0.25rem 0 0 0;
        color: #6b7280;
        font-size: 0.9rem;
    }

    /* Grid */
    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    .form-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-top: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-label svg {
        width: 16px;
        height: 16px;
        color: #2563eb;
    }

    .required-star {
        color: #ef4444;
        margin-left: 0.25rem;
    }

    .form-select, .form-input, .form-textarea {
        width: 100%;
        padding: 0.875rem 1rem;
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 14px;
        font-size: 0.95rem;
        color: #1f2937;
        transition: all 0.2s;
        font-family: inherit;
    }

    .form-select:hover, .form-input:hover, .form-textarea:hover {
        background: white;
        border-color: #d1d5db;
    }

    .form-select:focus, .form-input:focus, .form-textarea:focus {
        outline: none;
        background: white;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-select:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: #f3f4f6;
    }

    .form-textarea {
        resize: vertical;
        min-height: 80px;
    }

    /* Section photos */
    .photos-section {
        background: linear-gradient(to bottom right, #f9fafb, white);
    }

    .info-banner {
        background: #eff6ff;
        border-left: 4px solid #2563eb;
        border-radius: 14px;
        padding: 1rem 1.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }

    .info-banner svg {
        width: 20px;
        height: 20px;
        color: #2563eb;
        flex-shrink: 0;
        margin-top: 0.125rem;
    }

    .info-banner p {
        margin: 0;
        color: #1e40af;
        font-size: 0.95rem;
        line-height: 1.5;
    }

    .info-banner strong {
        display: block;
        margin-top: 0.5rem;
        color: #1e3a8a;
    }

    /* Photo card */
    .photo-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.2s;
    }

    .photo-card:hover {
        border-color: #2563eb;
        box-shadow: 0 8px 15px -3px rgba(37, 99, 235, 0.1);
    }

    .photo-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.25rem;
    }

    .photo-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .photo-icon {
        background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
        padding: 0.5rem;
        border-radius: 10px;
    }

    .photo-icon svg {
        width: 16px;
        height: 16px;
        color: white;
    }

    .photo-title h6 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
    }

    .btn-remove {
        background: none;
        border: none;
        color: #9ca3af;
        padding: 0.5rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-remove:hover {
        background: #fef2f2;
        color: #ef4444;
    }

    .btn-remove svg {
        width: 18px;
        height: 18px;
    }

    .photo-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }

    /* File input */
    .file-input-wrapper {
        position: relative;
    }

    .file-input {
        width: 100%;
        padding: 0.625rem;
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 0.9rem;
        color: #1f2937;
    }

    .file-input::file-selector-button {
        margin-right: 1rem;
        padding: 0.5rem 1rem;
        background: #eff6ff;
        border: none;
        border-radius: 8px;
        color: #2563eb;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s;
    }

    .file-input::file-selector-button:hover {
        background: #dbeafe;
    }

    /* Statut select */
    .status-select {
        width: 100%;
        padding: 0.625rem 1rem;
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 0.9rem;
        color: #1f2937;
    }

    /* Add photo button */
    .btn-add-photo {
        margin-top: 1.5rem;
        padding: 1rem 2rem;
        background: #70AE48;
        border: none;
        border-radius: 14px;
        color: white;
        font-size: 0.95rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 8px 15px -3px rgba(37, 99, 235, 0.3);
    }

    .btn-add-photo:hover {
        background: #70AE48;
        transform: translateY(-2px);
        box-shadow: 0 12px 20px -5px rgba(37, 99, 235, 0.4);
    }

    .btn-add-photo svg {
        width: 18px;
        height: 18px;
    }

    /* Footer */
    .form-footer {
        padding: 1.5rem 2.5rem;
        background: #f9fafb;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .btn-cancel {
        padding: 0.875rem 2rem;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 14px;
        color: #4b5563;
        font-size: 0.95rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
    }

    .btn-cancel:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
    }

    .btn-submit {
        padding: 0.875rem 2.5rem;
        background: #70AE48;
        border: none;
        border-radius: 14px;
        color: white;
        font-size: 0.95rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 8px 15px -3px rgba(16, 185, 129, 0.3);
    }

    .btn-submit:hover {
        background: #70AE48;
        transform: translateY(-2px);
        box-shadow: 0 12px 20px -5px rgba(16, 185, 129, 0.4);
    }

    .btn-submit svg {
        width: 18px;
        height: 18px;
    }

    /* Alert messages */
    .alert {
        padding: 1rem 1.5rem;
        border-radius: 14px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .alert-success {
        background: #d1fae5;
        border: 1px solid #10b981;
        color: #065f46;
    }

    .alert-error {
        background: #fee2e2;
        border: 1px solid #ef4444;
        color: #b91c1c;
    }

    .alert svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .create-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.5rem;
        }

        .form-grid, .form-grid-3, .photo-grid {
            grid-template-columns: 1fr;
        }

        .form-section {
            padding: 1.5rem;
        }

        .form-footer {
            flex-direction: column;
        }

        .btn-cancel, .btn-submit {
            width: 100%;
            justify-content: center;
        }
    }
</style>

<div class="create-container">
    <!-- Affichage des messages -->
    @if(session('success'))
        <div class="alert alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linecap="round" d="M5 13l4 4L19 7"/>
            </svg>
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            {{ session('error') }}
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            {{ $errors->first() }}
        </div>
    @endif



    <!-- Formulaire -->
    <div class="form-card">
        <form action="{{ route('co-owner.condition-reports.store') }}" method="POST" enctype="multipart/form-data" id="conditionReportForm">
            @csrf

            <!-- Section informations générales -->
            <div class="form-section">
                <div class="section-header">
                    <div class="section-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linecap="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h2>Informations générales</h2>
                        <p>Sélectionnez le bien et le bail associé</p>

                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linecap="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            Bien <span class="required-star">*</span>
                        </label>
                        <select name="property_id" id="property_id" class="form-select" required>
                            <option value="">Sélectionner un bien</option>
                            @foreach($properties as $property)
                                <option value="{{ $property->id }}"
                                        data-leases="{{ json_encode($property->leases) }}"
                                        {{ old('property_id') == $property->id ? 'selected' : '' }}>
                                    {{ $property->name }} - {{ $property->address }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Bail associé <span class="required-star">*</span>
                        </label>
                        <select name="lease_id" id="lease_id" class="form-select" required>
                            <option value="">Sélectionnez d'abord un bien</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid-3">
                    <div class="form-group">
                        <label class="form-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linecap="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                            </svg>
                            Type <span class="required-star">*</span>
                        </label>
                        <select name="type" class="form-select" required>
                            <option value="entry" {{ old('type') == 'entry' ? 'selected' : '' }}>🏠 État des lieux d'entrée</option>
                            <option value="exit" {{ old('type') == 'exit' ? 'selected' : '' }}>🚪 État des lieux de sortie</option>
                            <option value="intermediate" {{ old('type') == 'intermediate' ? 'selected' : '' }}>📋 État des lieux intermédiaire</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linecap="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Date <span class="required-star">*</span>
                        </label>
                        <input type="date" name="report_date" class="form-input" value="{{ old('report_date', date('Y-m-d')) }}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Notes générales
                        </label>
                        <textarea name="notes" class="form-textarea" rows="2" placeholder="Observations générales...">{{ old('notes') }}</textarea>
                    </div>
                </div>
            </div>

            <!-- Section photos -->
            <div class="form-section photos-section">
                <div class="section-header">
                    <div class="section-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linecap="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path stroke-linecap="round" stroke-linecap="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h2>Photos et constats</h2>
                        <p>Ajoutez au moins une photo pour documenter l'état</p>
                    </div>
                </div>

                <div class="info-banner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linecap="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p>
                        Pour chaque photo, indiquez son statut et des notes si nécessaire.
                        <strong>📸 Une première photo est déjà ajoutée</strong>
                    </p>
                </div>

                <div id="photos-container"></div>

                <button type="button" class="btn-add-photo" onclick="addPhotoField()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linecap="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    Ajouter une photo
                </button>
            </div>

            <!-- Footer -->
            <div class="form-footer">
                <a href="{{ route('co-owner.condition-reports.index') }}" class="btn-cancel">
                    Annuler
                </a>
                <button type="submit" class="btn-submit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linecap="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Enregistrer l'état des lieux
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation...');

    // Initialiser les gestionnaires
    initializePropertySelect();
    initializePhotoFields();
});

// Gestionnaire de sélection du bien
function initializePropertySelect() {
    const propertySelect = document.getElementById('property_id');
    const leaseSelect = document.getElementById('lease_id');

    if (!propertySelect || !leaseSelect) {
        console.error('Éléments non trouvés');
        return;
    }

    propertySelect.addEventListener('change', function() {
        updateLeaseOptions();
    });

    // Charger les baux si une propriété est déjà sélectionnée
    if (propertySelect.value) {
        updateLeaseOptions();
    }
}

function updateLeaseOptions() {
    const propertySelect = document.getElementById('property_id');
    const leaseSelect = document.getElementById('lease_id');

    const selectedOption = propertySelect.selectedOptions[0];

    if (!selectedOption || !selectedOption.dataset.leases) {
        leaseSelect.innerHTML = '<option value="">Sélectionnez d\'abord un bien</option>';
        leaseSelect.disabled = true;
        return;
    }

    try {
        const leases = JSON.parse(selectedOption.dataset.leases || '[]');
        leaseSelect.innerHTML = '<option value="">Sélectionnez un bail</option>';

        if (leases.length > 0) {
            leases.forEach(lease => {
                const option = document.createElement('option');
                option.value = lease.id;
                const tenantName = lease.tenant?.full_name || 'Locataire inconnu';
                option.textContent = `📄 Bail #${lease.id} - ${tenantName}`;
                leaseSelect.appendChild(option);
            });
            leaseSelect.disabled = false;
        } else {
            leaseSelect.innerHTML = '<option value="">❌ Aucun bail actif pour ce bien</option>';
            leaseSelect.disabled = true;
        }
    } catch (e) {
        console.error('Erreur parsing des baux:', e);
        leaseSelect.innerHTML = '<option value="">Erreur de chargement des baux</option>';
        leaseSelect.disabled = true;
    }
}

// Gestion des photos
let photoCount = 0;

function initializePhotoFields() {
    if (!document.querySelector('#photos-container .photo-card')) {
        addPhotoField();
    }
}

function addPhotoField() {
    const container = document.getElementById('photos-container');
    if (!container) return;

    const photoDiv = document.createElement('div');
    photoDiv.className = 'photo-card';
    photoDiv.innerHTML = `
        <div class="photo-header">
            <div class="photo-title">
                <div class="photo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linecap="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <h6>Photo ${photoCount + 1}</h6>
            </div>
            <button type="button" class="btn-remove" onclick="removePhotoField(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <div class="photo-grid">
            <div class="file-input-wrapper">
                <input type="file" name="photos[]" class="file-input" accept="image/*" required>
            </div>
            <div>
                <select name="condition_statuses[]" class="status-select">
                    <option value="good">✅ Bon</option>
                    <option value="satisfactory">📊 Correct</option>
                    <option value="poor">⚠️ Mauvais</option>
                    <option value="damaged">❌ Abîmé</option>
                </select>
            </div>
            <div>
                <input type="text" name="condition_notes[]" class="form-input" placeholder="ex: fissure mur salon">
            </div>
        </div>
    `;

    container.appendChild(photoDiv);
    photoCount++;
}

window.removePhotoField = function(button) {
    const photoFields = document.querySelectorAll('#photos-container .photo-card');
    if (photoFields.length > 1) {
        button.closest('.photo-card').remove();
    } else {
        alert('📸 Au moins une photo est requise pour l\'état des lieux');
    }
}
</script>
@endpush
@endsection
