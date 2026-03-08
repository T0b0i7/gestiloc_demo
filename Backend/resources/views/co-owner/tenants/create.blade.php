@extends('layouts.co-owner')

@section('title', 'Créer un Locataire')

@section('content')
<div class="form-container">
    <div class="form-card">
        <div class="form-body">
            <div class="top-actions">
                <a href="{{ route('co-owner.tenants.index') }}" class="button button-secondary">
                    <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                    Retour à la liste
                </a>
                <div class="top-actions-right">
                    <button class="button button-danger" type="button" onclick="confirmCancel()">
                        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                        Annuler
                    </button>
                    <button class="button button-primary" type="submit" form="tenantForm">
                        <i data-lucide="save" style="width: 16px; height: 16px;"></i>
                        Enregistrer le locataire
                    </button>
                </div>
            </div>

            @if ($errors->any())
                <div style="margin-bottom: 1rem; background: rgba(255,241,242,.92); border: 1px solid rgba(244,63,94,.30); border-radius: 14px; padding: 12px 14px; color: #9f1239; font-weight: 950; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="alert-circle" style="width: 18px; height: 18px;"></i>
                    <span>Veuillez corriger les erreurs ci-dessous.</span>
                    @foreach ($errors->all() as $error)
                        <div class="field-error" style="margin-top: 8px;">
                            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                            <span>{{ $error }}</span>
                        </div>
                    @endforeach
                </div>
            @endif

            @if (session('success'))
                <div style="margin-bottom: 1rem; background: rgba(112, 174, 72, 0.1); border: 1px solid rgba(112, 174, 72, 0.3); border-radius: 14px; padding: 12px 14px; color: #2e5e1e; font-weight: 950; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>
                    <span>{{ session('success') }}</span>
                </div>
            @endif

            <div class="tab-nav">
                <button type="button" class="tab-button active" onclick="showTab('infos')">
                    Informations personnelles
                </button>
                <button type="button" class="tab-button" onclick="showTab('contact')">
                    Coordonnées
                </button>
                <button type="button" class="tab-button" onclick="showTab('pro')">
                    Situation professionnelle
                </button>
                <button type="button" class="tab-button" onclick="showTab('garant')">
                    Garant
                </button>
                <button type="button" class="tab-button" onclick="showTab('documents')">
                    Documents
                </button>
            </div>

            <form id="tenantForm" method="POST" action="{{ route('co-owner.tenants.store') }}" enctype="multipart/form-data">
                @csrf

                <!-- Tab 1: Informations personnelles -->
                <div id="tab-infos" class="section">
                    <h2 class="section-title">
                        <i data-lucide="user" style="width: 20px; height: 20px;"></i>
                        Informations personnelles
                    </h2>

                    <div class="form-grid form-grid-2">
                        <!-- Type de locataire -->
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label class="form-label">
                                Type de locataire <span class="required">*</span>
                            </label>
                            <select class="form-select @error('tenant_type') input-error @enderror" name="tenant_type" required>
                                <option value="">Sélectionner le type</option>
                                <option value="particulier" {{ old('tenant_type') == 'particulier' ? 'selected' : '' }}>Particulier</option>
                                <option value="etudiant" {{ old('tenant_type') == 'etudiant' ? 'selected' : '' }}>Étudiant</option>
                                <option value="salarie" {{ old('tenant_type') == 'salarie' ? 'selected' : '' }}>Salarié</option>
                                <option value="independant" {{ old('tenant_type') == 'independant' ? 'selected' : '' }}>Indépendant</option>
                                <option value="retraite" {{ old('tenant_type') == 'retraite' ? 'selected' : '' }}>Retraité</option>
                                <option value="entreprise" {{ old('tenant_type') == 'entreprise' ? 'selected' : '' }}>Entreprise</option>
                                <option value="association" {{ old('tenant_type') == 'association' ? 'selected' : '' }}>Association</option>
                            </select>
                            @error('tenant_type')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Prénom <span class="required">*</span>
                            </label>
                            <input class="form-input @error('first_name') input-error @enderror"
                                   type="text"
                                   name="first_name"
                                   value="{{ old('first_name') }}"
                                   placeholder="Jean"
                                   required>
                            @error('first_name')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Nom <span class="required">*</span>
                            </label>
                            <input class="form-input @error('last_name') input-error @enderror"
                                   type="text"
                                   name="last_name"
                                   value="{{ old('last_name') }}"
                                   placeholder="Dupont"
                                   required>
                            @error('last_name')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Date de naissance <span class="required">*</span>
                            </label>
                            <div class="form-input-icon">
                                <div class="icon-wrapper">
                                    <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                </div>
                                <input class="form-input @error('birth_date') input-error @enderror"
                                       type="date"
                                       name="birth_date"
                                       value="{{ old('birth_date') }}"
                                       required>
                            </div>
                            @error('birth_date')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Lieu de naissance <span class="required">*</span>
                            </label>
                            <input class="form-input @error('birth_place') input-error @enderror"
                                   type="text"
                                   name="birth_place"
                                   value="{{ old('birth_place') }}"
                                   placeholder="Ville, Pays"
                                   required>
                            @error('birth_place')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Situation familiale</label>
                            <select class="form-select" name="marital_status">
                                <option value="single" {{ old('marital_status') == 'single' ? 'selected' : '' }}>Célibataire</option>
                                <option value="married" {{ old('marital_status') == 'married' ? 'selected' : '' }}>Marié(e)</option>
                                <option value="divorced" {{ old('marital_status') == 'divorced' ? 'selected' : '' }}>Divorcé(e)</option>
                                <option value="widowed" {{ old('marital_status') == 'widowed' ? 'selected' : '' }}>Veuf/Veuve</option>
                                <option value="pacs" {{ old('marital_status') == 'pacs' ? 'selected' : '' }}>PACS</option>
                                <option value="concubinage" {{ old('marital_status') == 'concubinage' ? 'selected' : '' }}>Concubinage</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem;">
                        <h3 class="form-label" style="margin-bottom: 0.75rem;">
                            Contact d'urgence
                        </h3>
                        <div class="form-grid form-grid-3">
                            <div class="form-group">
                                <label class="form-label">Nom et prénom</label>
                                <input class="form-input"
                                       type="text"
                                       name="emergency_contact_name"
                                       value="{{ old('emergency_contact_name') }}"
                                       placeholder="Nom et prénom">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Téléphone</label>
                                <div class="form-input-icon">
                                    <div class="icon-wrapper">
                                        <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                                    </div>
                                    <input class="form-input"
                                           type="tel"
                                           name="emergency_contact_phone"
                                           value="{{ old('emergency_contact_phone') }}"
                                           placeholder="06 12 34 56 78">
                                </div>
                            </div>

                            <!-- Email contact d'urgence -->
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <div class="form-input-icon">
                                    <div class="icon-wrapper">
                                        <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                                    </div>
                                    <input class="form-input"
                                           type="email"
                                           name="emergency_contact_email"
                                           value="{{ old('emergency_contact_email') }}"
                                           placeholder="email@exemple.com">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem;">
                        <label class="form-label">Notes et commentaires</label>
                        <textarea class="form-textarea"
                                  name="notes"
                                  placeholder="Informations complémentaires sur le locataire..."
                                  rows="3">{{ old('notes') }}</textarea>
                    </div>

                    <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                        <button type="button" class="button button-primary" onclick="validateAndGo('infos', 'contact')">
                            Suivant : Coordonnées
                            <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Tab 2: Coordonnées -->
                <div id="tab-contact" class="section" style="display: none;">
                    <h2 class="section-title">
                        <i data-lucide="mail" style="width: 20px; height: 20px;"></i>
                        Coordonnées
                    </h2>

                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label class="form-label">
                                Email <span class="required">*</span>
                            </label>
                            <div class="form-input-icon">
                                <div class="icon-wrapper">
                                    <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                                </div>
                                <input class="form-input @error('email') input-error @enderror"
                                       type="email"
                                       name="email"
                                       value="{{ old('email') }}"
                                       placeholder="jean.dupont@exemple.com"
                                       required>
                            </div>
                            @error('email')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Téléphone <span class="required">*</span>
                            </label>
                            <div class="form-input-icon">
                                <div class="icon-wrapper">
                                    <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                                </div>
                                <input class="form-input @error('phone') input-error @enderror"
                                       type="tel"
                                       name="phone"
                                       value="{{ old('phone') }}"
                                       placeholder="06 12 34 56 78"
                                       required>
                            </div>
                            @error('phone')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Adresse <span class="required">*</span>
                            </label>
                            <div class="form-input-icon">
                                <div class="icon-wrapper">
                                    <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
                                </div>
                                <input class="form-input @error('address') input-error @enderror"
                                       type="text"
                                       name="address"
                                       value="{{ old('address') }}"
                                       placeholder="123 Rue de la Paix"
                                       required>
                            </div>
                            @error('address')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Code postal <span class="required">*</span>
                            </label>
                            <input class="form-input @error('zip_code') input-error @enderror"
                                   type="text"
                                   name="zip_code"
                                   value="{{ old('zip_code') }}"
                                   placeholder="75000"
                                   required>
                            @error('zip_code')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Ville <span class="required">*</span>
                            </label>
                            <input class="form-input @error('city') input-error @enderror"
                                   type="text"
                                   name="city"
                                   value="{{ old('city') }}"
                                   placeholder="Paris"
                                   required>
                            @error('city')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Pays <span class="required">*</span>
                            </label>
                            <input class="form-input @error('country') input-error @enderror"
                                   type="text"
                                   name="country"
                                   value="{{ old('country', 'France') }}"
                                   placeholder="France"
                                   required>
                            @error('country')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>
                    </div>

                    <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                        <button type="button" class="button button-secondary" onclick="showTab('infos')">
                            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                            Précédent
                        </button>
                        <button type="button" class="button button-primary" onclick="validateAndGo('contact', 'pro')">
                            Suivant : Situation professionnelle
                            <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Tab 3: Situation professionnelle -->
                <div id="tab-pro" class="section" style="display: none;">
                    <h2 class="section-title">
                        <i data-lucide="briefcase" style="width: 20px; height: 20px;"></i>
                        Situation professionnelle
                    </h2>

                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label class="form-label">
                                Profession <span class="required">*</span>
                            </label>
                            <input class="form-input @error('profession') input-error @enderror"
                                   type="text"
                                   name="profession"
                                   value="{{ old('profession') }}"
                                   placeholder="Ex: Développeur web"
                                   required>
                            @error('profession')
                                <div class="field-error">
                                    <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                    <span>{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Employeur</label>
                            <input class="form-input"
                                   type="text"
                                   name="employer"
                                   value="{{ old('employer') }}"
                                   placeholder="Nom de l'entreprise">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Revenu annuel (FCFA)</label>
                            <div class="form-input-icon">
                                <div class="icon-wrapper">
                                    <i data-lucide="fcfa" style="width: 16px; height: 16px;"></i>
                                </div>
                                <input class="form-input"
                                       type="number"
                                       name="annual_income"
                                       value="{{ old('annual_income') }}"
                                       placeholder="45000"
                                       min="0"
                                       step="0.01">
                            </div>
                            <p class="helper-text">Optionnel</p>
                        </div>

                        <!-- Revenu mensuel -->
                        <div class="form-group">
                            <label class="form-label">Revenu mensuel (FCFA)</label>
                            <div class="form-input-icon">
                                <div class="icon-wrapper">
                                    <i data-lucide="fcfa" style="width: 16px; height: 16px;"></i>
                                </div>
                                <input class="form-input"
                                       type="number"
                                       name="monthly_income"
                                       value="{{ old('monthly_income') }}"
                                       placeholder="3750"
                                       min="0"
                                       step="0.01">
                            </div>
                            <p class="helper-text">Optionnel</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Type de contrat</label>
                            <select class="form-select" name="contract_type">
                                <option value="">Sélectionner un type de contrat</option>
                                <option value="cdi" {{ old('contract_type') == 'cdi' ? 'selected' : '' }}>CDI</option>
                                <option value="cdd" {{ old('contract_type') == 'cdd' ? 'selected' : '' }}>CDD</option>
                                <option value="interim" {{ old('contract_type') == 'interim' ? 'selected' : '' }}>Intérim</option>
                                <option value="independant" {{ old('contract_type') == 'independant' ? 'selected' : '' }}>Indépendant</option>
                                <option value="etudiant" {{ old('contract_type') == 'etudiant' ? 'selected' : '' }}>Étudiant</option>
                                <option value="retraite" {{ old('contract_type') == 'retraite' ? 'selected' : '' }}>Retraité</option>
                                <option value="autre" {{ old('contract_type') == 'autre' ? 'selected' : '' }}>Autre</option>
                            </select>
                        </div>
                    </div>

                    <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                        <button type="button" class="button button-secondary" onclick="showTab('contact')">
                            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                            Précédent
                        </button>
                        <button type="button" class="button button-primary" onclick="validateAndGo('pro', 'garant')">
                            Suivant : Garant
                            <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Tab 4: Garant -->
                <div id="tab-garant" class="section" style="display: none;">
                    <h2 class="section-title">
                        <i data-lucide="user-check" style="width: 20px; height: 20px;"></i>
                        Garant
                    </h2>

                    <div class="switch-item" style="margin-bottom: 1.5rem;">
                        <div class="switch" id="hasGuarantorSwitch" onclick="toggleGuarantor()">
                            <div class="switch-thumb"></div>
                        </div>
                        <span class="switch-label">Le locataire a-t-il un garant ?</span>
                    </div>

                    <div id="guarantorFields" style="display: none;">
                        <div style="background: rgba(112, 174, 72, 0.08); padding: 1.5rem; border-radius: 14px; border: 1px solid rgba(112, 174, 72, 0.18); margin-bottom: 1.5rem;">
                            <h3 class="form-label" style="margin-bottom: 1rem;">
                                Informations du garant
                            </h3>

                            <div class="form-grid form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        Nom et prénom <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <input class="form-input guarantor-input"
                                           type="text"
                                           name="guarantor_name"
                                           value="{{ old('guarantor_name') }}"
                                           placeholder="Nom et prénom du garant">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Téléphone <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input class="form-input guarantor-input"
                                               type="tel"
                                               name="guarantor_phone"
                                               value="{{ old('guarantor_phone') }}"
                                               placeholder="06 12 34 56 78">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Email <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="mail" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input class="form-input guarantor-input"
                                               type="email"
                                               name="guarantor_email"
                                               value="{{ old('guarantor_email') }}"
                                               placeholder="garant@exemple.com">
                                    </div>
                                </div>

                                <!-- Date de naissance garant -->
                                <div class="form-group">
                                    <label class="form-label">
                                        Date de naissance <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input class="form-input guarantor-input"
                                               type="date"
                                               name="guarantor_birth_date"
                                               value="{{ old('guarantor_birth_date') }}">
                                    </div>
                                </div>

                                <!-- Lieu de naissance garant -->
                                <div class="form-group">
                                    <label class="form-label">
                                        Lieu de naissance <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <input class="form-input guarantor-input"
                                           type="text"
                                           name="guarantor_birth_place"
                                           value="{{ old('guarantor_birth_place') }}"
                                           placeholder="Ville, Pays">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Profession <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <input class="form-input guarantor-input"
                                           type="text"
                                           name="guarantor_profession"
                                           value="{{ old('guarantor_profession') }}"
                                           placeholder="Profession du garant">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Revenu annuel (FCFA) <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="fcfa" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input class="form-input guarantor-input"
                                               type="number"
                                               name="guarantor_income"
                                               value="{{ old('guarantor_income') }}"
                                               placeholder="60000"
                                               min="0"
                                               step="0.01">
                                    </div>
                                </div>

                                <!-- Revenu mensuel garant -->
                                <div class="form-group">
                                    <label class="form-label">
                                        Revenu mensuel (FCFA) <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <div class="form-input-icon">
                                        <div class="icon-wrapper">
                                            <i data-lucide="fcfa" style="width: 16px; height: 16px;"></i>
                                        </div>
                                        <input class="form-input guarantor-input"
                                               type="number"
                                               name="guarantor_monthly_income"
                                               value="{{ old('guarantor_monthly_income') }}"
                                               placeholder="5000"
                                               min="0"
                                               step="0.01">
                                    </div>
                                </div>

                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label class="form-label">
                                        Adresse <span class="required guarantor-required" style="display:none;">*</span>
                                    </label>
                                    <input class="form-input guarantor-input"
                                           type="text"
                                           name="guarantor_address"
                                           value="{{ old('guarantor_address') }}"
                                           placeholder="Adresse complète du garant">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                        <button type="button" class="button button-secondary" onclick="showTab('pro')">
                            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                            Précédent
                        </button>
                        <button type="button" class="button button-primary" onclick="showTab('documents')">
                            Suivant : Documents
                            <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Tab 5: Documents -->
                <div id="tab-documents" class="section" style="display: none;">
                    <h2 class="section-title">
                        <i data-lucide="file-text" style="width: 20px; height: 20px;"></i>
                        Documents
                    </h2>

                    <div class="form-grid form-grid-2">
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label class="form-label">
                                Type de pièce d'identité
                            </label>
                            <select class="form-select" name="document_type" id="documentType" onchange="toggleDocumentUpload()">
                                <option value="">Sélectionner un type de document</option>
                                <option value="cni" {{ old('document_type') == 'cni' ? 'selected' : '' }}>Carte Nationale d'Identité (CNI)</option>
                                <option value="passeport" {{ old('document_type') == 'passeport' ? 'selected' : '' }}>Passeport</option>
                                <option value="titre_sejour" {{ old('document_type') == 'titre_sejour' ? 'selected' : '' }}>Titre de séjour</option>
                                <option value="permis_conduire" {{ old('document_type') == 'permis_conduire' ? 'selected' : '' }}>Permis de conduire</option>
                                <option value="carte_electeur" {{ old('document_type') == 'carte_electeur' ? 'selected' : '' }}>Carte d'électeur</option>
                                <option value="carte_mutuelle" {{ old('document_type') == 'carte_mutuelle' ? 'selected' : '' }}>Carte de mutuelle</option>
                                <option value="autre" {{ old('document_type') == 'autre' ? 'selected' : '' }}>Autre</option>
                            </select>
                        </div>

                        <div class="form-group" id="documentUploadSection" style="grid-column: 1 / -1; display: none;">
                            <label class="form-label">
                                Télécharger le document
                            </label>
                            <div class="file-upload-wrapper">
                                <input type="file"
                                       name="document_file"
                                       id="documentFile"
                                       class="file-upload-input"
                                       accept=".jpg,.jpeg,.png,.pdf"
                                       onchange="previewDocument(this)">
                                <label for="documentFile" class="file-upload-label">
                                    <i data-lucide="upload-cloud" style="width: 24px; height: 24px;"></i>
                                    <span>Cliquez pour sélectionner un fichier</span>
                                    <small>Formats acceptés : JPG, PNG, PDF (max 5Mo)</small>
                                </label>
                                <div id="filePreview" class="file-preview" style="display: none;">
                                    <div class="file-preview-content">
                                        <i data-lucide="file" style="width: 20px; height: 20px;"></i>
                                        <span id="fileName"></span>
                                        <button type="button" class="file-remove" onclick="removeFile()">
                                            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                                        </button>
                                    </div>
                                </div>
                                @error('document_file')
                                    <div class="field-error" style="margin-top: 8px;">
                                        <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                                        <span>{{ $message }}</span>
                                    </div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="bottom-actions" style="border-top: none; padding-top: 1.5rem;">
                        <button type="button" class="button button-secondary" onclick="showTab('garant')">
                            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                            Précédent
                        </button>

                        <button type="button" class="button button-secondary" onclick="showTab('infos')">
                            <i data-lucide="home" style="width: 16px; height: 16px;"></i>
                            Retour au début
                        </button>

                        <button type="submit" class="button button-primary">
                            <i data-lucide="save" style="width: 16px; height: 16px;"></i>
                            Enregistrer le locataire
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
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

    .form-container {
        min-height: 100vh;
        background: #ffffff;
        padding: 2rem;
        position: relative;
    }

    .form-container::before {
        content: "";
        position: fixed;
        inset: 0;
        background:
            radial-gradient(900px 520px at 12% -8%, rgba(112, 174, 72, .16) 0%, rgba(112, 174, 72, 0) 62%),
            radial-gradient(900px 520px at 92% 8%, rgba(139, 195, 74, .14) 0%, rgba(139, 195, 74, 0) 64%),
            radial-gradient(700px 420px at 40% 110%, rgba(16,185,129,.10) 0%, rgba(16,185,129,0) 60%);
        pointer-events: none;
        z-index: -2;
    }

    .form-card {
        max-width: 1200px;
        margin: 0 auto;
        background: rgba(255,255,255,.92);
        border-radius: 22px;
        box-shadow: var(--shadow);
        overflow: hidden;
        border: 1px solid rgba(112, 174, 72, .18);
        position: relative;
        backdrop-filter: blur(10px);
    }

    .form-body {
        padding: 2.5rem;
        position: relative;
        z-index: 1;
    }

    .section {
        margin-bottom: 2.5rem;
        background: rgba(255,255,255,.72);
        padding: 2rem;
        border-radius: 16px;
        border: 1px solid rgba(17,24,39,.08);
        box-shadow: 0 10px 30px rgba(17,24,39,.06);
        backdrop-filter: blur(10px);
    }

    .section-title {
        font-size: 1.05rem;
        font-weight: 950;
        color: var(--ink);
        margin: 0 0 1.25rem 0;
        padding-bottom: 0.85rem;
        border-bottom: 2px solid rgba(112, 174, 72, .28);
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .form-grid {
        display: grid;
        gap: 1.25rem;
    }

    .form-grid-2 {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .form-grid-3 {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        font-size: 0.85rem;
        font-weight: 900;
        color: #334155;
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }

    .required {
        color: #e11d48;
    }

    .form-input, .form-select, .form-textarea {
        width: 100%;
        padding: 0.85rem 1rem;
        border: 2px solid rgba(148,163,184,.35);
        border-radius: 12px;
        font-size: 1rem;
        color: var(--ink);
        background: rgba(255,255,255,.92);
        transition: all 0.2s ease;
        font-family: inherit;
        font-weight: 700;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
        outline: none;
        border-color: #70AE48;
        box-shadow: 0 0 0 4px rgba(112, 174, 72, 0.14);
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
        box-shadow: 0 14px 30px rgba(112, 174, 72, .22);
    }

    .button-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 18px 34px rgba(112, 174, 72, .28);
    }

    .button-secondary {
        background: rgba(255,255,255,.92);
        color: #70AE48;
        border: 2px solid rgba(112, 174, 72, .20);
    }

    .button-secondary:hover {
        background: rgba(112, 174, 72, .06);
    }

    .button-danger {
        background: rgba(255,255,255,.92);
        color: #e11d48;
        border: 2px solid rgba(225,29,72,.18);
    }

    .button-danger:hover {
        background: rgba(225,29,72,.06);
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

    .bottom-actions {
        display: flex;
        justify-content: flex-end;
        gap: .75rem;
        padding-top: 1.5rem;
        border-top: 2px solid rgba(148,163,184,.35);
        flex-wrap: wrap;
    }

    .tab-nav {
        display: flex;
        gap: 1.2rem;
        border-bottom: 2px solid rgba(148,163,184,.35);
        margin-bottom: 2rem;
        overflow-x: auto;
        padding-bottom: .2rem;
    }

    .tab-button {
        padding: 0.95rem 0;
        border: none;
        background: transparent;
        font-size: .92rem;
        font-weight: 950;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        color: #64748b;
        white-space: nowrap;
        transition: color .15s ease, border-color .15s ease;
        display: flex;
        align-items: center;
        gap: .55rem;
    }

    .tab-button.active {
        color: #70AE48;
        border-color: #70AE48;
    }

    .field-error {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        color: #be123c;
        font-weight: 900;
        font-size: .8rem;
        line-height: 1.2;
        margin-top: 2px;
    }

    .input-error {
        border-color: rgba(225,29,72,.72) !important;
        box-shadow: 0 0 0 4px rgba(225,29,72,.10) !important;
    }

    /* Styles pour le switch garant */
    .switch-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .switch {
        width: 50px;
        height: 26px;
        background: rgba(148,163,184,.35);
        border-radius: 13px;
        position: relative;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .switch.active {
        background: #70AE48;
    }

    .switch-thumb {
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 3px;
        left: 3px;
        transition: transform 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .switch.active .switch-thumb {
        transform: translateX(24px);
    }

    .switch-label {
        font-weight: 850;
        color: var(--ink);
        cursor: pointer;
    }

    /* Styles pour les icônes dans les inputs */
    .form-input-icon {
        position: relative;
    }

    .form-input-icon .form-input {
        padding-left: 3rem;
    }

    .icon-wrapper {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--muted);
        z-index: 10;
    }

    .helper-text {
        color: var(--muted);
        font-size: 0.85rem;
        font-weight: 650;
        margin-top: 0.25rem;
    }

    /* Styles pour l'upload de fichier */
    .file-upload-wrapper {
        position: relative;
        width: 100%;
    }

    .file-upload-input {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
        z-index: 10;
    }

    .file-upload-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        border: 2px dashed rgba(148,163,184,.5);
        border-radius: 12px;
        background: rgba(255,255,255,.5);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        gap: 0.5rem;
        color: var(--muted);
    }

    .file-upload-label:hover {
        border-color: #70AE48;
        background: rgba(112, 174, 72, .05);
    }

    .file-upload-label i {
        color: #70AE48;
    }

    .file-upload-label span {
        font-weight: 700;
        color: var(--ink);
    }

    .file-upload-label small {
        font-size: 0.8rem;
    }

    .file-preview {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(112, 174, 72, 0.1);
        border: 1px solid rgba(112, 174, 72, 0.3);
        border-radius: 12px;
    }

    .file-preview-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #2e5e1e;
        font-weight: 700;
    }

    .file-remove {
        margin-left: auto;
        background: rgba(225,29,72,.1);
        border: none;
        color: #e11d48;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .file-remove:hover {
        background: rgba(225,29,72,.2);
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // Confirmation d'annulation
    function confirmCancel() {
        if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
            // Utilise la fonction navigateTo du layout
            if (typeof navigateTo !== 'undefined') {
                navigateTo('/coproprietaire/tenants');
            } else {
                window.location.href = "{{ route('co-owner.tenants.index') }}";
            }
        }
    }

    // Gestion des onglets
    function showTab(tabName) {
        ['infos', 'contact', 'pro', 'garant', 'documents'].forEach(tab => {
            const element = document.getElementById(`tab-${tab}`);
            if (element) element.style.display = 'none';
        });

        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeTab = document.getElementById(`tab-${tabName}`);
        if (activeTab) activeTab.style.display = 'block';

        const tabLabels = {
            'infos': 'Informations',
            'contact': 'Coordonnées',
            'pro': 'professionnelle',
            'garant': 'Garant',
            'documents': 'Documents'
        };

        const activeBtn = Array.from(document.querySelectorAll('.tab-button')).find(btn =>
            btn.textContent.includes(tabLabels[tabName])
        );
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Validation des onglets
    function validateAndGo(current, next) {
        let valid = true;
        const currentTab = document.getElementById(`tab-${current}`);

        const requiredInputs = currentTab.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                valid = false;
                input.classList.add('input-error');

                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('field-error')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'field-error';
                    errorDiv.innerHTML = `
                        <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
                        <span>Ce champ est requis.</span>
                    `;
                    input.parentNode.insertBefore(errorDiv, input.nextSibling);
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            } else {
                input.classList.remove('input-error');
                if (input.nextElementSibling && input.nextElementSibling.classList.contains('field-error')) {
                    input.nextElementSibling.remove();
                }
            }
        });

        if (valid) {
            showTab(next);
        } else {
            alert('Merci de compléter les champs requis.');
        }
    }

    // Gestion du garant
    function toggleGuarantor() {
        const switchEl = document.getElementById('hasGuarantorSwitch');
        const fields = document.getElementById('guarantorFields');
        const requiredStars = document.querySelectorAll('.guarantor-required');
        const guarantorInputs = document.querySelectorAll('.guarantor-input');

        switchEl.classList.toggle('active');
        const isActive = switchEl.classList.contains('active');

        fields.style.display = isActive ? 'block' : 'none';

        requiredStars.forEach(star => {
            star.style.display = isActive ? 'inline' : 'none';
        });

        guarantorInputs.forEach(input => {
            if (isActive) {
                input.setAttribute('required', 'required');
            } else {
                input.removeAttribute('required');
                input.value = '';
                input.classList.remove('input-error');
            }
        });
    }

    // Gestion des documents
    function toggleDocumentUpload() {
        const documentType = document.getElementById('documentType').value;
        const uploadSection = document.getElementById('documentUploadSection');

        if (documentType) {
            uploadSection.style.display = 'block';
            document.getElementById('documentFile').removeAttribute('required'); // Pas obligatoire
        } else {
            uploadSection.style.display = 'none';
            document.getElementById('documentFile').removeAttribute('required');
            removeFile();
        }
    }

    function previewDocument(input) {
        const preview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');

        if (input.files && input.files[0]) {
            fileName.textContent = input.files[0].name;
            preview.style.display = 'block';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    function removeFile() {
        const input = document.getElementById('documentFile');
        const preview = document.getElementById('filePreview');

        input.value = '';
        preview.style.display = 'none';
    }
</script>
@endsection
