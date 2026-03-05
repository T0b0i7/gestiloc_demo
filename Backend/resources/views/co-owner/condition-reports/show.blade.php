@extends('layouts.co-owner')

@section('title', 'État des lieux #' . $report->id)

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 text-gray-800">
            <i class="fas fa-clipboard-check text-primary me-2"></i>
            État des lieux #{{ $report->id }}
        </h1>
        <div class="d-flex gap-2">
            <a href="{{ route('co-owner.condition-reports.download', $report->id) }}"
               class="btn btn-outline-primary">
                <i class="fas fa-download me-2"></i>PDF
            </a>
            <a href="{{ route('co-owner.condition-reports.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-2"></i>Retour
            </a>
        </div>
    </div>

    <!-- Informations principales -->
    <div class="row mb-4">
        <div class="col-md-8">
            <div class="card shadow">
                <div class="card-body">
                    <h5 class="card-title">Informations générales</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Date :</strong> {{ $report->report_date->format('d/m/Y') }}</p>
                            <p><strong>Type :</strong>
                                @if($report->type == 'entry')
                                    <span class="badge bg-success">Entrée</span>
                                @elseif($report->type == 'exit')
                                    <span class="badge bg-danger">Sortie</span>
                                @else
                                    <span class="badge bg-warning">Intermédiaire</span>
                                @endif
                            </p>
                            <p><strong>Bien :</strong> {{ $report->property->name }}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Bail :</strong> #{{ $report->lease_id }}</p>
                            <p><strong>Locataire :</strong> {{ $report->lease->tenant->full_name ?? 'N/A' }}</p>
                            <p><strong>Créé par :</strong> {{ $report->creator->name ?? 'Utilisateur' }}</p>
                        </div>
                    </div>

                    @if($report->notes)
                    <div class="mt-3">
                        <strong>Notes :</strong>
                        <p class="mb-0">{{ $report->notes }}</p>
                    </div>
                    @endif

                    @if($report->signed_at)
                    <div class="mt-3 alert alert-success">
                        <i class="fas fa-signature me-2"></i>
                        <strong>Signé par :</strong> {{ $report->signed_by }}
                        <br>
                        <small>Le {{ $report->signed_at->format('d/m/Y à H:i') }}</small>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card shadow">
                <div class="card-body">
                    <h5 class="card-title">Actions</h5>
                    <div class="d-grid gap-2">
                        <a href="{{ route('co-owner.condition-reports.download', $report->id) }}"
                           class="btn btn-outline-primary">
                            <i class="fas fa-file-pdf me-2"></i>Télécharger PDF
                        </a>

                        @if(!$report->signed_at)
                        <button class="btn btn-outline-success" data-bs-toggle="modal"
                                data-bs-target="#addPhotosModal">
                            <i class="fas fa-camera me-2"></i>Ajouter des photos
                        </button>

                        <form action="{{ route('co-owner.condition-reports.destroy', $report->id) }}"
                              method="POST" class="d-grid">
                            @csrf @method('DELETE')
                            <button type="submit" class="btn btn-outline-danger"
                                    onclick="return confirm('Supprimer cet état des lieux ?')">
                                <i class="fas fa-trash me-2"></i>Supprimer
                            </button>
                        </form>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Galerie de photos -->
    <div class="card shadow mb-4">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-images text-primary me-2"></i>
                Photos ({{ $report->photos->count() }})
            </h5>
        </div>
        <div class="card-body">
            @if($report->photos->isEmpty())
                <div class="text-center py-4">
                    <i class="fas fa-image fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Aucune photo pour cet état des lieux.</p>
                </div>
            @else
                <div class="row">
                    @foreach($report->photos as $photo)
                    <div class="col-md-4 col-lg-3 mb-4">
                        <div class="card h-100">
                            <img src="{{ Storage::url($photo->path) }}"
                                 class="card-img-top"
                                 alt="{{ $photo->original_filename }}"
                                 style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <h6 class="card-title">{{ $photo->original_filename }}</h6>
                                <p class="card-text">
                                    <small class="text-muted">
                                        <strong>Statut :</strong>
                                        @if($photo->condition_status == 'good')
                                            <span class="badge bg-success">Bon</span>
                                        @elseif($photo->condition_status == 'satisfactory')
                                            <span class="badge bg-info">Correct</span>
                                        @elseif($photo->condition_status == 'poor')
                                            <span class="badge bg-warning">Mauvais</span>
                                        @elseif($photo->condition_status == 'damaged')
                                            <span class="badge bg-danger">Abîmé</span>
                                        @endif
                                    </small>
                                </p>
                                @if($photo->condition_notes)
                                <p class="card-text">
                                    <small>{{ $photo->condition_notes }}</small>
                                </p>
                                @endif
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>

<!-- Modal pour ajouter des photos -->
@if(!$report->signed_at)
<div class="modal fade" id="addPhotosModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('co-owner.condition-reports.add-photos', $report->id) }}"
                  method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Ajouter des photos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="new-photos-container">
                        <!-- Champs dynamiques pour les nouvelles photos -->
                    </div>
                    <button type="button" class="btn btn-outline-primary mt-3"
                            onclick="addNewPhotoField()">
                        <i class="fas fa-plus me-2"></i>Ajouter une autre photo
                    </button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
let newPhotoCount = 0;
function addNewPhotoField() {
    const container = document.getElementById('new-photos-container');
    const div = document.createElement('div');
    div.className = 'mb-3 border p-3 rounded';
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">Photo ${newPhotoCount + 1}</h6>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeNewPhotoField(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="mb-2">
            <input type="file" name="photos[]" class="form-control" accept="image/*" required>
        </div>
        <div class="row">
            <div class="col-md-6">
                <select name="condition_statuses[]" class="form-select">
                    <option value="good">Bon</option>
                    <option value="satisfactory">Correct</option>
                    <option value="poor">Mauvais</option>
                    <option value="damaged">Abîmé</option>
                </select>
            </div>
            <div class="col-md-6">
                <input type="text" name="condition_notes[]" class="form-control"
                       placeholder="Notes...">
            </div>
        </div>
    `;
    container.appendChild(div);
    newPhotoCount++;
}

function removeNewPhotoField(button) {
    button.closest('div.mb-3').remove();
}

// Ajouter un champ initial
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('addPhotosModal')) {
        addNewPhotoField();
    }
});
</script>
@endpush
@endif
@endsection
