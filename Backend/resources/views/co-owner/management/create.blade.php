@extends('layouts.co-owner')

@section('title', 'Inviter un gestionnaire')

@section('content')
<style>
    :root {
        --primary: #70AE48;
        --primary-dark: #5c8f3a;
        --primary-light: #f0f9e6;
        --primary-soft: rgba(112, 174, 72, 0.08);
        --primary-border: rgba(112, 174, 72, 0.2);
        --purple: #8b5cf6;
        --purple-light: #f5f3ff;
        --purple-soft: rgba(139, 92, 246, 0.08);
        --green: #10b981;
        --red: #ef4444;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-400: #9ca3af;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gray-900: #111827;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    body {
        background: linear-gradient(135deg, #f8fafc 0%, #f0f9eb 100%);
        min-height: 100vh;
    }

    .invite-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
    }

    .header-wrapper {
        text-align: center;
        margin-bottom: 3rem;
    }

    .header-icon {
        width: 5rem;
        height: 5rem;
        background: linear-gradient(135deg, var(--primary-light), #ffffff);
        border-radius: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        border: 2px solid var(--primary-border);
        box-shadow: var(--shadow-md);
    }

    .header-icon svg {
        width: 2.5rem;
        height: 2.5rem;
        color: var(--primary);
    }

    .header-wrapper h1 {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--gray-900);
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }

    .header-wrapper p {
        color: var(--gray-500);
        font-size: 1.1rem;
    }

    .alert {
        padding: 1rem 1.25rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid;
    }

    .alert-success {
        background: #f0f9eb;
        border-color: var(--primary-border);
        color: #2e6216;
    }

    .alert-error {
        background: #fef2f2;
        border-color: #fecaca;
        color: #991b1b;
    }

    .selection-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    @media (min-width: 768px) {
        .selection-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .type-card {
        background: white;
        border-radius: 2rem;
        padding: 2rem;
        border: 2px solid var(--gray-200);
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        overflow: hidden;
    }

    .type-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
    }

    .type-card.selected-coowner {
        border-color: var(--primary);
        background: linear-gradient(135deg, white, var(--primary-light));
        box-shadow: 0 20px 25px -5px rgba(112, 174, 72, 0.2);
    }

    .type-card.selected-agency {
        border-color: var(--purple);
        background: linear-gradient(135deg, white, var(--purple-light));
        box-shadow: 0 20px 25px -5px rgba(139, 92, 246, 0.2);
    }

    .card-icon {
        width: 4rem;
        height: 4rem;
        border-radius: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
    }

    .card-icon.coowner {
        background: var(--primary-light);
        color: var(--primary);
    }

    .card-icon.agency {
        background: var(--purple-light);
        color: var(--purple);
    }

    .type-card h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: 0.75rem;
        text-align: center;
    }

    .type-card p {
        color: var(--gray-500);
        text-align: center;
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }

    .feature-list {
        text-align: left;
        padding: 1rem 0 0;
        border-top: 1px solid var(--gray-200);
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        color: var(--gray-600);
        font-size: 0.938rem;
    }

    .feature-item svg {
        flex-shrink: 0;
        color: var(--green);
    }

    .choose-btn {
        width: 100%;
        margin-top: 1.5rem;
        padding: 0.75rem 1.5rem;
        border: 2px solid var(--gray-300);
        border-radius: 1rem;
        background: white;
        color: var(--gray-700);
        font-weight: 600;
        font-size: 0.938rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .choose-btn:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: var(--primary-light);
    }

    .type-card.selected-coowner .choose-btn {
        border-color: var(--primary);
        color: var(--primary);
        background: var(--primary-light);
    }

    .type-card.selected-agency .choose-btn {
        border-color: var(--purple);
        color: var(--purple);
        background: var(--purple-light);
    }

    .form-card {
        background: white;
        border-radius: 2rem;
        border: 2px solid var(--gray-200);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin-top: 2rem;
    }

    .form-header {
        padding: 1.5rem 2rem;
        background: linear-gradient(135deg, var(--gray-50), white);
        border-bottom: 2px solid var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .form-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--primary), #8bc34a);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .change-type-btn {
        padding: 0.5rem 1rem;
        background: var(--gray-100);
        border: 1px solid var(--gray-300);
        border-radius: 2rem;
        color: var(--gray-600);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }

    .change-type-btn:hover {
        background: white;
        border-color: var(--primary);
        color: var(--primary);
    }

    .form-body {
        padding: 2rem;
    }

    .form-section {
        margin-bottom: 2rem;
    }

    .section-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid var(--primary-border);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .section-title svg {
        color: var(--primary);
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }

    @media (min-width: 768px) {
        .form-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-700);
    }

    .required {
        color: var(--red);
        font-size: 0.875rem;
    }

    .form-input {
        padding: 0.875rem 1rem;
        border: 2px solid var(--gray-300);
        border-radius: 1rem;
        font-size: 0.95rem;
        transition: all 0.2s;
        background: white;
        width: 100%;
    }

    .form-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 4px var(--primary-soft);
    }

    .form-input::placeholder {
        color: var(--gray-400);
    }

    .info-box {
        background: linear-gradient(135deg, var(--purple-light), #ffffff);
        border: 2px solid #d8b4fe;
        border-radius: 1.5rem;
        padding: 1.25rem;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .info-box svg {
        color: var(--purple);
        flex-shrink: 0;
    }

    .info-box p {
        color: #6b21a8;
        font-weight: 500;
        font-size: 0.938rem;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 2rem;
        margin-top: 2rem;
        border-top: 2px solid var(--gray-200);
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 2rem;
        border-radius: 1rem;
        font-size: 0.938rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
    }

    .btn-primary {
        background: var(--primary);
        color: white;
        box-shadow: var(--shadow-md);
    }

    .btn-primary:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .btn-primary.agency {
        background: var(--purple);
    }

    .btn-primary.agency:hover {
        background: #7c3aed;
    }

    .btn-secondary {
        background: white;
        border-color: var(--gray-300);
        color: var(--gray-700);
    }

    .btn-secondary:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: var(--primary-light);
    }

    .d-none {
        display: none !important;
    }

    .progress-steps {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin: 2rem 0;
    }

    .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .step-circle {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.3s;
    }

    .step-circle.active {
        background: var(--primary);
        color: white;
    }

    .step-circle.completed {
        background: var(--primary);
        color: white;
    }

    .step-circle.inactive {
        background: var(--gray-200);
        color: var(--gray-600);
    }

    .step-line {
        width: 4rem;
        height: 0.25rem;
        background: var(--gray-200);
        border-radius: 0.125rem;
        transition: all 0.3s;
    }

    .step-line.active {
        background: var(--primary);
    }

    .step-label {
        font-size: 0.75rem;
        color: var(--gray-600);
    }

    .confirm-box {
        padding: 1.5rem;
        border-radius: 1rem;
        margin-bottom: 1rem;
        border: 2px solid;
    }

    .confirm-box.coowner-confirm {
        background: #eff6ff;
        border-color: #bfdbfe;
    }

    .confirm-box.agency-confirm {
        background: #faf5ff;
        border-color: #e9d5ff;
    }

    .confirm-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1rem;
    }

    .confirm-item {
        flex: 1;
        min-width: 180px;
    }

    .confirm-item .label {
        font-size: 0.8rem;
        color: var(--gray-500);
    }

    .confirm-item .value {
        font-weight: 600;
        color: var(--gray-800);
        font-size: 0.938rem;
    }

    .info-note {
        padding: 1rem 1.25rem;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        color: var(--gray-700);
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    @media (max-width: 640px) {
        .invite-container { padding: 1rem; }
        .header-wrapper h1 { font-size: 2rem; }
        .form-header { flex-direction: column; gap: 1rem; text-align: center; }
        .form-actions { flex-direction: column; }
        .form-actions .btn { width: 100%; }
        .step-label { display: none; }
        .step-line { width: 2rem; }
    }
</style>

<div class="invite-container">

    <!-- En-tête -->
    <div class="header-wrapper">
        <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
        </div>
        <h1 id="main-title">Inviter un gestionnaire</h1>
        <p id="main-subtitle">Choisissez le type de gestionnaire que vous souhaitez inviter</p>
    </div>

   


<!-- Messages Flash -->
@if(session('success'))
    <div class="alert alert-success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"></path>
        </svg>
        <span>{{ session('success') }}</span>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ session('error') }}</span>
    </div>
@endif


@if($errors->any())
    <div class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
            <strong style="display: block; margin-bottom: 0.5rem;">Veuillez corriger les erreurs suivantes :</strong>
            <ul style="list-style: none; padding: 0; margin: 0;">
                @foreach($errors->all() as $error)
                    <li style="margin-bottom: 0.25rem;">• {{ $error }}</li>
                @endforeach
            </ul>
        </div>
    </div>
@endif

    <!-- Écran sélection du type -->
    <div id="type-selection">
        <div class="selection-grid">

            <!-- Carte Co-propriétaire -->
            <div class="type-card" id="co_owner_card">
                <div class="card-icon coowner">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
                <h3>Co-propriétaire</h3>
                <p>Invitez un co-propriétaire à gérer vos biens ensemble. Peut être un particulier ou un professionnel.</p>
                <div class="feature-list">
                    <div class="feature-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
                        <span>Gestion conjointe des biens</span>
                    </div>
                    <div class="feature-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
                        <span>Permissions contrôlées</span>
                    </div>
                    <div class="feature-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
                        <span>Particulier ou Professionnel</span>
                    </div>
                </div>
                <button type="button" class="choose-btn" id="btn-coowner">
                    Choisir
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"></path>
                    </svg>
                </button>
            </div>

            <!-- Carte Agence -->
            <div class="type-card" id="agency_card">
                <div class="card-icon agency">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
                <h3>Agence Immobilière</h3>
                <p>Invitez une agence professionnelle pour gérer vos biens. Documents professionnels obligatoires.</p>
                <div class="feature-list">
                    <div class="feature-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
                        <span>Gestion professionnelle</span>
                    </div>
                    <div class="feature-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
                        <span>Documents légaux requis (IFU, RCCM)</span>
                    </div>
                    <div class="feature-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
                        <span>Facturation professionnelle</span>
                    </div>
                </div>
                <button type="button" class="choose-btn" id="btn-agency">
                    Choisir
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"></path>
                    </svg>
                </button>
            </div>

        </div>
    </div>

    <!-- Formulaire d'invitation (caché par défaut) -->
    <div id="invitation_form" class="d-none">
        <div class="form-card">
            <div class="form-header">
                <h2 id="form_title">Inviter un co-propriétaire</h2>
                <button type="button" id="btn-reset" class="change-type-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 5l-7 7 7 7"></path>
                    </svg>
                    Changer de type
                </button>
            </div>

            <div class="form-body">
                <form action="{{ route('co-owner.management.invite') }}" method="POST" id="invite_form">
                    @csrf
                    <input type="hidden" name="invitation_type" id="invitation_type" value="co_owner">

                    <!-- Indicateur de progression -->
                    <div class="progress-steps">
                        <div class="step">
                            <div class="step-circle active" id="step-circle-1">1</div>
                            <span class="step-label">Infos de base</span>
                        </div>
                        <div class="step-line" id="line1"></div>
                        <div class="step">
                            <div class="step-circle inactive" id="step-circle-2">2</div>
                            <span class="step-label">Infos complémentaires</span>
                        </div>
                        <div class="step-line" id="line2"></div>
                        <div class="step">
                            <div class="step-circle inactive" id="step-circle-3">3</div>
                            <span class="step-label">Confirmation</span>
                        </div>
                    </div>

                    <!-- ÉTAPE 1 : Informations de base -->
                    <div id="step1-content" class="form-section">
                        <div class="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Informations de base
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Prénom <span class="required">*</span></label>
                                <input type="text" name="first_name" id="first_name" class="form-input" placeholder="Prénom">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Nom <span class="required">*</span></label>
                                <input type="text" name="last_name" id="last_name" class="form-input" placeholder="Nom">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email <span class="required">*</span></label>
                                <input type="email" name="email" id="email" class="form-input" placeholder="email@exemple.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Téléphone</label>
                                <input type="tel" name="phone" id="phone" class="form-input" placeholder="+229 00 00 00 00">
                            </div>
                        </div>
                    </div>

                    <!-- ÉTAPE 2 : Informations spécifiques -->
                    <div id="step2-content" class="d-none">

                        <!-- Co-propriétaire : pas d'infos sup -->
                        <div id="coowner-step2" class="form-section d-none">
                            <div class="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Informations complémentaires
                            </div>
                            <div style="text-align:center; padding: 2rem 0;">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" style="margin: 0 auto 1rem; display:block;">
                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                                <p style="color:#4b5563;">Le co-propriétaire est un particulier. Aucune information supplémentaire requise.</p>
                                <p style="color:#6b7280; font-size:0.875rem; margin-top:0.5rem;">Vous pouvez passer directement à l'étape de confirmation</p>
                            </div>
                        </div>

                        <!-- Agence : infos professionnelles -->
                        <div id="agency-step2" class="form-section d-none">
                            <div class="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"></path>
                                </svg>
                                Informations de l'agence
                            </div>
                            <div class="info-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <p>Pour une agence, les documents légaux (IFU et RCCM) sont obligatoires</p>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Nom de l'agence</label>
                                    <input type="text" name="company_name" id="company_name" class="form-input" placeholder="Immobilier Excellence">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">IFU <span class="required">*</span></label>
                                    <input type="text" name="ifu" id="ifu" class="form-input" placeholder="1234567890123">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">RCCM <span class="required">*</span></label>
                                    <input type="text" name="rccm" id="rccm" class="form-input" placeholder="BJ-1234-5678-BJ-2023">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Numéro TVA</label>
                                    <input type="text" name="vat_number" id="vat_number" class="form-input" placeholder="BJ123456789">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label class="form-label">Adresse de facturation</label>
                                    <input type="text" name="address_billing" id="address_billing" class="form-input" placeholder="123 Rue du Commerce, Cotonou">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ÉTAPE 3 : Confirmation -->
                    <div id="step3-content" class="d-none">
                        <div class="form-section">
                            <div class="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Confirmation de l'invitation
                            </div>
                            <div id="confirmation-content" class="confirm-box coowner-confirm"></div>
                            <div class="info-note" style="margin-top:1rem;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="flex-shrink:0;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <p>Un email d'invitation sera envoyé à <strong id="confirm-email"></strong>. <span id="confirm-message"></span></p>
                            </div>
                        </div>
                    </div>

                    <!-- Boutons de navigation -->
                    <div class="form-actions">
                        <button type="button" id="prevBtn" class="btn btn-secondary d-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"></path>
                            </svg>
                            Précédent
                        </button>
                        <button type="button" id="nextBtn" class="btn btn-primary">
                            Suivant
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6"></path>
                            </svg>
                        </button>
                        <button type="submit" id="submitBtn" class="btn btn-primary d-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                            Inviter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

</div>

<script>
// ============================================================
// VARIABLES D'ÉTAT — déclarées directement dans le scope global
// ============================================================
var inviteCurrentStep = 1;
var inviteSelectedType = null;
var inviteFormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    ifu: '',
    rccm: '',
    vat_number: '',
    address_billing: ''
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================
function inviteShow(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('d-none');
}

function inviteHide(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('d-none');
}

// ============================================================
// SÉLECTION DU TYPE
// ============================================================
function inviteSelectType(type) {
    inviteSelectedType = type;

    // Mettre à jour visuellement les cartes
    document.getElementById('co_owner_card').classList.remove('selected-coowner');
    document.getElementById('agency_card').classList.remove('selected-agency');

    if (type === 'co_owner') {
        document.getElementById('co_owner_card').classList.add('selected-coowner');
    } else {
        document.getElementById('agency_card').classList.add('selected-agency');
    }

    // Passer au formulaire
    inviteHide('type-selection');
    inviteShow('invitation_form');

    // Mettre à jour l'input caché
    document.getElementById('invitation_type').value = type;

    // Mettre à jour les titres
    if (type === 'agency') {
        document.getElementById('form_title').textContent = 'Inviter une agence';
        document.getElementById('main-title').textContent = 'Inviter une agence';
        document.getElementById('main-subtitle').textContent = "Remplissez les informations de l'agence à inviter";
        document.getElementById('submitBtn').classList.add('agency');
    } else {
        document.getElementById('form_title').textContent = 'Inviter un co-propriétaire';
        document.getElementById('main-title').textContent = 'Inviter un co-propriétaire';
        document.getElementById('main-subtitle').textContent = 'Remplissez les informations du co-propriétaire à inviter';
        document.getElementById('submitBtn').classList.remove('agency');
    }

    inviteCurrentStep = 1;
    inviteUpdateSteps();
}

// ============================================================
// RÉINITIALISATION
// ============================================================
function inviteResetSelection() {
    inviteSelectedType = null;

    document.getElementById('co_owner_card').classList.remove('selected-coowner');
    document.getElementById('agency_card').classList.remove('selected-agency');

    inviteShow('type-selection');
    inviteHide('invitation_form');

    document.getElementById('main-title').textContent = 'Inviter un gestionnaire';
    document.getElementById('main-subtitle').textContent = 'Choisissez le type de gestionnaire que vous souhaitez inviter';

    document.getElementById('invite_form').reset();
    inviteCurrentStep = 1;
}

// ============================================================
// MISE À JOUR DES ÉTAPES
// ============================================================
function inviteUpdateSteps() {
    // Cercles
    for (var i = 1; i <= 3; i++) {
        var circle = document.getElementById('step-circle-' + i);
        if (i < inviteCurrentStep) {
            circle.className = 'step-circle completed';
            circle.textContent = '✓';
        } else if (i === inviteCurrentStep) {
            circle.className = 'step-circle active';
            circle.textContent = i;
        } else {
            circle.className = 'step-circle inactive';
            circle.textContent = i;
        }
    }

    // Lignes
    var line1 = document.getElementById('line1');
    var line2 = document.getElementById('line2');
    line1.className = inviteCurrentStep > 1 ? 'step-line active' : 'step-line';
    line2.className = inviteCurrentStep > 2 ? 'step-line active' : 'step-line';

    // Contenus des étapes
    var s1 = document.getElementById('step1-content');
    var s2 = document.getElementById('step2-content');
    var s3 = document.getElementById('step3-content');

    if (inviteCurrentStep === 1) {
        s1.classList.remove('d-none');
        s2.classList.add('d-none');
        s3.classList.add('d-none');
    } else if (inviteCurrentStep === 2) {
        s1.classList.add('d-none');
        s2.classList.remove('d-none');
        s3.classList.add('d-none');

        // Afficher le bon panneau étape 2
        if (inviteSelectedType === 'agency') {
            inviteShow('agency-step2');
            inviteHide('coowner-step2');
        } else {
            inviteShow('coowner-step2');
            inviteHide('agency-step2');
        }
    } else {
        s1.classList.add('d-none');
        s2.classList.add('d-none');
        s3.classList.remove('d-none');
        inviteUpdateConfirmation();
    }

    // Boutons
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var submitBtn = document.getElementById('submitBtn');

    if (inviteCurrentStep === 1) {
        prevBtn.classList.add('d-none');
        nextBtn.classList.remove('d-none');
        submitBtn.classList.add('d-none');
    } else if (inviteCurrentStep === 2) {
        prevBtn.classList.remove('d-none');
        nextBtn.classList.remove('d-none');
        submitBtn.classList.add('d-none');
    } else {
        prevBtn.classList.remove('d-none');
        nextBtn.classList.add('d-none');
        submitBtn.classList.remove('d-none');
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function inviteNextStep() {
    if (inviteCurrentStep === 1) {
        var firstName = document.getElementById('first_name').value.trim();
        var lastName  = document.getElementById('last_name').value.trim();
        var email     = document.getElementById('email').value.trim();

        if (!firstName || !lastName || !email) {
            alert('Veuillez remplir tous les champs obligatoires (Prénom, Nom, Email)');
            return;
        }

        inviteFormData.first_name = firstName;
        inviteFormData.last_name  = lastName;
        inviteFormData.email      = email;
        inviteFormData.phone      = document.getElementById('phone').value.trim();

        inviteCurrentStep = 2;

    } else if (inviteCurrentStep === 2) {
        if (inviteSelectedType === 'agency') {
            var ifu  = document.getElementById('ifu').value.trim();
            var rccm = document.getElementById('rccm').value.trim();

            if (!ifu || !rccm) {
                alert("L'IFU et le RCCM sont obligatoires pour une agence");
                return;
            }

            inviteFormData.company_name    = document.getElementById('company_name').value.trim();
            inviteFormData.ifu             = ifu;
            inviteFormData.rccm            = rccm;
            inviteFormData.vat_number      = document.getElementById('vat_number').value.trim();
            inviteFormData.address_billing = document.getElementById('address_billing').value.trim();
        }
        inviteCurrentStep = 3;
    }

    inviteUpdateSteps();
}

function invitePrevStep() {
    if (inviteCurrentStep > 1) {
        inviteCurrentStep--;
        inviteUpdateSteps();
    }
}

// ============================================================
// MISE À JOUR DE LA CONFIRMATION
// ============================================================
function inviteUpdateConfirmation() {
    var box     = document.getElementById('confirmation-content');
    var emailEl = document.getElementById('confirm-email');
    var msgEl   = document.getElementById('confirm-message');

    emailEl.textContent = inviteFormData.email;

    var phoneHtml = inviteFormData.phone
        ? '<div class="confirm-item"><div class="label">Téléphone</div><div class="value">' + escHtml(inviteFormData.phone) + '</div></div>'
        : '';

    if (inviteSelectedType === 'agency') {
        box.className = 'confirm-box agency-confirm';
        msgEl.textContent = "L'agence pourra créer son compte et commencer à gérer vos biens.";

        var agencyExtra = '';
        if (inviteFormData.company_name || inviteFormData.ifu || inviteFormData.rccm) {
            agencyExtra = '<div style="border-top:1px solid #e9d5ff; margin-top:1rem; padding-top:1rem;">'
                + '<div style="font-weight:600; margin-bottom:0.5rem; color:#4b5563;">Informations de l\'agence :</div>'
                + '<div class="confirm-row">'
                + (inviteFormData.company_name ? '<div class="confirm-item"><div class="label">Agence</div><div class="value">' + escHtml(inviteFormData.company_name) + '</div></div>' : '')
                + (inviteFormData.ifu  ? '<div class="confirm-item"><div class="label">IFU</div><div class="value">'  + escHtml(inviteFormData.ifu)  + '</div></div>' : '')
                + (inviteFormData.rccm ? '<div class="confirm-item"><div class="label">RCCM</div><div class="value">' + escHtml(inviteFormData.rccm) + '</div></div>' : '')
                + '</div></div>';
        }

        box.innerHTML = '<div style="font-weight:600; color:#7c3aed; margin-bottom:0.75rem;">Agence à inviter :</div>'
            + '<div class="confirm-row">'
            + '<div class="confirm-item"><div class="label">Nom complet</div><div class="value">' + escHtml(inviteFormData.first_name) + ' ' + escHtml(inviteFormData.last_name) + '</div></div>'
            + '<div class="confirm-item"><div class="label">Email</div><div class="value">' + escHtml(inviteFormData.email) + '</div></div>'
            + phoneHtml
            + '<div class="confirm-item"><div class="label">Type</div><div class="value">Agence Immobilière</div></div>'
            + '</div>'
            + agencyExtra;
    } else {
        box.className = 'confirm-box coowner-confirm';
        msgEl.textContent = 'Le co-propriétaire pourra créer son compte et commencer à gérer vos biens.';

        box.innerHTML = '<div style="font-weight:600; color:#1d4ed8; margin-bottom:0.75rem;">Co-propriétaire à inviter :</div>'
            + '<div class="confirm-row">'
            + '<div class="confirm-item"><div class="label">Nom complet</div><div class="value">' + escHtml(inviteFormData.first_name) + ' ' + escHtml(inviteFormData.last_name) + '</div></div>'
            + '<div class="confirm-item"><div class="label">Email</div><div class="value">' + escHtml(inviteFormData.email) + '</div></div>'
            + phoneHtml
            + '<div class="confirm-item"><div class="label">Type</div><div class="value">Co-propriétaire Particulier</div></div>'
            + '</div>';
    }
}

// Échappe le HTML pour éviter les XSS
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ============================================================
// INITIALISATION AU CHARGEMENT DU DOM
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

    // Boutons "Choisir" sur les cartes
    document.getElementById('btn-coowner').addEventListener('click', function () {
        inviteSelectType('co_owner');
    });

    document.getElementById('btn-agency').addEventListener('click', function () {
        inviteSelectType('agency');
    });

    // Bouton "Changer de type"
    document.getElementById('btn-reset').addEventListener('click', function () {
        inviteResetSelection();
    });

    // Boutons de navigation
    document.getElementById('nextBtn').addEventListener('click', function () {
        inviteNextStep();
    });

    document.getElementById('prevBtn').addEventListener('click', function () {
        invitePrevStep();
    });

    // Token depuis l'URL
    var urlParams = new URLSearchParams(window.location.search);
    var apiToken = urlParams.get('api_token');
    if (apiToken) {
        localStorage.setItem('token', apiToken);
    }
});
</script>
@endsection
