@extends('layouts.co-owner')

@section('title', 'Assigner un Bien à un Locataire')

@section('content')
<div class="container-fluid px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 text-gray-800">
            <i class="fas fa-home me-2"></i>Assigner un Bien
            <small class="text-muted ms-2">{{ $tenant->first_name }} {{ $tenant->last_name }}</small>
        </h1>
        <a href="{{ route('co-owner.tenants.show', $tenant) }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Retour
        </a>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Sélection du bien</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('co-owner.tenants.assign', $tenant) }}" method="POST">
                        @csrf

                        @if($availableProperties->isEmpty())
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Aucun bien disponible pour assignation. Tous vos biens sont déjà loués ou assignés.
                            </div>
                        @else
                            <div class="row mb-3">
                                <div class="col-md-12">
                                    <label for="property_id" class="form-label">Bien *</label>
                                    <select class="form-select @error('property_id') is-invalid @enderror"
                                            id="property_id" name="property_id" required>
                                        <option value="">-- Sélectionner un bien --</option>
                                        @foreach($availableProperties as $property)
                                            <option value="{{ $property['id'] }}"
                                                    {{ old('property_id') == $property['id'] ? 'selected' : '' }}
                                                    data-rent="{{ $property['rent_amount'] }}">
                                                {{ $property['name'] }} - {{ $property['address'] }}, {{ $property['city'] }}
                                                ({{ $property['property_type'] }} - {{ $property['surface'] }} m²)
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('property_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="start_date" class="form-label">Date de début *</label>
                                    <input type="date" class="form-control @error('start_date') is-invalid @enderror"
                                           id="start_date" name="start_date" value="{{ old('start_date') }}" required>
                                    @error('start_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="col-md-6">
                                    <label for="end_date" class="form-label">Date de fin (optionnel)</label>
                                    <input type="date" class="form-control @error('end_date') is-invalid @enderror"
                                           id="end_date" name="end_date" value="{{ old('end_date') }}">
                                    @error('end_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="rent_amount" class="form-label">Loyer mensuel (€) *</label>
                                    <input type="number" step="0.01" class="form-control @error('rent_amount') is-invalid @enderror"
                                           id="rent_amount" name="rent_amount" value="{{ old('rent_amount') }}" required>
                                    @error('rent_amount')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="col-md-6">
                                    <label for="deposit_amount" class="form-label">Dépôt de garantie (€)</label>
                                    <input type="number" step="0.01" class="form-control @error('deposit_amount') is-invalid @enderror"
                                           id="deposit_amount" name="deposit_amount" value="{{ old('deposit_amount') }}">
                                    @error('deposit_amount')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Le locataire sera automatiquement informé de cette assignation.
                            </div>

                            <div class="d-flex justify-content-between">
                                <a href="{{ route('co-owner.tenants.show', $tenant) }}" class="btn btn-secondary">
                                    Annuler
                                </a>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>Assigner le bien
                                </button>
                            </div>
                        @endif
                    </form>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">
                        <i class="fas fa-user me-2"></i>Informations du locataire
                    </h6>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <div class="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center"
                             style="width: 80px; height: 80px;">
                            <i class="fas fa-user text-white fa-2x"></i>
                        </div>
                        <h5 class="mt-3 mb-1">{{ $tenant->first_name }} {{ $tenant->last_name }}</h5>
                        <p class="text-muted mb-2">{{ $tenant->user->email ?? 'Non défini' }}</p>
                        <span class="badge bg-{{ $tenant->status === 'active' ? 'success' : 'warning' }}">
                            {{ $tenant->status === 'active' ? 'Actif' : 'En attente' }}
                        </span>
                    </div>

                    <hr>

                    <h6 class="mb-3">Biens déjà assignés :</h6>
                    @if($tenant->leases->count() > 0)
                        <div class="list-group">
                            @foreach($tenant->leases as $lease)
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{{ $lease->property->name }}</strong>
                                            <small class="d-block text-muted">{{ $lease->property->address }}</small>
                                        </div>
                                        <span class="badge bg-info">{{ $lease->rent_amount }} €/mois</span>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <p class="text-muted">Aucun bien assigné</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Mettre la date d'aujourd'hui par défaut
    document.getElementById('start_date').valueAsDate = new Date();

    // Pré-remplir le loyer quand on sélectionne un bien
    document.getElementById('property_id').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const rentAmount = selectedOption.getAttribute('data-rent');
        const rentInput = document.getElementById('rent_amount');

        if (rentAmount) {
            rentInput.value = parseFloat(rentAmount).toFixed(2);
            // Calculer le dépôt (typiquement 2 mois de loyer)
            const depositInput = document.getElementById('deposit_amount');
            depositInput.value = (parseFloat(rentAmount) * 2).toFixed(2);
        }
    });

    // Auto-remplir le dépôt quand on change le loyer
    document.getElementById('rent_amount').addEventListener('input', function() {
        const depositInput = document.getElementById('deposit_amount');
        if (!depositInput.value || depositInput.value === '0') {
            depositInput.value = (parseFloat(this.value) * 2).toFixed(2);
        }
    });
</script>
@endpush
