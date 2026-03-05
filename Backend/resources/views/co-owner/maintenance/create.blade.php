@extends('layouts.co-owner')

@section('title', 'Créer une intervention - Copropriétaire')

@section('content')
<div class="maintenance-container" style="border-radius: 5%;">
    <!-- Form Card avec animation d'entrée -->
    <div class="form-card animate-slide-up">
        <!-- Navigation par onglets -->
        <div class="tabs-navigation">
            <div class="tabs-list">
                <button type="button" class="tab-btn active" data-tab="tab-1">
                    <span class="tab-number">1</span>
                    <span class="tab-label">Bien et Locataire</span>
                </button>
                <div class="tab-connector"></div>
                <button type="button" class="tab-btn" data-tab="tab-2">
                    <span class="tab-number">2</span>
                    <span class="tab-label">Détails</span>
                </button>
                <div class="tab-connector"></div>
                <button type="button" class="tab-btn" data-tab="tab-3">
                    <span class="tab-number">3</span>
                    <span class="tab-label">Informations</span>
                </button>
                <div class="tab-connector"></div>
                <button type="button" class="tab-btn" data-tab="tab-4">
                    <span class="tab-number">4</span>
                    <span class="tab-label">Photos</span>
                </button>
            </div>
        </div>

        <form method="POST" action="{{ route('co-owner.maintenance.store') }}" enctype="multipart/form-data" class="maintenance-form" id="maintenanceForm">
            @csrf

            @if(session('error'))
                <div class="alert-box alert-error animate-shake">
                    <div class="alert-icon">
                        <i data-lucide="alert-circle"></i>
                    </div>
                    <div class="alert-content">
                        <strong>Erreur</strong>
                        <p>{{ session('error') }}</p>
                    </div>
                </div>
            @endif

            @if($errors->any())
                <div class="alert-box alert-error animate-shake">
                    <div class="alert-icon">
                        <i data-lucide="alert-circle"></i>
                    </div>
                    <div class="alert-content">
                        <strong>Erreurs de validation</strong>
                        <ul>
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            @endif

            <!-- Onglet 1: Bien et Locataire -->
            <div class="tab-content active" id="tab-1">
                <div class="form-row">
                    <div class="form-group">
                        <label for="property_id" class="form-label">
                            <i data-lucide="building" class="label-icon"></i>
                            Bien concerné <span class="required">*</span>
                        </label>
                        <div class="select-wrapper">
                            <select name="property_id" id="property_id" class="form-select" required onchange="updateTenant(this.value)">
                                <option value="">Sélectionnez un bien</option>
                                @foreach($properties as $property)
                                    <option value="{{ $property['id'] }}" data-tenant-id="{{ $property['tenant_id'] }}" class="property-option">
                                        <span class="property-name">{{ $property['full_address'] }}</span>
                                        <span class="property-city">{{ $property['city'] ?? '' }}</span>
                                    </option>
                                @endforeach
                            </select>
                            <i data-lucide="chevron-down" class="select-icon"></i>
                        </div>
                        <div class="form-hint">
                            <i data-lucide="info"></i>
                            Sélectionnez le bien où se situe le problème
                        </div>
                        @error('property_id')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="tenant_id" class="form-label">
                            <i data-lucide="user" class="label-icon"></i>
                            Locataire concerné <span class="required">*</span>
                        </label>
                        <div class="select-wrapper">
                            <select name="tenant_id" id="tenant_id" class="form-select" required>
                                <option value="">Sélectionnez d'abord un bien</option>
                            </select>
                            <i data-lucide="chevron-down" class="select-icon"></i>
                        </div>
                        <div class="form-hint">
                            <i data-lucide="info"></i>
                            Le locataire sera informé de l'intervention
                        </div>
                        @error('tenant_id')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>
                </div>

                <div class="tab-actions">
                    <button type="button" class="btn-next">
                        Suivant
                        <i data-lucide="arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Onglet 2: Détails de l'intervention -->
            <div class="tab-content" id="tab-2">
                <div class="form-group">
                    <label for="title" class="form-label">
                        <i data-lucide="file-text" class="label-icon"></i>
                        Titre de l'intervention <span class="required">*</span>
                    </label>
                    <div class="input-with-icon">
                        <i data-lucide="edit-2" class="input-icon"></i>
                        <input type="text"
                               name="title"
                               id="title"
                               class="form-input"
                               placeholder="Ex: Fuite d'eau salle de bain"
                               value="{{ old('title') }}"
                               required>
                    </div>
                    @error('title')
                        <span class="error-message">
                            <i data-lucide="alert-circle"></i> {{ $message }}
                        </span>
                    @enderror
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="category" class="form-label">
                            <i data-lucide="tag" class="label-icon"></i>
                            Catégorie <span class="required">*</span>
                        </label>
                        <div class="select-wrapper">
                            <select name="category" id="category" class="form-select" required>
                                <option value="">Choisissez une catégorie</option>
                                <option value="plumbing" {{ old('category') == 'plumbing' ? 'selected' : '' }}>Plomberie</option>
                                <option value="electricity" {{ old('category') == 'electricity' ? 'selected' : '' }}>Électricité</option>
                                <option value="heating" {{ old('category') == 'heating' ? 'selected' : '' }}>Chauffage</option>
                                <option value="other" {{ old('category') == 'other' ? 'selected' : '' }}>Autre</option>
                            </select>
                            <i data-lucide="chevron-down" class="select-icon"></i>
                        </div>
                        @error('category')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="priority" class="form-label">
                            <i data-lucide="alert-triangle" class="label-icon"></i>
                            Priorité <span class="required">*</span>
                        </label>
                        <div class="select-wrapper">
                            <select name="priority" id="priority" class="form-select" required>
                                <option value="">Choisissez une priorité</option>
                                <option value="low" {{ old('priority') == 'low' ? 'selected' : '' }} data-class="priority-low">Faible</option>
                                <option value="medium" {{ old('priority') == 'medium' ? 'selected' : '' }} data-class="priority-medium">Moyenne</option>
                                <option value="high" {{ old('priority') == 'high' ? 'selected' : '' }} data-class="priority-high">Élevée</option>
                                <option value="emergency" {{ old('priority') == 'emergency' ? 'selected' : '' }} data-class="priority-emergency">Urgence</option>
                            </select>
                            <i data-lucide="chevron-down" class="select-icon"></i>
                        </div>
                        <div class="priority-hint" id="priority-hint"></div>
                        @error('priority')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="status" class="form-label">
                            <i data-lucide="activity" class="label-icon"></i>
                            Statut <span class="required">*</span>
                        </label>
                        <div class="select-wrapper">
                            <select name="status" id="status" class="form-select" required>
                                <option value="">Choisissez un statut</option>
                                <option value="open" {{ old('status') == 'open' ? 'selected' : '' }} data-class="status-open">En attente</option>
                                <option value="in_progress" {{ old('status') == 'in_progress' ? 'selected' : '' }} data-class="status-in_progress">En cours</option>
                                <option value="resolved" {{ old('status') == 'resolved' ? 'selected' : '' }} data-class="status-resolved">Résolu</option>
                                <option value="cancelled" {{ old('status') == 'cancelled' ? 'selected' : '' }} data-class="status-cancelled">Annulé</option>
                            </select>
                            <i data-lucide="chevron-down" class="select-icon"></i>
                        </div>
                        @error('status')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="assigned_provider" class="form-label">
                            <i data-lucide="user-check" class="label-icon"></i>
                            Prestataire assigné
                        </label>
                        <div class="input-with-icon">
                            <i data-lucide="users" class="input-icon"></i>
                            <input type="text"
                                   name="assigned_provider"
                                   id="assigned_provider"
                                   class="form-input"
                                   placeholder="Nom du prestataire"
                                   value="{{ old('assigned_provider') }}">
                        </div>
                        @error('assigned_provider')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>
                </div>

                <div class="form-group">
                    <label for="description" class="form-label">
                        <i data-lucide="message-square" class="label-icon"></i>
                        Description détaillée <span class="required">*</span>
                    </label>
                    <div class="textarea-wrapper">
                        <textarea name="description"
                                  id="description"
                                  class="form-textarea"
                                  rows="5"
                                  placeholder="Décrivez le problème en détail..."
                                  required>{{ old('description') }}</textarea>
                        <div class="textarea-counter">
                            <span id="char-count">0</span> / 1000 caractères
                        </div>
                    </div>
                    <div class="form-hint">
                        <i data-lucide="lightbulb"></i>
                        Soyez précis pour une meilleure prise en charge
                    </div>
                    @error('description')
                        <span class="error-message">
                            <i data-lucide="alert-circle"></i> {{ $message }}
                        </span>
                    @enderror
                </div>

                <div class="tab-actions">
                    <button type="button" class="btn-prev">
                        <i data-lucide="arrow-left"></i>
                        Précédent
                    </button>
                    <button type="button" class="btn-next">
                        Suivant
                        <i data-lucide="arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Onglet 3: Informations complémentaires -->
            <div class="tab-content" id="tab-3">
                <div class="form-row">
                    <div class="form-group">
                        <label for="estimated_cost" class="form-label">
                            <i data-lucide="credit-card" class="label-icon"></i>
                            Coût estimé (FCFA)
                        </label>
                        <div class="input-with-icon">
                            <i data-lucide="FCFA" class="input-icon"></i>
                            <input type="number"
                                   name="estimated_cost"
                                   id="estimated_cost"
                                   class="form-input"
                                   placeholder="0"
                                   min="0"
                                   step="0.01"
                                   value="{{ old('estimated_cost') }}">
                        </div>
                        @error('estimated_cost')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="preferred_date" class="form-label">
                            <i data-lucide="calendar" class="label-icon"></i>
                            Date souhaitée d'intervention
                        </label>
                        <div class="input-with-icon">
                            <i data-lucide="calendar" class="input-icon"></i>
                            <input type="date"
                                   name="preferred_date"
                                   id="preferred_date"
                                   class="form-input"
                                   min="{{ date('Y-m-d') }}"
                                   value="{{ old('preferred_date') }}">
                        </div>
                        <div class="form-hint">
                            <i data-lucide="clock"></i>
                            Laissez vide si aucune préférence
                        </div>
                        @error('preferred_date')
                            <span class="error-message">
                                <i data-lucide="alert-circle"></i> {{ $message }}
                            </span>
                        @enderror
                    </div>
                </div>

                <div class="tab-actions">
                    <button type="button" class="btn-prev">
                        <i data-lucide="arrow-left"></i>
                        Précédent
                    </button>
                    <button type="button" class="btn-next">
                        Suivant
                        <i data-lucide="arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Onglet 4: Photos -->
            <div class="tab-content" id="tab-4">
                <div class="form-group">
                    <label class="form-label">
                        <i data-lucide="camera" class="label-icon"></i>
                        Photos (optionnel)
                    </label>
                    <div class="file-upload-area" id="drop-area">
                        <input type="file"
                               name="photos[]"
                               id="photos"
                               class="file-input"
                               multiple
                               accept="image/*"
                               onchange="handleFiles(this.files)">
                        <div class="upload-content">
                            <div class="upload-icon">
                                <i data-lucide="upload-cloud"></i>
                            </div>
                            <div class="upload-text">
                                <p class="upload-title">Glissez-déposez vos images ici</p>
                                <p class="upload-subtitle">ou cliquez pour parcourir</p>
                            </div>
                            <div class="upload-requirements">
                                <i data-lucide="info"></i>
                                Formats supportés : JPG, PNG, WebP • Max 5Mo par fichier
                            </div>
                        </div>
                    </div>
                    <div id="file-preview" class="file-preview-container"></div>
                    @error('photos.*')
                        <span class="error-message">
                            <i data-lucide="alert-circle"></i> {{ $message }}
                        </span>
                    @enderror
                </div>

                <div class="tab-actions">
                    <button type="button" class="btn-prev">
                        <i data-lucide="arrow-left"></i>
                        Précédent
                    </button>
                    <button type="submit" class="btn-submit animate-pulse">
                        <i data-lucide="check-circle"></i>
                        Créer l'intervention
                        <span class="btn-loading" id="btn-loading">
                            <i data-lucide="loader-2" class="spin"></i>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Navigation par étapes -->
            <div class="form-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="progress-steps">
                    <span class="step active" data-step="1">Bien</span>
                    <span class="step" data-step="2">Détails</span>
                    <span class="step" data-step="3">Infos</span>
                    <span class="step" data-step="4">Photos</span>
                </div>
            </div>
        </form>
    </div>
</div>

<style>
    :root {
        --primary-green: #70AE48;
        --primary-light: #8BC34A;
        --primary-dark: #5d8f3a;
        --secondary-sky: #38bdf8;
        --secondary-cyan: #06b6d4;
        --accent-teal: #14b8a6;
        --success-green: #10b981;
        --warning-amber: #f59e0b;
        --error-red: #ef4444;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-400: #9ca3af;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gradient-primary: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-light) 100%);
        --gradient-secondary: linear-gradient(135deg, var(--secondary-sky) 0%, var(--accent-teal) 100%);
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        --shadow-green: 0 10px 40px rgba(112, 174, 72, 0.2);
        --border-radius: 12px;
        --border-radius-lg: 16px;
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .maintenance-container {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    /* Animations */
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .animate-float {
        animation: float 3s ease-in-out infinite;
    }

    .animate-slide-up {
        animation: slideUp 0.6s ease-out;
    }

    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
        opacity: 0;
    }

    .animate-shake {
        animation: shake 0.5s ease-in-out;
    }

    .animate-pulse {
        animation: pulse 2s infinite;
    }

    .animate-hover:hover {
        transform: translateY(-2px);
        transition: var(--transition);
    }

    /* Header */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
    }

    .header-content {
        flex: 1;
    }

    .header-title-wrapper {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .title-icon {
        width: 48px;
        height: 48px;
        background: var(--gradient-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: var(--shadow-green);
    }

    .title-icon i {
        width: 24px;
        height: 24px;
    }

    .header-content h1 {
        font-size: 2rem;
        font-weight: 800;
        color: var(--primary-dark);
        margin: 0;
    }

    .subtitle {
        color: var(--gray-600);
        font-size: 1rem;
        margin: 0;
        font-weight: 500;
    }

    .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: white;
        color: var(--gray-600);
        border: 2px solid var(--gray-200);
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: var(--transition);
        box-shadow: var(--shadow-sm);
    }

    .btn-back:hover {
        background: var(--gray-50);
        border-color: var(--primary-light);
        color: var(--primary-green);
        box-shadow: var(--shadow-md);
    }

    /* Form Card */
    .form-card {
        background: white;
        border-radius: var(--border-radius-lg);
        border: 1px solid var(--gray-200);
        padding: 2rem;
        box-shadow: var(--shadow-xl);
        position: relative;
        overflow: hidden;
    }

    .form-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--gradient-primary);
    }

    /* Navigation par onglets */
    .tabs-navigation {
        margin-bottom: 2rem;
    }

    .tabs-list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
    }

    .tab-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        position: relative;
        transition: var(--transition);
        min-width: 80px;
        z-index: 2;
    }

    .tab-btn.active {
        transform: translateY(-3px);
    }

    .tab-btn.active .tab-number {
        background: var(--gradient-primary);
        color: white;
        box-shadow: var(--shadow-green);
    }

    .tab-btn.active .tab-label {
        color: var(--primary-green);
        font-weight: 600;
    }

    .tab-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--gray-200);
        color: var(--gray-500);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        transition: var(--transition);
    }

    .tab-label {
        font-size: 0.8rem;
        color: var(--gray-500);
        transition: var(--transition);
        text-align: center;
        white-space: nowrap;
    }

    .tab-connector {
        flex: 1;
        height: 2px;
        background: var(--gray-200);
        margin: 0 0.25rem;
        position: relative;
        overflow: hidden;
    }

    .tab-connector::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: var(--gradient-primary);
        transition: var(--transition);
    }

    .tab-btn.active + .tab-connector::after {
        left: 0;
    }

    /* Contenu des onglets */
    .tab-content {
        display: none;
        animation: fadeIn 0.3s ease-out;
    }

    .tab-content.active {
        display: block;
    }

    .tab-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--gray-200);
    }

    .btn-prev,
    .btn-next {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: var(--border-radius);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: var(--transition);
    }

    .btn-prev {
        background: var(--gray-100);
        color: var(--gray-600);
        border: 1px solid var(--gray-300);
    }

    .btn-prev:hover {
        background: var(--gray-200);
        border-color: var(--gray-400);
        color: var(--gray-700);
    }

    .btn-next {
        background: var(--primary-green);
        color: white;
        border: 1px solid var(--primary-green);
    }

    .btn-next:hover {
        background: var(--primary-dark);
        border-color: var(--primary-dark);
        transform: translateX(3px);
    }

    /* Barre de progression */
    .form-progress {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--gray-200);
    }

    .progress-bar {
        height: 6px;
        background: var(--gray-200);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 0.75rem;
    }

    .progress-fill {
        height: 100%;
        background: var(--gradient-primary);
        width: 25%;
        transition: width 0.3s ease;
    }

    .progress-steps {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--gray-500);
    }

    .step.active {
        color: var(--primary-green);
        font-weight: 600;
    }

    /* Form Elements */
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
    }

    .label-icon {
        width: 16px;
        height: 16px;
        color: var(--primary-green);
    }

    .required {
        color: var(--error-red);
    }

    .select-wrapper {
        position: relative;
    }

    .form-select {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 2px solid var(--gray-300);
        border-radius: var(--border-radius);
        font-size: 0.9rem;
        color: var(--gray-800);
        background: white;
        transition: var(--transition);
        appearance: none;
        cursor: pointer;
    }

    .form-select:focus {
        outline: none;
        border-color: var(--primary-green);
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .select-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        color: var(--gray-400);
        pointer-events: none;
        transition: var(--transition);
    }

    .form-select:focus + .select-icon {
        color: var(--primary-green);
    }

    /* Inputs */
    .input-with-icon {
        position: relative;
    }

    .input-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: var(--gray-400);
        z-index: 1;
    }

    .form-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 2px solid var(--gray-300);
        border-radius: var(--border-radius);
        font-size: 0.9rem;
        color: var(--gray-800);
        background: white;
        transition: var(--transition);
    }

    .form-input:focus {
        outline: none;
        border-color: var(--primary-green);
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    /* Textarea */
    .textarea-wrapper {
        position: relative;
    }

    .form-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--gray-300);
        border-radius: var(--border-radius);
        font-size: 0.9rem;
        color: var(--gray-800);
        background: white;
        transition: var(--transition);
        resize: vertical;
        min-height: 120px;
        font-family: inherit;
    }

    .form-textarea:focus {
        outline: none;
        border-color: var(--primary-green);
        box-shadow: 0 0 0 3px rgba(112, 174, 72, 0.1);
    }

    .textarea-counter {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        font-size: 0.7rem;
        color: var(--gray-400);
        background: white;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
    }

    /* Form Hints */
    .form-hint {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.7rem;
        color: var(--gray-500);
        margin-top: 0.5rem;
    }

    .form-hint i {
        width: 12px;
        height: 12px;
    }

    /* Priority */
    .priority-hint {
        font-size: 0.75rem;
        padding: 0.5rem;
        border-radius: 8px;
        margin-top: 0.5rem;
        display: none;
    }

    .priority-low {
        color: var(--success-green);
        background: rgba(16, 185, 129, 0.1);
    }
    .priority-medium {
        color: var(--warning-amber);
        background: rgba(245, 158, 11, 0.1);
    }
    .priority-high {
        color: #f97316;
        background: rgba(249, 115, 22, 0.1);
    }
    .priority-emergency {
        color: var(--error-red);
        background: rgba(239, 68, 68, 0.1);
    }

    /* Status Styles */
    .status-open {
        color: var(--warning-amber);
        background: rgba(245, 158, 11, 0.1);
    }
    .status-in_progress {
        color: var(--primary-green);
        background: rgba(112, 174, 72, 0.1);
    }
    .status-resolved {
        color: var(--success-green);
        background: rgba(16, 185, 129, 0.1);
    }
    .status-cancelled {
        color: var(--error-red);
        background: rgba(239, 68, 68, 0.1);
    }

    /* File Upload */
    .file-upload-area {
        border: 2px dashed var(--gray-300);
        border-radius: var(--border-radius);
        background: var(--gray-50);
        padding: 2rem;
        text-align: center;
        transition: var(--transition);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .file-upload-area:hover {
        border-color: var(--primary-green);
        background: rgba(112, 174, 72, 0.05);
    }

    .file-upload-area.drag-over {
        border-color: var(--success-green);
        background: rgba(16, 185, 129, 0.1);
    }

    .file-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        top: 0;
        left: 0;
    }

    .upload-content {
        pointer-events: none;
    }

    .upload-icon {
        width: 48px;
        height: 48px;
        background: var(--gradient-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        color: white;
    }

    .upload-icon i {
        width: 24px;
        height: 24px;
    }

    .upload-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-800);
        margin: 0 0 0.25rem 0;
    }

    .upload-subtitle {
        font-size: 0.85rem;
        color: var(--gray-500);
        margin: 0 0 1rem 0;
    }

    .upload-requirements {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.7rem;
        color: var(--gray-400);
        padding: 0.5rem 1rem;
        background: white;
        border-radius: 20px;
        border: 1px solid var(--gray-200);
    }

    .upload-requirements i {
        width: 12px;
        height: 12px;
    }

    /* File Preview */
    .file-preview-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .file-preview {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid var(--gray-200);
        transition: var(--transition);
    }

    .file-preview:hover {
        transform: translateY(-2px);
        border-color: var(--primary-green);
        box-shadow: var(--shadow-md);
    }

    .file-preview img {
        width: 100%;
        height: 80px;
        object-fit: cover;
        display: block;
    }

    .file-preview .remove-btn {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        width: 20px;
        height: 20px;
        background: var(--error-red);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        opacity: 0;
        transition: var(--transition);
    }

    .file-preview:hover .remove-btn {
        opacity: 1;
    }

    .remove-btn:hover {
        background: #dc2626;
    }

    /* Alerts */
    .alert-box {
        border-radius: var(--border-radius);
        padding: 1rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        border: 1px solid;
    }

    .alert-error {
        background: linear-gradient(to right, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.9));
        border-color: var(--error-red);
    }

    .alert-icon {
        width: 20px;
        height: 20px;
        color: var(--error-red);
        flex-shrink: 0;
    }

    .alert-content {
        flex: 1;
    }

    .alert-content strong {
        display: block;
        color: var(--gray-800);
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
    }

    .alert-content p,
    .alert-content ul {
        color: var(--gray-700);
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.4;
    }

    .alert-content ul {
        padding-left: 1.25rem;
        margin-top: 0.5rem;
    }

    /* Error Messages */
    .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--error-red);
        margin-top: 0.25rem;
    }

    .error-message i {
        width: 12px;
        height: 12px;
    }

    /* Submit Button */
    .btn-submit {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.875rem 1.75rem;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: var(--transition);
        position: relative;
        overflow: hidden;
    }

    .btn-submit:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-green);
    }

    .btn-submit::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: 0.5s;
    }

    .btn-submit:hover::after {
        left: 100%;
    }

    .btn-loading {
        display: none;
    }

    .btn-loading .spin {
        animation: spin 1s linear infinite;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .maintenance-container {
            padding: 0 0.5rem;
        }

        .page-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .header-title-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .form-card {
            padding: 1.25rem;
        }

        .tabs-list {
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .tab-connector {
            display: none;
        }

        .tab-btn {
            min-width: 60px;
        }

        .tab-label {
            font-size: 0.7rem;
        }

        .tab-actions {
            flex-direction: column;
            gap: 0.75rem;
        }

        .btn-prev,
        .btn-next,
        .btn-submit {
            width: 100%;
            justify-content: center;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Navigation par onglets
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const progressFill = document.getElementById('progress-fill');
        const steps = document.querySelectorAll('.step');
        const nextButtons = document.querySelectorAll('.btn-next');
        const prevButtons = document.querySelectorAll('.btn-prev');

        // Variables pour stocker les données du formulaire
        const formData = {
            property_id: '',
            tenant_id: '',
            title: '',
            category: '',
            priority: '',
            status: '',
            description: '',
            estimated_cost: '',
            preferred_date: '',
            assigned_provider: '',
            photos: []
        };

        // Initialiser la navigation
        let currentTab = 1;
        const totalTabs = 4;

        function updateProgress() {
            const progress = (currentTab / totalTabs) * 100;
            progressFill.style.width = `${progress}%`;

            // Mettre à jour les étapes actives
            steps.forEach((step, index) => {
                if (index + 1 <= currentTab) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        function switchTab(tabNumber) {
            // Valider l'onglet actuel avant de passer au suivant
            if (!validateCurrentTab()) {
                return;
            }

            // Sauvegarder les données de l'onglet actuel
            saveTabData(currentTab);

            // Mettre à jour l'onglet actif
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === `tab-${tabNumber}`) {
                    btn.classList.add('active');
                }
            });

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabNumber}`) {
                    content.classList.add('active');
                }
            });

            // Mettre à jour le connecteur
            updateConnector(tabNumber);

            currentTab = tabNumber;
            updateProgress();
        }

        function updateConnector(currentTab) {
            const connectors = document.querySelectorAll('.tab-connector');
            connectors.forEach((connector, index) => {
                if (index + 1 < currentTab) {
                    connector.style.background = 'var(--gradient-primary)';
                } else {
                    connector.style.background = 'var(--gray-200)';
                }
            });
        }

        function validateCurrentTab() {
            let isValid = true;
            const currentTabContent = document.getElementById(`tab-${currentTab}`);
            const requiredInputs = currentTabContent.querySelectorAll('[required]');

            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';

                    // Ajouter une animation de shake
                    input.classList.add('animate-shake');
                    setTimeout(() => {
                        input.classList.remove('animate-shake');
                    }, 500);
                }
            });

            if (!isValid) {
                showTabError('Veuillez remplir tous les champs obligatoires');
            }

            return isValid;
        }

        function showTabError(message) {
            // Créer un message d'erreur temporaire
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert-box alert-error animate-shake';
            errorDiv.innerHTML = `
                <div class="alert-icon">
                    <i data-lucide="alert-circle"></i>
                </div>
                <div class="alert-content">
                    <strong>Validation requise</strong>
                    <p>${message}</p>
                </div>
            `;

            const currentTab = document.querySelector('.tab-content.active');
            currentTab.insertBefore(errorDiv, currentTab.firstChild);

            // Supprimer après 5 secondes
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }

        function saveTabData(tabNumber) {
            const tab = document.getElementById(`tab-${tabNumber}`);
            const inputs = tab.querySelectorAll('input, select, textarea');

            inputs.forEach(input => {
                if (input.name && input.value) {
                    formData[input.name] = input.value;
                }
            });
        }

        function restoreTabData(tabNumber) {
            const tab = document.getElementById(`tab-${tabNumber}`);
            const inputs = tab.querySelectorAll('input, select, textarea');

            inputs.forEach(input => {
                if (input.name && formData[input.name]) {
                    input.value = formData[input.name];
                }
            });
        }

        // Fonctions du formulaire
        const propertiesData = @json($properties);
        const tenantsData = @json($tenants);

        window.updateTenant = function(propertyId) {
            const tenantSelect = document.getElementById('tenant_id');
            const property = propertiesData.find(p => p.id == propertyId);

            tenantSelect.innerHTML = '<option value="">Chargement...</option>';

            if (property && property.tenant) {
                tenantSelect.innerHTML = `
                    <option value="${property.tenant_id}" selected>
                        👤 ${property.tenant.first_name} ${property.tenant.last_name}
                    </option>
                `;
            } else if (propertyId) {
                const relevantTenants = tenantsData.filter(t => true);
                if (relevantTenants.length > 0) {
                    tenantSelect.innerHTML = relevantTenants.map(t => `
                        <option value="${t.id}">
                            👤 ${t.full_name}
                        </option>
                    `).join('');
                } else {
                    tenantSelect.innerHTML = '<option value="">Aucun locataire disponible</option>';
                }
            } else {
                tenantSelect.innerHTML = '<option value="">Sélectionnez d\'abord un bien</option>';
            }
        }

        // Gestion de la priorité
        const prioritySelect = document.getElementById('priority');
        const priorityHint = document.getElementById('priority-hint');
        const priorityMessages = {
            'low': '🟢 Réponse sous 7 jours • Impact minimal sur le locataire',
            'medium': '🟡 Réponse sous 3 jours • Gênant mais pas urgent',
            'high': '🟠 Réponse sous 24h • Problème important affectant le confort',
            'emergency': '🔴 Intervention immédiate • Danger ou dégâts en cours'
        };

        prioritySelect.addEventListener('change', function() {
            if (this.value && priorityMessages[this.value]) {
                priorityHint.textContent = priorityMessages[this.value];
                priorityHint.className = `priority-hint priority-${this.value}`;
                priorityHint.style.display = 'block';
            } else {
                priorityHint.style.display = 'none';
            }
        });

        // Gestion du statut
        const statusSelect = document.getElementById('status');
        const statusMessages = {
            'open': '🟡 Demande en attente de traitement',
            'in_progress': '🔵 Intervention en cours',
            'resolved': '🟢 Problème résolu',
            'cancelled': '🔴 Demande annulée'
        };

        // Compteur de caractères
        const descriptionTextarea = document.getElementById('description');
        const charCount = document.getElementById('char-count');

        descriptionTextarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            charCount.style.color = count > 900 ? '#ef4444' : count > 700 ? '#f59e0b' : '#6b7280';
        });

        // Initialiser le compteur
        charCount.textContent = descriptionTextarea.value.length;

        // Événements pour les boutons d'onglet
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = parseInt(this.dataset.tab.split('-')[1]);
                if (targetTab !== currentTab) {
                    switchTab(targetTab);
                }
            });
        });

        // Événements pour les boutons Suivant
        nextButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (currentTab < totalTabs) {
                    switchTab(currentTab + 1);
                }
            });
        });

        // Événements pour les boutons Précédent
        prevButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (currentTab > 1) {
                    switchTab(currentTab - 1);
                    restoreTabData(currentTab - 1);
                }
            });
        });

        // Initialiser la barre de progression
        updateProgress();
    });
</script>
@endsection
