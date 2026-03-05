@extends('layouts.co-owner')

@section('title', 'Créer une facture')

@section('content')
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .create-container {
        padding: 2rem;
        max-width: 700px;
        margin: 0 auto;
        background: #f8f9fa;
        min-height: 100vh;
    }

    .header-section {
        margin-bottom: 2rem;
        text-align: center;
    }

    .header-section h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
    }

    .header-section p {
        color: #757575;
        font-size: 0.9rem;
    }

    /* Progress Steps */
    .progress-steps {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .step {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .step-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        background: #e0e0e0;
        color: #9e9e9e;
        transition: all 0.3s;
    }

    .step-circle.active {
        background: #70AE48;
        color: white;
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .step-circle.completed {
        background: #4caf50;
        color: white;
    }

    .step-line {
        width: 60px;
        height: 2px;
        background: #e0e0e0;
        transition: all 0.3s;
    }

    .step-line.completed {
        background: #4caf50;
    }

    /* Form Card */
    .form-card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid #e8e8e8;
        padding: 2rem;
        min-height: 400px;
    }

    .step-content {
        display: none;
    }

    .step-content.active {
        display: block;
        animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .step-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .step-title svg {
        color: #70AE48;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .form-label .required {
        color: #f44336;
    }

    .form-label .hint {
        font-weight: 400;
        color: #9e9e9e;
        font-size: 0.8rem;
        margin-left: 0.5rem;
    }

    .form-select, .form-input {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
        font-size: 0.95rem;
        transition: all 0.2s;
        background: #fafafa;
        color: #424242;
        font-family: inherit;
    }

    .form-select:focus, .form-input:focus, textarea.form-input:focus {
        outline: none;
        border-color: #2196f3;
        background: white;
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    textarea.form-input {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .input-group {
        position: relative;
    }

    .input-prefix {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9e9e9e;
        font-size: 0.9rem;
        font-weight: 500;
        pointer-events: none;
    }

    .form-input.with-prefix {
        padding-right: 5rem;
    }

    .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .checkbox-wrapper:hover {
        background: #eeeeee;
    }

    .checkbox-wrapper input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #2196f3;
    }

    .checkbox-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .checkbox-label {
        font-size: 0.95rem;
        color: #1a1a1a;
        font-weight: 500;
    }

    .checkbox-hint {
        font-size: 0.8rem;
        color: #757575;
    }

    .alert {
        border-radius: 0.75rem;
        padding: 1rem 1.25rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .alert-warning {
        background: #fff3e0;
        border-left: 4px solid #ff9800;
        color: #e65100;
    }

    .alert-warning a {
        color: #2196f3;
        text-decoration: underline;
        font-weight: 500;
    }

    /* Form Actions */
    .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #f0f0f0;
    }

    .btn {
        padding: 0.875rem 1.75rem;
        border-radius: 0.75rem;
        font-weight: 500;
        font-size: 0.95rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
    }

    .btn-primary {
        background: #70AE48;
        color: white;
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: white;
        color: #616161;
        border: 1px solid #e0e0e0;
    }

    .btn-secondary:hover {
        background: #f5f5f5;
    }

    .btn-ghost {
        background: transparent;
        color: #757575;
        padding: 0.875rem 1rem;
    }

    .btn-ghost:hover {
        color: #2196f3;
    }

    @media (max-width: 768px) {
        .progress-steps {
            gap: 0.25rem;
        }

        .step-circle {
            width: 35px;
            height: 35px;
            font-size: 0.85rem;
        }

        .step-line {
            width: 40px;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .form-actions {
            flex-wrap: wrap;
        }
    }
</style>


<br><br><br>

<div class="create-container">
    <div class="header-section">
        <h1>Créer une facture</h1>
        <p>Suivez les étapes pour créer votre facture</p>
    </div>

    <!-- Progress Steps -->
    <div class="progress-steps">
        <div class="step">
            <div class="step-circle active" id="step-indicator-1">1</div>
        </div>
        <div class="step-line" id="line-1"></div>
        <div class="step">
            <div class="step-circle" id="step-indicator-2">2</div>
        </div>
        <div class="step-line" id="line-2"></div>
        <div class="step">
            <div class="step-circle" id="step-indicator-3">3</div>
        </div>
    </div>

    <div class="form-card">
        <form action="{{ route('co-owner.invoices.store') }}" method="POST" id="invoice-form">
            @csrf

            <!-- Step 1: Location et Type -->
            <div class="step-content active" id="step-1">
                <h3 class="step-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    Informations de base
                </h3>

                <div class="form-group">
                    <label class="form-label">
                        Location <span class="required">*</span>
                    </label>
                    @if($leases->isEmpty())
                        <div class="alert alert-warning">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <div>
                                <strong>Aucune location active</strong><br>
                                <span style="font-size: 0.9rem;">Vous devez d'abord <a href="{{ route('co-owner.assign-property.create') }}">assigner un bien</a>.</span>
                            </div>
                        </div>
                    @else
                        <select name="lease_id" class="form-select" required id="lease-select">
                            <option value="">Sélectionnez une location</option>
                            @foreach($leases as $lease)
                                <option value="{{ $lease->id }}" {{ old('lease_id') == $lease->id ? 'selected' : '' }}>
                                    {{ $lease->property->name }} - {{ $lease->tenant->user->name ?? 'Locataire' }} ({{ number_format($lease->rent_amount, 0, ',', ' ') }} FCFA)
                                </option>
                            @endforeach
                        </select>
                    @endif
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">
                            Type <span class="required">*</span>
                        </label>
                        <select name="type" class="form-select" required id="type-select">
                            <option value="rent" {{ old('type') == 'rent' ? 'selected' : '' }}>Loyer</option>
                            <option value="deposit" {{ old('type') == 'deposit' ? 'selected' : '' }}>Dépôt</option>
                            <option value="charge" {{ old('type') == 'charge' ? 'selected' : '' }}>Charge</option>
                            <option value="repair" {{ old('type') == 'repair' ? 'selected' : '' }}>Réparation</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            Échéance <span class="required">*</span>
                        </label>
                        <input type="date" name="due_date" class="form-input" value="{{ old('due_date', now()->addDays(5)->format('Y-m-d')) }}" required id="due-date">
                    </div>
                </div>
            </div>

            <!-- Step 2: Montant et Paiement -->
            <div class="step-content" id="step-2">
                <h3 class="step-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Montant et paiement
                </h3>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">
                            Période début <span class="hint">(optionnel)</span>
                        </label>
                        <input type="date" name="period_start" class="form-input" value="{{ old('period_start', now()->startOfMonth()->format('Y-m-d')) }}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            Période fin <span class="hint">(optionnel)</span>
                        </label>
                        <input type="date" name="period_end" class="form-input" value="{{ old('period_end', now()->endOfMonth()->format('Y-m-d')) }}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        Montant total <span class="required">*</span>
                    </label>
                    <div class="input-group">
                        <input
                            type="number"
                            name="amount_total"
                            class="form-input with-prefix"
                            step="0.01"
                            min="0.01"
                            value="{{ old('amount_total') }}"
                            placeholder="50000"
                            required
                            id="amount-input"
                        >
                        <span class="input-prefix">FCFA</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        Moyen de paiement <span class="required">*</span>
                    </label>
                    <select name="payment_method" class="form-select" required id="payment-method">
                        <option value="virement" {{ old('payment_method') == 'virement' ? 'selected' : '' }}>Virement bancaire</option>
                        <option value="mobile_money" {{ old('payment_method') == 'mobile_money' ? 'selected' : '' }}>Mobile Money</option>
                        <option value="card" {{ old('payment_method') == 'card' ? 'selected' : '' }}>Carte bancaire</option>
                        <option value="cheque" {{ old('payment_method') == 'cheque' ? 'selected' : '' }}>Chèque</option>
                        <option value="especes" {{ old('payment_method') == 'especes' ? 'selected' : '' }}>Espèces</option>
                        <option value="fedapay" {{ old('payment_method') == 'fedapay' ? 'selected' : '' }}>Fedapay</option>
                    </select>
                </div>
            </div>

            <!-- Step 3: Détails -->
            <div class="step-content" id="step-3">
                <h3 class="step-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Finalisation
                </h3>

                <div class="form-group">
                    <label class="form-label">
                        Description <span class="hint">(optionnel)</span>
                    </label>
                    <textarea name="description" class="form-input" rows="4" placeholder="Ajoutez des détails supplémentaires...">{{ old('description') }}</textarea>
                </div>

                <div class="form-group">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" name="create_payment_link" value="1" {{ old('create_payment_link') ? 'checked' : '' }}>
                        <div class="checkbox-text">
                            <span class="checkbox-label">🔗 Créer un lien de paiement</span>
                            <span class="checkbox-hint">Le locataire recevra un email avec un lien pour payer</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" id="prev-btn" style="display: none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Précédent
                </button>

                <a href="{{ route('co-owner.invoices.index') }}" class="btn btn-secondary" id="cancel-btn">
                    Annuler
                </a>

                <button type="button" class="btn btn-primary" id="next-btn">
                    Suivant
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </button>

                <button type="submit" class="btn btn-primary" id="submit-btn" style="display: none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Créer la facture
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    let currentStep = 1;
    const totalSteps = 3;

    const steps = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3')
    };

    const indicators = {
        1: document.getElementById('step-indicator-1'),
        2: document.getElementById('step-indicator-2'),
        3: document.getElementById('step-indicator-3')
    };

    const lines = {
        1: document.getElementById('line-1'),
        2: document.getElementById('line-2')
    };

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    function updateStepDisplay() {
        // Hide all steps
        Object.values(steps).forEach(step => step.classList.remove('active'));

        // Show current step
        steps[currentStep].classList.add('active');

        // Update indicators
        Object.keys(indicators).forEach(key => {
            const num = parseInt(key);
            if (num < currentStep) {
                indicators[key].classList.add('completed');
                indicators[key].classList.remove('active');
                indicators[key].innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
            } else if (num === currentStep) {
                indicators[key].classList.add('active');
                indicators[key].classList.remove('completed');
                indicators[key].textContent = num;
            } else {
                indicators[key].classList.remove('active', 'completed');
                indicators[key].textContent = num;
            }
        });

        // Update lines
        Object.keys(lines).forEach(key => {
            const num = parseInt(key);
            if (num < currentStep) {
                lines[key].classList.add('completed');
            } else {
                lines[key].classList.remove('completed');
            }
        });

        // Update buttons
        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
        submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
    }

    function validateStep(step) {
        let isValid = true;

        if (step === 1) {
            const leaseSelect = document.getElementById('lease-select');
            const typeSelect = document.getElementById('type-select');
            const dueDate = document.getElementById('due-date');

            if (leaseSelect && !leaseSelect.value) {
                leaseSelect.focus();
                isValid = false;
            } else if (!typeSelect.value) {
                typeSelect.focus();
                isValid = false;
            } else if (!dueDate.value) {
                dueDate.focus();
                isValid = false;
            }
        } else if (step === 2) {
            const amountInput = document.getElementById('amount-input');
            const paymentMethod = document.getElementById('payment-method');

            if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
                amountInput.focus();
                isValid = false;
            } else if (!paymentMethod.value) {
                paymentMethod.focus();
                isValid = false;
            }
        }

        return isValid;
    }

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepDisplay();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    });

    // Initialize
    updateStepDisplay();
</script>
@endsection
