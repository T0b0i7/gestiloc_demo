@extends('layouts.co-owner')

@section('title', 'Nouveau contrat de location')

@section('content')
<div class="form-container">
    <div class="form-card">
        <!-- Header -->
        <div style="margin-bottom: 2rem; padding: 0 1.5rem;">
            <br><br>
            <a href="{{ route('co-owner.tenants.index') }}"
               class="btn-back"
               onclick="navigateTo('/coproprietaire/tenants'); return false;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Retour au tableau de bord</span>
            </a>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; padding: 0 1.5rem;">
            <div>
                <h1 style="font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; line-height: 1.2;">
                    Nouveau contrat de location
                </h1>
                <p style="color: #6B7280; font-size: 0.95rem; margin: 0;">
                    Créez un nouveau contrat entre un bien et un locataire
                </p>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
                <button type="button"
                        class="btn-cancel"
                        onclick="if(confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) { window.location.href='{{ route('co-owner.assign-property.create') }}'; }">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>Annuler</span>
                </button>
                <button type="submit"
                        form="lease-form"
                        class="btn-submit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Créer le contrat</span>
                </button>
            </div>
        </div>

        <style>
            /* Bouton Retour */
            .btn-back {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                background: #F9FAFB;
                border: 1.5px solid #E5E7EB;
                border-radius: 10px;
                color: #374151;
                font-size: 0.9rem;
                font-weight: 500;
                text-decoration: none;
                transition: all 0.2s ease;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .btn-back:hover {
                background: #FFFFFF;
                border-color: #D1D5DB;
                color: #111827;
                transform: translateX(-2px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
            }

            .btn-back svg {
                transition: transform 0.2s ease;
            }

            .btn-back:hover svg {
                transform: translateX(-2px);
            }

            /* Bouton Annuler */
            .btn-cancel {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: #FFFFFF;
                border: 1.5px solid #FCA5A5;
                border-radius: 10px;
                color: #DC2626;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
                position: relative;
                overflow: hidden;
            }

            .btn-cancel::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(220, 38, 38, 0.1);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }

            .btn-cancel:hover::before {
                width: 300px;
                height: 300px;
            }

            .btn-cancel:hover {
                background: #FEF2F2;
                border-color: #EF4444;
                color: #B91C1C;
                transform: translateY(-1px);
                box-shadow: 0 4px 6px rgba(220, 38, 38, 0.15);
            }

            .btn-cancel:active {
                transform: translateY(0);
                box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
            }

            .btn-cancel svg, .btn-cancel span {
                position: relative;
                z-index: 1;
            }

            /* Bouton Créer */
            .btn-submit {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 11px 24px;
                background: #70AE48;
                border: none;
                border-radius: 10px;
                color: #FFFFFF;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08);
                position: relative;
                overflow: hidden;
            }

            .btn-submit::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                transition: left 0.5s;
            }

            .btn-submit:hover::before {
                left: 100%;
            }

            .btn-submit:hover {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(16, 185, 129, 0.35), 0 3px 6px rgba(0, 0, 0, 0.1);
            }

            .btn-submit:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
            }

            .btn-submit svg {
                transition: transform 0.3s ease;
            }

            .btn-submit:hover svg {
                transform: scale(1.1);
            }

            .btn-submit svg, .btn-submit span {
                position: relative;
                z-index: 1;
            }

            /* Animation de chargement pour le bouton submit */
            .btn-submit.loading {
                pointer-events: none;
                opacity: 0.7;
            }

            .btn-submit.loading span {
                opacity: 0;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>

        <div class="form-body" style="padding: 0 1.5rem;">
            <!-- Messages de succès/erreur -->
            @if (session('success'))
                <div style="background: #D1FAE5; border: 1px solid #10B981; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: start; gap: 12px;">
                    <i data-lucide="check-circle" style="width: 20px; height: 20px; color: #10B981; flex-shrink: 0; margin-top: 2px;"></i>
                    <div>
                        <strong style="color: #065F46; font-weight: 600; display: block; margin-bottom: 4px;">Succès !</strong>
                        <p style="color: #047857; margin: 0; font-size: 0.9rem;">{{ session('success') }}</p>
                    </div>
                </div>
            @endif

            @if (session('error'))
                <div style="background: #FEE2E2; border: 1px solid #EF4444; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: start; gap: 12px;">
                    <i data-lucide="alert-circle" style="width: 20px; height: 20px; color: #EF4444; flex-shrink: 0; margin-top: 2px;"></i>
                    <div>
                        <strong style="color: #991B1B; font-weight: 600; display: block; margin-bottom: 4px;">Erreur</strong>
                        <p style="color: #B91C1C; margin: 0; font-size: 0.9rem;">{{ session('error') }}</p>
                    </div>
                </div>
            @endif

            @if ($errors->any())
                <div style="background: #FEE2E2; border: 1px solid #EF4444; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 8px;">
                        <i data-lucide="alert-circle" style="width: 20px; height: 20px; color: #EF4444; flex-shrink: 0; margin-top: 2px;"></i>
                        <strong style="color: #991B1B; font-weight: 600;">Erreurs de validation</strong>
                    </div>
                    <ul style="margin: 0; padding-left: 32px; color: #B91C1C; font-size: 0.9rem;">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('co-owner.assign-property.store') }}" id="lease-form">
                @csrf

                <!-- Section: Informations de location -->
                <div style="background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.1rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="home" style="width: 20px; height: 20px; color: #10B981;"></i>
                        Informations de location
                    </h2>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <!-- Bien à louer -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Bien à louer
                            </label>
                            @if ($delegatedProperties->isEmpty())
                                <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 1rem; text-align: center;">
                                    <i data-lucide="home" style="width: 48px; height: 48px; color: #D97706; margin: 0 auto 8px;"></i>
                                    <p style="color: #92400E; margin: 0; font-size: 0.9rem;">Aucun bien disponible</p>
                                </div>
                            @else
                                <select name="property_id" required
                                        style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem; color: #374151; background: white; cursor: pointer;"
                                        class="@error('property_id') border-red-500 @enderror">
                                    <option value="">Sélectionner un bien</option>
                                    @foreach ($delegatedProperties as $property)
                                        <option value="{{ $property->id }}" {{ old('property_id') == $property->id ? 'selected' : '' }}>
                                            {{ $property->name ?? 'Sans nom' }} - {{ $property->address ?? 'Sans adresse' }}
                                            @if ($property->city) - {{ $property->city }} @endif
                                        </option>
                                    @endforeach
                                </select>
                            @endif
                            @error('property_id')
                                <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Locataire -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Locataire
                            </label>
                            @if ($tenants->isEmpty())
                                <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 1rem; text-align: center;">
                                    <i data-lucide="users" style="width: 48px; height: 48px; color: #D97706; margin: 0 auto 8px;"></i>
                                    <p style="color: #92400E; margin: 0 0 8px 0; font-size: 0.9rem;">Aucun locataire disponible</p>
                                    <a href="{{ route('co-owner.tenants.create') }}"
                                       style="display: inline-block; padding: 6px 12px; background: #10B981; color: white; border-radius: 6px; text-decoration: none; font-size: 0.85rem;"
                                       onclick="navigateTo('/coproprietaire/tenants/create'); return false;">
                                        Créer un locataire
                                    </a>
                                </div>
                            @else
                                <select name="tenant_id" required
                                        style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem; color: #374151; background: white; cursor: pointer;"
                                        class="@error('tenant_id') border-red-500 @enderror">
                                    <option value="">Sélectionner un locataire</option>
                                    @foreach ($tenants as $tenant)
                                        <option value="{{ $tenant->id }}" {{ old('tenant_id') == $tenant->id ? 'selected' : '' }}>
                                            {{ $tenant->first_name }} {{ $tenant->last_name }}
                                            @if ($tenant->user && $tenant->user->email) ({{ $tenant->user->email }}) @endif
                                        </option>
                                    @endforeach
                                </select>
                            @endif
                            @error('tenant_id')
                                <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <!-- Type de bail -->
                <!-- Type de bail -->
<div>
    <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
        Type de bail
    </label>
    <div style="display: flex; gap: 1rem;">
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="radio" name="lease_type" value="nu"
                   {{ old('lease_type', 'nu') == 'nu' ? 'checked' : '' }}
                   style="width: 16px; height: 16px; accent-color: #10B981;">
            <span style="font-size: 0.9rem; color: #374151;">Bail nu</span>
        </label>
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="radio" name="lease_type" value="meuble"
                   {{ old('lease_type') == 'meuble' ? 'checked' : '' }}
                   style="width: 16px; height: 16px; accent-color: #10B981;">
            <span style="font-size: 0.9rem; color: #374151;">Bail meublé</span>
        </label>
    </div>
</div>

                        <!-- Statut du bail -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Statut du bail
                            </label>
                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <input type="radio" name="lease_status" value="active"
                                           {{ old('lease_status', 'active') == 'active' ? 'checked' : '' }}
                                           style="width: 16px; height: 16px; accent-color: #10B981;">
                                    <span style="font-size: 0.9rem; color: #374151;">Actif</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <input type="radio" name="lease_status" value="pending_signature"
                                           {{ old('lease_status') == 'pending_signature' ? 'checked' : '' }}
                                           style="width: 16px; height: 16px; accent-color: #F59E0B;">
                                    <span style="font-size: 0.9rem; color: #374151;">En attente</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <input type="radio" name="lease_status" value="draft"
                                           {{ old('lease_status') == 'draft' ? 'checked' : '' }}
                                           style="width: 16px; height: 16px; accent-color: #6B7280;">
                                    <span style="font-size: 0.9rem; color: #374151;">Résilié</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <input type="radio" name="lease_status" value="terminated"
                                           {{ old('lease_status') == 'terminated' ? 'checked' : '' }}
                                           style="width: 16px; height: 16px; accent-color: #EF4444;">
                                    <span style="font-size: 0.9rem; color: #374151;">Expiré</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
                        <!-- Loyer mensuel -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Loyer mensuel (FCFA)
                            </label>
                            <input type="number" name="rent_amount" required min="1" step="0.01"
                                   value="{{ old('rent_amount') }}" placeholder="40.000"
                                   style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem;"
                                   class="@error('rent_amount') border-red-500 @enderror">
                            @error('rent_amount')
                                <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                            @enderror
                        </div>

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

                        <!-- Dépôt de garantie -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Dépôt de garantie (FCFA)
                            </label>
                            <input type="number" name="guarantee_amount" min="0" step="0.01"
                                   value="{{ old('guarantee_amount') }}" placeholder="20.000"
                                   style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem;"
                                   class="@error('guarantee_amount') border-red-500 @enderror">
                            @error('guarantee_amount')
                                <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Durée du bail -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Durée du bail
                            </label>
                            <input type="text" name="duration"
                                   value="{{ old('duration') }}" placeholder="Ex: 2 ans"
                                   style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem;"
                                   class="@error('duration') border-red-500 @enderror">
                            <p style="color: #6B7280; font-size: 0.75rem; margin-top: 4px;">
                                <i data-lucide="refresh-cw" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i>
                                Renouvellement par tacite: cochez la case
                            </p>
                            @error('duration')
                                <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Date de paiement -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Date de paiement
                            </label>
                            <select name="billing_day" required
                                    style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer;"
                                    class="@error('billing_day') border-red-500 @enderror">
                                <option value="">Sélectionner</option>
                                @for ($i = 1; $i <= 28; $i++)
                                    <option value="{{ $i }}" {{ old('billing_day', 1) == $i ? 'selected' : '' }}>{{ $i }}</option>
                                @endfor
                            </select>
                            @error('billing_day')
                                <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Périodicité -->
                        <div>
                            <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Périodicité
                            </label>
                            <select name="payment_frequency" required
                                    style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer;"
                                    class="@error('payment_frequency') border-red-500 @enderror">
                                <option value="monthly" {{ old('payment_frequency', 'monthly') == 'monthly' ? 'selected' : '' }}>Mensuel</option>
                                <option value="quarterly" {{ old('payment_frequency') == 'quarterly' ? 'selected' : '' }}>Trimestriel</option>
                                <option value="annually" {{ old('payment_frequency') == 'annually' ? 'selected' : '' }}>Annuel</option>
                            </select>
                            @error('payment_frequency')
                                <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Mode de paiement (pleine largeur) -->
                    <div style="margin-top: 1.5rem;">
                        <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            Mode de paiement
                        </label>
                        <select name="payment_mode"
                                style="width: 100%; padding: 0.65rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer;"
                                class="@error('payment_mode') border-red-500 @enderror">
                            <option value="Espèce" {{ old('payment_mode', 'Espèce') == 'Espèce' ? 'selected' : '' }}>Espèce</option>
                            <option value="Virement" {{ old('payment_mode') == 'Virement' ? 'selected' : '' }}>Virement</option>
                            <option value="Chèque" {{ old('payment_mode') == 'Chèque' ? 'selected' : '' }}>Chèque</option>
                            <option value="Mobile Money" {{ old('payment_mode') == 'Mobile Money' ? 'selected' : '' }}>Mobile Money</option>
                        </select>
                        @error('payment_mode')
                            <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Détails / conditions particulières -->
                    <div style="margin-top: 1.5rem;">
                        <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            Détails / conditions particulières
                        </label>
                        <textarea name="special_conditions" rows="4"
                                  placeholder="Ex: Charges comprises, interdictions de fumer etc."
                                  style="width: 100%; padding: 0.75rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.9rem; resize: vertical; font-family: inherit;"
                                  class="@error('special_conditions') border-red-500 @enderror">{{ old('special_conditions') }}</textarea>
                        <p style="color: #6B7280; font-size: 0.75rem; margin-top: 4px;">
                            Ces informations seront envoyées dans le champ terme du bail
                        </p>
                        @error('special_conditions')
                            <p style="color: #EF4444; font-size: 0.8rem; margin-top: 4px;">{{ $message }}</p>
                        @enderror


            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
            let fullUrl = baseUrl + path;

                    </button>

                    <button type="submit"
                            class="btn-submit-bottom">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Créer le contrat</span>
                    </button>

                </div>
                    </div>
                </div>




            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        document.getElementById('overlay').addEventListener('click', toggleSidebar);

        // Logout
        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
            }
        }

        // Au chargement
        function checkMobile() {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (window.innerWidth <= 768) {
                mobileBtn.style.display = 'block';
            } else {
                mobileBtn.style.display = 'none';
            }
        }

        window.addEventListener('resize', checkMobile);
        checkMobile();

        // Ajouter le token à la page actuelle si présent dans l'URL
        const urlToken = getUrlParam('api_token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
        }

        // Calcul automatique du dépôt (1 mois de loyer)
        document.addEventListener('DOMContentLoaded', function() {
            const rentInput = document.querySelector('input[name="rent_amount"]');
            const depositInput = document.querySelector('input[name="deposit_amount"]');

            if (rentInput && depositInput) {
                rentInput.addEventListener('change', function() {
                    if (this.value && !depositInput.value) {
                        depositInput.value = this.value;
                    }

                    .btn-cancel-bottom::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 0;
                        height: 0;
                        border-radius: 50%;
                        background: rgba(220, 38, 38, 0.1);
                        transform: translate(-50%, -50%);
                        transition: width 0.6s, height 0.6s;
                    }

                    .btn-cancel-bottom:hover::before {
                        width: 300px;
                        height: 300px;
                    }

                    .btn-cancel-bottom:hover {
                        background: #FEF2F2;
                        border-color: #EF4444;
                        color: #B91C1C;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 6px rgba(220, 38, 38, 0.15);
                    }

                    .btn-cancel-bottom:active {
                        transform: translateY(0);
                        box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
                    }

                    .btn-cancel-bottom svg, .btn-cancel-bottom span {
                        position: relative;
                        z-index: 1;
                    }

                    .btn-submit-bottom {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 11px 28px;
                        background: #70AE48;
                        border: none;
                        border-radius: 10px;
                        color: #FFFFFF;
                        font-size: 0.95rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08);
                        position: relative;
                        overflow: hidden;
                    }

                    .btn-submit-bottom::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                        transition: left 0.5s;
                    }

                    .btn-submit-bottom:hover::before {
                        left: 100%;
                    }

                    .btn-submit-bottom:hover {
                        background: linear-gradient(135deg, #059669 0%, #047857 100%);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(16, 185, 129, 0.35), 0 3px 6px rgba(0, 0, 0, 0.1);
                    }

                    .btn-submit-bottom:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
                    }

                    .btn-submit-bottom svg {
                        transition: transform 0.3s ease;
                    }

                    .btn-submit-bottom:hover svg {
                        transform: scale(1.1);
                    }

                    .btn-submit-bottom svg, .btn-submit-bottom span {
                        position: relative;
                        z-index: 1;
                    }
                </style>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Auto-remplir le dépôt de garantie avec le loyer
    const rentInput = document.querySelector('input[name="rent_amount"]');
    const guaranteeInput = document.querySelector('input[name="guarantee_amount"]');

    if (rentInput && guaranteeInput) {
        rentInput.addEventListener('change', function() {
            if (this.value && !guaranteeInput.value) {
                guaranteeInput.value = this.value;
            }
        });
    }

    // Effet de chargement sur les boutons submit
    const form = document.getElementById('lease-form');
    const submitButtons = document.querySelectorAll('.btn-submit, .btn-submit-bottom');

    if (form) {
        form.addEventListener('submit', function(e) {
            // Vérifier que le formulaire est valide
            if (form.checkValidity()) {
                submitButtons.forEach(btn => {
                    btn.classList.add('loading');
                    btn.disabled = true;

                    // Remplacer le contenu par un spinner
                    const originalContent = btn.innerHTML;
                    btn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
                            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
                        </svg>
                        <span style="opacity: 1;">Création en cours...</span>
                    `;

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'http://localhost:8080';
            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation React vers:', fullUrl);
            window.location.href = fullUrl;
        }

        // Navigation vers Laravel (8000)
        function navigateTo(path) {
            const token = localStorage.getItem('token') || getUrlParam('api_token');

            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
            let fullUrl = baseUrl + path;

            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

            console.log('Navigation Laravel vers:', fullUrl);
            window.location.href = fullUrl;
        }

        // Helper pour récupérer un paramètre d'URL
        function getUrlParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        // Gestion des sous-menus
        function toggleSubmenu(menuId) {
            const submenu = document.getElementById(menuId);
            const parent = document.querySelector(`[onclick="toggleSubmenu('${menuId}')"]`);

            if (submenu.style.display === 'none' || !submenu.style.display) {
                submenu.style.display = 'block';
                parent.classList.add('active');
            } else {
                submenu.style.display = 'none';
                parent.classList.remove('active');
            }
        }

        // Gestion de la sidebar mobile
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');

            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        // Logout
        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
            }
        }

        // Au chargement
        function checkMobile() {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (window.innerWidth <= 768) {
                mobileBtn.style.display = 'block';
            } else {
                mobileBtn.style.display = 'none';
            }
        }

        window.addEventListener('resize', checkMobile);
        checkMobile();

        // Ajouter le token à la page actuelle si présent dans l'URL
        const urlToken = getUrlParam('api_token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
        }

        // Marquer le menu actif en fonction de la page courante
        document.addEventListener('DOMContentLoaded', function() {
            const currentPath = window.location.pathname;

            // Définir quel sous-menu doit être ouvert par défaut
            const menuConfig = {
                '/coproprietaire/tenants': 'locative-menu',
                '/coproprietaire/tenants/create': 'locative-menu',
                '/coproprietaire/assign-property/create': 'locative-menu',
                '/coproprietaire/leases': 'locative-menu',
                '/coproprietaire/quittances': 'locative-menu',
                '/coproprietaire/notices': 'locative-menu',
                '/coproprietaire/maintenance': 'locative-menu',
                '/coproprietaire/biens': 'biens-menu',
                '/coproprietaire/delegations': 'biens-menu',
                '/coproprietaire/documents': 'documents-menu',
                '/coproprietaire/finances': 'documents-menu',
                '/coproprietaire/profile': 'profile-menu',
                '/coproprietaire/parametres': 'profile-menu',
                '/coproprietaire/audit': 'profile-menu',
                '/coproprietaire/mes-delegations': 'delegations-menu',
                '/coproprietaire/demandes-delegation': 'delegations-menu',
                '/coproprietaire/inviter-proprietaire': 'delegations-menu',
                '/coproprietaire/emettre-paiement': 'finances-menu',
                '/coproprietaire/retrait-methode': 'finances-menu',
                '/admin/statistiques': 'admin-menu',
                '/admin/logs': 'admin-menu'
            };

            // Ouvrir le sous-menu approprié
            for (const [path, menuId] of Object.entries(menuConfig)) {
                if (currentPath.includes(path)) {
                    setTimeout(() => toggleSubmenu(menuId), 100);
                    break;
                }
            }

            // Marquer l'élément actif
            document.querySelectorAll('.submenu-item').forEach(item => {
                const itemPath = item.getAttribute('onclick');
                if (itemPath && itemPath.includes(currentPath)) {
                    item.classList.add('active');
                }
            });
        });
    }

    // Focus sur le premier champ en erreur
    const firstError = document.querySelector('.border-red-500');
    if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Scroll vers le message de succès si présent
    const successMessage = document.querySelector('[style*="background: #D1FAE5"]');
    if (successMessage) {
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Animation d'apparition
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            successMessage.style.transition = 'all 0.4s ease';
            successMessage.style.opacity = '1';
            successMessage.style.transform = 'translateY(0)';
        }, 100);
    }
});
</script>
@endsection
