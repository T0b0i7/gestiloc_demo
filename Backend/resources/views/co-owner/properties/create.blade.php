@extends('layouts.co-owner')

@section('title', 'Ajouter un bien')

@section('content')
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .create-container {
        max-width: 1300px;
        margin: 0 auto;
        padding: 1.5rem;
        background: #f8f9fa;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    /* ===== HEADER ===== */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .header-left {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 0.75rem;
        color: #424242;
        font-weight: 500;
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.2s;
        margin-bottom: 1rem;
        width: fit-content;
    }

    .btn-back:hover {
        background: #f5f5f5;
        border-color: #d0d0d0;
    }

    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 0.25rem;
        letter-spacing: -0.02em;
    }

    .page-subtitle {
        color: #64748b;
        font-size: 0.95rem;
        font-weight: 500;
    }

    .header-actions {
        display: flex;
        gap: 1rem;
    }

    .btn-cancel {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        border: 1px solid #e0e0e0;
        background: white;
        color: #e11d48;
        border-radius: 0.75rem;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
    }

    .btn-cancel:hover {
        background: #fef2f2;
        border-color: #e11d48;
    }

    .btn-submit {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        border: none;
        background: #70AE48;
        color: white;
        border-radius: 0.75rem;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-submit:hover {
        background: #56b616;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
    }

    /* ===== LAYOUT 2 COLONNES ===== */
    .form-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }

    /* ===== SECTIONS ===== */
    .form-section {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 1.75rem;
        border-radius: 1rem;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        position: relative;
        overflow: hidden;
    }

    .form-section::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
            radial-gradient(900px 260px at 90% 0%, rgba(124, 58, 237, 0.06), transparent 62%),
            radial-gradient(900px 260px at 10% 0%, rgba(79, 70, 229, 0.07), transparent 62%);
        pointer-events: none;
    }

    .form-section > * {
        position: relative;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(102, 126, 234, 0.28);
    }

    .section-icon {
        font-size: 1.5rem;
    }

    .section-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.01em;
    }

    /* ===== CHAMPS ===== */
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .form-row.full {
        grid-template-columns: 1fr;
    }

    .form-row-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .form-row-4 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .required-star {
        color: #e11d48;
        margin-left: 0.25rem;
    }

    .form-control {
        width: 100%;
        padding: 0.85rem 1rem;
        border: 2px solid rgba(148, 163, 184, 0.35);
        border-radius: 0.75rem;
        font-size: 0.95rem;
        color: #0f172a;
        background: rgba(255, 255, 255, 0.92);
        transition: all 0.2s;
        font-family: inherit;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }

    .form-control:hover {
        border-color: rgba(79, 70, 229, 0.3);
        background: rgba(255, 255, 255, 0.96);
    }

    .form-control:focus {
        outline: none;
        border-color: rgba(79, 70, 229, 0.75);
        background: white;
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.14);
    }

    select.form-control {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
        padding-right: 2.5rem;
    }

    textarea.form-control {
        resize: vertical;
        min-height: 110px;
    }

    .form-help {
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 0.25rem;
        font-weight: 500;
    }

    .form-error {
        font-size: 0.85rem;
        color: #e11d48;
        margin-top: 0.25rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
        font-weight: 600;
    }

    /* ===== SECTION ÉQUIPEMENTS ===== */
    .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: rgba(249, 250, 251, 0.8);
        border-radius: 0.75rem;
        border: 1px solid rgba(15, 23, 42, 0.08);
        transition: all 0.2s;
    }

    .checkbox-item:hover {
        background: white;
        border-color: rgba(79, 70, 229, 0.3);
        box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
    }

    .checkbox-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #4f46e5;
        cursor: pointer;
    }

    .checkbox-item label {
        font-size: 0.9rem;
        font-weight: 600;
        color: #334155;
        cursor: pointer;
    }

    /* ===== AMENITIES ===== */
    .amenities-container {
        margin-top: 1.5rem;
    }

    .amenities-input-group {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .btn-add-amenity {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: #70AE48;
        border: none;
        border-radius: 0.75rem;
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    }

    .btn-add-amenity:hover {
        background: #55a520;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
    }

    .amenities-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .amenity-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(79, 70, 229, 0.1);
        border: 1px solid rgba(79, 70, 229, 0.2);
        border-radius: 2rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #4338ca;
    }

    .amenity-remove {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        transition: all 0.2s;
        border-radius: 50%;
    }

    .amenity-remove:hover {
        color: #e11d48;
        background: rgba(225, 29, 72, 0.1);
    }

    /* ===== SECTION FINANCES ===== */
    .finances-section {
        background: rgba(255, 247, 237, 0.9);
        border: 1px solid rgba(251, 146, 60, 0.3);
        backdrop-filter: blur(10px);
    }

    .finances-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
    }

    .finances-icon {
        font-size: 1.5rem;
    }

    .finances-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #9a3412;
        margin: 0;
    }

    /* ===== PHOTOS SECTION ===== */
    .photos-section {
        grid-column: 1 / -1;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 1.75rem;
        border-radius: 1rem;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        position: relative;
        overflow: hidden;
    }

    .photos-section::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
            radial-gradient(900px 220px at 12% 0%, rgba(102, 126, 234, 0.1), transparent 58%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.54));
        pointer-events: none;
    }

    .photos-section > * {
        position: relative;
    }

    .photos-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
    }

    .photos-title-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .photos-icon {
        font-size: 1.5rem;
    }

    .photos-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
    }

    .btn-upload {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: rgb(215, 214, 255);
        border: 2px dashed #66e546;
        border-radius: 0.75rem;
        color: #000000;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-upload:hover {
        background: rgba(79, 70, 229, 0.06);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    }

    .photos-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .photos-meta {
        font-size: 0.9rem;
        color: #334155;
        font-weight: 600;
    }

    .photos-empty {
        font-size: 0.95rem;
        color: #64748b;
        font-weight: 500;
    }

    .photos-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1.25rem;
    }

    .photo-thumb {
        width: 120px;
        height: 100px;
        border-radius: 0.75rem;
        overflow: hidden;
        border: 1px solid rgba(15, 23, 42, 0.12);
        background: rgba(255, 255, 255, 0.9);
        position: relative;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        transition: all 0.2s;
    }

    .photo-thumb:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
    }

    .photo-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .btn-remove-photo {
        position: absolute;
        right: 0.5rem;
        top: 0.5rem;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(15, 23, 42, 0.12);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: #64748b;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
    }

    .btn-remove-photo:hover {
        background: #fee;
        border-color: #e11d48;
        color: #e11d48;
        transform: scale(1.05);
    }

    /* ===== ALERT ===== */
    .alert {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1rem 1.25rem;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
        backdrop-filter: blur(10px);
    }

    .alert-success {
        background: rgba(240, 253, 244, 0.95);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #166534;
    }

    .alert-error {
        background: rgba(255, 241, 242, 0.95);
        border: 1px solid rgba(244, 63, 94, 0.3);
        color: #be123c;
    }

    /* ===== POSITION ICON ===== */
    .icon-input {
        position: relative;
    }

    .icon-input .form-control {
        padding-left: 2.75rem;
    }

    .icon-left {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
        pointer-events: none;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1200px) {
        .form-layout {
            grid-template-columns: 1fr;
        }

        .photos-section {
            grid-column: 1;
        }
    }

    @media (max-width: 768px) {
        .create-container {
            padding: 1rem;
        }

        .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .header-actions {
            width: 100%;
        }

        .btn-cancel,
        .btn-submit {
            flex: 1;
            justify-content: center;
        }

        .form-row,
        .form-row-3,
        .form-row-4 {
            grid-template-columns: 1fr;
        }

        .checkbox-grid {
            grid-template-columns: 1fr;
        }

        .photos-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .btn-upload {
            width: 100%;
            justify-content: center;
        }
    }
</style>

<div class="create-container">
    <!-- Header -->
    <div class="page-header">
        <div class="header-left">
            <h1 class="text-dark">Ajouter un bien</h1>
            <p class="page-subtitle">Ajoutez un nouveau bien immobilier à votre portefeuille</p>
        </div>
        <div class="header-actions">
            <a href="javascript:history.back()" class="btn-cancel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Annuler
            </a>
            <button type="submit" form="property-form" class="btn-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <path d="M17 21v-4H7v4"/>
                    <path d="M12 7v6"/>
                    <path d="M9 10h6"/>
                </svg>
                Enregistrer
            </button>
        </div>
    </div>

    <!-- Messages d'alerte -->
    @if(session('success'))
        <div class="alert alert-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
            </svg>
            <span>{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>{{ session('error') }}</span>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>{{ $errors->first() }}</span>
        </div>
    @endif

    <!-- Formulaire -->
    <form id="property-form"
          action="{{ route('co-owner.properties.store', ['api_token' => request()->get('api_token')]) }}"
          method="POST"
          enctype="multipart/form-data">
        @csrf

        <div class="form-layout">
            <!-- COLONNE GAUCHE -->
            <div>
                <!-- Informations générales -->
                <div class="form-section">
                    <div class="section-header">
                        <span class="section-icon">🏠</span>
                        <h2 class="section-title">Informations générales</h2>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Type de bien <span class="required-star">*</span></label>
                            <select name="property_type" class="form-control" required>
                                <option value="">Sélectionnez un type</option>
                                <option value="apartment" {{ old('property_type') == 'apartment' ? 'selected' : '' }}>Appartement</option>
                                <option value="house" {{ old('property_type') == 'house' ? 'selected' : '' }}>Maison</option>
                                <option value="office" {{ old('property_type') == 'office' ? 'selected' : '' }}>Bureau</option>
                                <option value="commercial" {{ old('property_type') == 'commercial' ? 'selected' : '' }}>Local commercial</option>
                                <option value="warehouse" {{ old('property_type') == 'warehouse' ? 'selected' : '' }}>Entrepôt</option>
                                <option value="parking" {{ old('property_type') == 'parking' ? 'selected' : '' }}>Parking</option>
                                <option value="land" {{ old('property_type') == 'land' ? 'selected' : '' }}>Terrain</option>
                                <option value="other" {{ old('property_type') == 'other' ? 'selected' : '' }}>Autre</option>
                            </select>
                            @error('property_type')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Statut <span class="required-star">*</span></label>
                            <select name="status" class="form-control" required>
                                <option value="available" {{ old('status') == 'available' ? 'selected' : '' }}>Disponible</option>
                                <option value="rented" {{ old('status') == 'rented' ? 'selected' : '' }}>Loué</option>
                                <option value="maintenance" {{ old('status') == 'maintenance' ? 'selected' : '' }}>En maintenance</option>
                                <option value="off_market" {{ old('status') == 'off_market' ? 'selected' : '' }}>Hors marché</option>
                            </select>
                            @error('status')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row full">
                        <div class="form-group">
                            <label class="form-label">Nom du bien <span class="required-star">*</span></label>
                            <input type="text" name="name" value="{{ old('name') }}" class="form-control"
                                   placeholder="Ex: Appartement T3 centre-ville" required>
                            @error('name')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row full">
                        <div class="form-group">
                            <label class="form-label">Référence</label>
                            <input type="text" name="reference_code" value="{{ old('reference_code') }}" class="form-control"
                                   placeholder="Ex: APP-123 (généré automatiquement si vide)">
                            @error('reference_code')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                            <div class="form-help">Optionnel • Lettres MAJ, chiffres et tirets</div>
                        </div>
                    </div>

                    <div class="form-row full">
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-control" rows="4"
                                      placeholder="Décrivez le bien (optionnel)…">{{ old('description') }}</textarea>
                            @error('description')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                            <div class="form-help">Points forts, emplacement, spécificités…</div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group icon-input">
                            <label class="form-label">Surface (m²) <span class="required-star">*</span></label>
                            <span class="icon-left">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3h18v18H3z"/>
                                    <path d="M9 3v18"/>
                                    <path d="M15 3v18"/>
                                    <path d="M3 9h18"/>
                                    <path d="M3 15h18"/>
                                </svg>
                            </span>
                            <input type="number" name="surface" value="{{ old('surface') }}" class="form-control"
                                   placeholder="Ex: 65" step="0.01" min="0" required>
                            @error('surface')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Année construction</label>
                            <input type="number" name="construction_year" value="{{ old('construction_year') }}" class="form-control"
                                   placeholder="Ex: 2015" min="1800" max="{{ date('Y') }}">
                            @error('construction_year')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Caractéristiques -->
                <div class="form-section" style="margin-top: 1.5rem;">
                    <div class="section-header">
                        <span class="section-icon">📐</span>
                        <h2 class="section-title">Caractéristiques</h2>
                    </div>

                    <div class="form-row-3">
                        <div class="form-group">
                            <label class="form-label">Étage</label>
                            <input type="number" name="floor" value="{{ old('floor') }}" class="form-control"
                                   placeholder="Ex: 3" min="0">
                            @error('floor')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Total étages</label>
                            <input type="number" name="total_floors" value="{{ old('total_floors') }}" class="form-control"
                                   placeholder="Ex: 8" min="0">
                            @error('total_floors')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Pièces totales</label>
                            <input type="number" name="room_count" value="{{ old('room_count') }}" class="form-control"
                                   placeholder="Ex: 4" min="0">
                            @error('room_count')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row-4">
                        <div class="form-group">
                            <label class="form-label">Chambres</label>
                            <input type="number" name="bedroom_count" value="{{ old('bedroom_count') }}" class="form-control"
                                   placeholder="Ex: 3" min="0">
                            @error('bedroom_count')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Salles de bain</label>
                            <input type="number" name="bathroom_count" value="{{ old('bathroom_count') }}" class="form-control"
                                   placeholder="Ex: 2" min="0">
                            @error('bathroom_count')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">WC</label>
                            <input type="number" name="wc_count" value="{{ old('wc_count') }}" class="form-control"
                                   placeholder="Ex: 1" min="0">
                            @error('wc_count')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Équipements -->
                <div class="form-section" style="margin-top: 1.5rem;">
                    <div class="section-header">
                        <span class="section-icon">🛋️</span>
                        <h2 class="section-title">Équipements</h2>
                    </div>

                    <div class="checkbox-grid">
                        <div class="checkbox-item">
                            <input type="checkbox" name="has_garage" id="has_garage" value="1" {{ old('has_garage') ? 'checked' : '' }}>
                            <label for="has_garage">🚗 Garage</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="has_parking" id="has_parking" value="1" {{ old('has_parking') ? 'checked' : '' }}>
                            <label for="has_parking">🅿️ Parking</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="is_furnished" id="is_furnished" value="1" {{ old('is_furnished') ? 'checked' : '' }}>
                            <label for="is_furnished">🛋️ Meublé</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="has_elevator" id="has_elevator" value="1" {{ old('has_elevator') ? 'checked' : '' }}>
                            <label for="has_elevator">⬆️ Ascenseur</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="has_balcony" id="has_balcony" value="1" {{ old('has_balcony') ? 'checked' : '' }}>
                            <label for="has_balcony">🏞️ Balcon</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="has_terrace" id="has_terrace" value="1" {{ old('has_terrace') ? 'checked' : '' }}>
                            <label for="has_terrace">🌿 Terrasse</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="has_cellar" id="has_cellar" value="1" {{ old('has_cellar') ? 'checked' : '' }}>
                            <label for="has_cellar">🏚️ Cave</label>
                        </div>
                    </div>

                    <!-- Équipements supplémentaires -->
                    <div class="amenities-container">
                        <label class="form-label">Équipements supplémentaires</label>
                        <div class="amenities-input-group">
                            <input type="text" id="amenity-input" class="form-control"
                                   placeholder="Ex: Climatisation, Interphone, Concierge...">
                            <button type="button" class="btn-add-amenity" onclick="addAmenity()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Ajouter
                            </button>
                        </div>
                        <div id="amenities-list" class="amenities-list">
                            @if(old('amenities'))
                                @foreach(old('amenities') as $amenity)
                                    <span class="amenity-tag">
                                        {{ $amenity }}
                                        <button type="button" class="amenity-remove" onclick="removeAmenity(this)">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M18 6L6 18M6 6l12 12"/>
                                            </svg>
                                        </button>
                                        <input type="hidden" name="amenities[]" value="{{ $amenity }}">
                                    </span>
                                @endforeach
                            @endif
                        </div>
                        <div class="form-help">Ajoutez des équipements spécifiques (climatisation, interphone, etc.)</div>
                    </div>
                </div>
            </div>

            <!-- COLONNE DROITE -->
            <div>
                <!-- Adresse -->
                <div class="form-section">
                    <div class="section-header">
                        <span class="section-icon">📍</span>
                        <h2 class="section-title">Adresse</h2>
                    </div>

                    <div class="form-row full">
                        <div class="form-group icon-input">
                            <label class="form-label">Adresse <span class="required-star">*</span></label>
                            <span class="icon-left">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                            </span>
                            <input type="text" name="address" value="{{ old('address') }}" class="form-control"
                                   placeholder="N° et nom de la rue" required>
                            @error('address')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row full">
                        <div class="form-group">
                            <label class="form-label">Ville <span class="required-star">*</span></label>
                            <input type="text" name="city" value="{{ old('city') }}" class="form-control"
                                   placeholder="Ex: Cotonou" required>
                            @error('city')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row full">
                        <div class="form-group">
                            <label class="form-label">Quartier / Arrondissement</label>
                            <input type="text" name="district" value="{{ old('district') }}" class="form-control"
                                   placeholder="Ex: Fidjrossè">
                            @error('district')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Code postal <span class="required-star">*</span></label>
                            <input type="text" name="zip_code" value="{{ old('zip_code') }}" class="form-control"
                                   placeholder="Ex: 00229" required>
                            @error('zip_code')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">État / Région</label>
                            <input type="text" name="state" value="{{ old('state') }}" class="form-control"
                                   placeholder="Ex: Littoral">
                            @error('state')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Pays</label>
                            <input type="text" name="country" value="{{ old('country') }}" class="form-control"
                                   placeholder="Ex: Bénin">
                            @error('country')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Latitude</label>
                            <input type="text" name="latitude" value="{{ old('latitude') }}" class="form-control"
                                   placeholder="Ex: 6.3667">
                            @error('latitude')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Longitude</label>
                            <input type="text" name="longitude" value="{{ old('longitude') }}" class="form-control"
                                   placeholder="Ex: 2.4333">
                            @error('longitude')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Finances -->
                <div class="form-section finances-section" style="margin-top: 1.5rem;">
                    <div class="finances-header">
                        <span class="finances-icon">💰</span>
                        <h2 class="finances-title">Tarification</h2>
                    </div>

                    <div class="form-row full">
                        <div class="form-group icon-input">
                            <label class="form-label">Loyer mensuel (FCFA)</label>
                            <span class="icon-left">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                                    <path d="M12 6v2M12 16v2"/>
                                </svg>
                            </span>
                            <input type="number" name="rent_amount" value="{{ old('rent_amount') }}" class="form-control"
                                   placeholder="0,00" step="0.01" min="0">
                            @error('rent_amount')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-row full">
                        <div class="form-group icon-input">
                            <label class="form-label">Charges mensuelles (FCFA)</label>
                            <span class="icon-left">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2v20M17 5H9.5M17 12h-5M17 19h-5"/>
                                </svg>
                            </span>
                            <input type="number" name="charges_amount" value="{{ old('charges_amount') }}" class="form-control"
                                   placeholder="0,00" step="0.01" min="0">
                            @error('charges_amount')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                            <div class="form-help">Charges mensuelles (eau, électricité, entretien...)</div>
                        </div>
                    </div>

                    <div class="form-row full">
                        <div class="form-group icon-input">
                            <label class="form-label">Caution / Dépôt de garantie (FCFA)</label>
                            <span class="icon-left">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                </svg>
                            </span>
                            <input type="number" name="caution" value="{{ old('caution') }}" class="form-control"
                                   placeholder="0,00" step="0.01" min="0">
                            @error('caution')
                                <div class="form-error">{{ $message }}</div>
                            @enderror
                            <div class="form-help">Montant de la caution déposée par le locataire</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PHOTOS (FULL WIDTH) -->
            <div class="photos-section">
                <div class="photos-header">
                    <div class="photos-title-group">
                        <span class="photos-icon">🖼️</span>
                        <h2 class="photos-title">Photos du bien</h2>
                    </div>
                    <label class="btn-upload">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L7 21"/>
                        </svg>
                        Ajouter des photos
                        <input type="file" name="photos[]" id="photo-input" accept="image/*" multiple style="display: none;" onchange="handlePhotoUpload()">
                    </label>
                </div>

                <div class="photos-info">
                    <div class="photos-meta">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        Optionnel • Max 8 photos • 5MB max • Reste: <span id="photos-remaining">8</span>
                    </div>
                    <div id="photos-empty" class="photos-empty">Aucune photo ajoutée</div>
                </div>

                <div id="photos-preview" class="photos-preview"></div>
            </div>
        </div>
    </form>
</div>

@push('scripts')
<script>
// Gestion des équipements supplémentaires
let amenities = @json(old('amenities', []));

function addAmenity() {
    const input = document.getElementById('amenity-input');
    const value = input.value.trim();

    if (value && !amenities.includes(value)) {
        amenities.push(value);

        const list = document.getElementById('amenities-list');
        const tag = document.createElement('span');
        tag.className = 'amenity-tag';
        tag.innerHTML = `
            ${value}
            <button type="button" class="amenity-remove" onclick="removeAmenity(this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            <input type="hidden" name="amenities[]" value="${value}">
        `;
        list.appendChild(tag);
        input.value = '';
    }
}

function removeAmenity(button) {
    const tag = button.closest('.amenity-tag');
    const value = tag.querySelector('input[name="amenities[]"]').value;
    amenities = amenities.filter(a => a !== value);
    tag.remove();
}

// Gestion des photos
let photoFiles = [];
let photoPreviews = [];
const MAX_PHOTOS = 8;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function handlePhotoUpload() {
    const input = document.getElementById('photo-input');
    const files = Array.from(input.files);

    if (photoFiles.length + files.length > MAX_PHOTOS) {
        alert(`Vous ne pouvez pas ajouter plus de ${MAX_PHOTOS} photos`);
        return;
    }

    files.forEach(file => {
        if (file.size > MAX_SIZE) {
            alert(`Le fichier ${file.name} dépasse 5MB`);
            return;
        }

        photoFiles.push(file);

        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreviews.push(e.target.result);
            renderPhotos();
        };
        reader.readAsDataURL(file);
    });

    input.value = '';
    updatePhotosRemaining();
}

function removePhoto(index) {
    photoFiles.splice(index, 1);
    photoPreviews.splice(index, 1);
    renderPhotos();
    updatePhotosRemaining();
}

function updatePhotosRemaining() {
    const remaining = MAX_PHOTOS - photoFiles.length;
    const remainingElement = document.getElementById('photos-remaining');
    if (remainingElement) {
        remainingElement.textContent = remaining;
    }
}

function renderPhotos() {
    const container = document.getElementById('photos-preview');
    const emptyMsg = document.getElementById('photos-empty');
    container.innerHTML = '';

    if (photoPreviews.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
    }

    photoPreviews.forEach((src, index) => {
        const div = document.createElement('div');
        div.className = 'photo-thumb';
        div.innerHTML = `
            <img src="${src}" alt="Photo ${index + 1}">
            <button type="button" class="btn-remove-photo" onclick="removePhoto(${index})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;
        container.appendChild(div);
    });

    // Mettre à jour le compteur
    updatePhotosRemaining();
}

// Empêcher la soumission du formulaire avec Enter
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    updatePhotosRemaining();
});
</script>
@endpush
@endsection
