@extends('layouts.co-owner')

@section('title', 'Fiche Locataire')

@section('content')
<div class="container-fluid px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 text-gray-800">
            <i class="fas fa-user me-2"></i>{{ $tenant->first_name }} {{ $tenant->last_name }}
        </h1>
        <div>
            <a href="{{ route('co-owner.tenants.assign.show', $tenant) }}" class="btn btn-success">
                <i class="fas fa-home me-2"></i>Assigner un bien
            </a>
            <a href="{{ route('co-owner.tenants.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-2"></i>Retour
            </a>
        </div>
    </div>

    <div class="row">
        <!-- Informations du locataire -->
        <div class="col-lg-4 mb-4">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">
                        <i class="fas fa-info-circle me-2"></i>Informations personnelles
                    </h6>
                </div>
                <div class="card-body">
                    <div class="text-center mb-4">
                        <div class="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center"
                             style="width: 100px; height: 100px;">
                            <i class="fas fa-user text-white fa-3x"></i>
                        </div>
                        <h4 class="mt-3 mb-1">{{ $tenant->first_name }} {{ $tenant->last_name }}</h4>
                        <span class="badge bg-{{ $tenant->status === 'active' ? 'success' : 'warning' }} fs-6">
                            {{ $tenant->status === 'active' ? 'Actif' : 'En attente' }}
                        </span>
                    </div>

                    <hr>

                    <table class="table table-borderless">
                        <tr>
                            <th width="40%"><i class="fas fa-envelope me-2"></i>Email</th>
                            <td>{{ $tenant->user->email ?? 'Non défini' }}</td>
                        </tr>
                        <tr>
                            <th><i class="fas fa-phone me-2"></i>Téléphone</th>
                            <td>{{ $tenant->user->phone ?? 'Non défini' }}</td>
                        </tr>
                        <tr>
                            <th><i class="fas fa-calendar me-2"></i>Créé le</th>
                            <td>{{ $tenant->created_at->format('d/m/Y') }}</td>
                        </tr>
                        <tr>
                            <th><i class="fas fa-user-check me-2"></i>Email vérifié</th>
                            <td>
                                @if($tenant->user->email_verified_at)
                                    <span class="badge bg-success">Oui</span>
                                @else
                                    <span class="badge bg-warning">Non</span>
                                @endif
                            </td>
                        </tr>
                    </table>

                    @if($tenant->status === 'candidate')
                        <div class="alert alert-warning mt-3">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Le locataire n'a pas encore accepté l'invitation.
                            <form action="{{ route('co-owner.tenants.resend-invitation', $tenant) }}"
                                  method="POST" class="mt-2">
                                @csrf
                                <button type="submit" class="btn btn-warning btn-sm">
                                    <i class="fas fa-paper-plane me-2"></i>Renvoyer l'invitation
                                </button>
                            </form>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Biens assignés -->
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                    <h6 class="m-0 font-weight-bold text-primary">
                        <i class="fas fa-home me-2"></i>Biens assignés
                    </h6>
                    <span class="badge bg-primary">{{ $tenant->leases->count() }} bien(s)</span>
                </div>
                <div class="card-body">
                    @if($tenant->leases->count() > 0)
                        <div class="row">
                            @foreach($tenant->leases as $lease)
                                <div class="col-md-6 mb-4">
                                    <div class="card h-100 border-left-primary">
                                        <div class="card-body">
                                            <h5 class="card-title">{{ $lease->property->name }}</h5>
                                            <p class="card-text text-muted">
                                                <i class="fas fa-map-marker-alt me-2"></i>
                                                {{ $lease->property->address }}, {{ $lease->property->city }}
                                            </p>

                                            <div class="mb-3">
                                                <div class="d-flex justify-content-between">
                                                    <span>Loyer:</span>
                                                    <strong>{{ number_format($lease->rent_amount, 2) }} €</strong>
                                                </div>
                                                <div class="d-flex justify-content-between">
                                                    <span>Période:</span>
                                                    <span>
                                                        {{ $lease->start_date->format('d/m/Y') }}
                                                        @if($lease->end_date)
                                                            - {{ $lease->end_date->format('d/m/Y') }}
                                                        @else
                                                            - Indéterminée
                                                        @endif
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="d-flex justify-content-between">
                                                <span class="badge bg-{{ $lease->status === 'active' ? 'success' : 'secondary' }}">
                                                    {{ $lease->status === 'active' ? 'Actif' : $lease->status }}
                                                </span>

                                                <form action="{{ route('co-owner.tenants.unassign', [$tenant, $lease->property]) }}"
                                                      method="POST" class="d-inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit"
                                                            class="btn btn-danger btn-sm"
                                                            onclick="return confirm('Êtes-vous sûr de vouloir désassigner ce bien ?')">
                                                        <i class="fas fa-times me-2"></i>Désassigner
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-home fa-3x text-gray-300 mb-3"></i>
                            <h5 class="text-gray-500">Aucun bien assigné</h5>
                            <p class="text-gray-500">Ce locataire n'a pas encore de bien assigné.</p>
                            <a href="{{ route('co-owner.tenants.assign.show', $tenant) }}" class="btn btn-primary mt-3">
                                <i class="fas fa-home me-2"></i>Assigner un bien
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
