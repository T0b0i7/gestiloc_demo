<!DOCTYPE html>
<html>
     <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">
<head>
    <title>Modification de bien délégué</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
        .content { background-color: #ffffff; padding: 20px; }
        .changes { margin-top: 20px; }
        .change-item { padding: 10px; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #333; }
        .old-value { color: #dc3545; text-decoration: line-through; }
        .new-value { color: #28a745; font-weight: bold; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Modification de bien délégué</h2>
            <p>Le co-propriétaire a modifié un bien qui vous est délégué.</p>
        </div>

        <div class="content">
            <h3>Informations du bien</h3>
            <p><strong>Nom :</strong> {{ $property->name }}</p>
            <p><strong>Adresse :</strong> {{ $property->address }}, {{ $property->city }}</p>
            <p><strong>Référence :</strong> {{ $property->reference_code ?? 'Non défini' }}</p>

            <h3>Co-propriétaire ayant effectué les modifications</h3>
            <p><strong>Nom :</strong> {{ $coOwner->first_name }} {{ $coOwner->last_name }}</p>
            <p><strong>Email :</strong> {{ $coOwner->user->email ?? 'Non disponible' }}</p>
            <p><strong>Date de modification :</strong> {{ now()->format('d/m/Y H:i') }}</p>

            @if(count($changes) > 0)
            <div class="changes">
                <h3>Modifications effectuées</h3>
                @foreach($changes as $field => $change)
                <div class="change-item">
                    <span class="label">{{ ucfirst(str_replace('_', ' ', $field)) }} :</span>
                    @if($change['old'] != $change['new'])
                    <span class="old-value">{{ $change['old'] }}</span> →
                    <span class="new-value">{{ $change['new'] }}</span>
                    @else
                    <span>{{ $change['new'] }}</span>
                    @endif
                </div>
                @endforeach
            </div>
            @else
            <p>Aucune modification détectée.</p>
            @endif

            <p style="margin-top: 20px;">
                <strong>Note :</strong> Ces modifications ont été automatiquement enregistrées.
                Vous pouvez consulter l'historique complet des modifications depuis votre tableau de bord.
            </p>
        </div>

        <div class="footer">
            <p>Cet email a été envoyé automatiquement par le système de gestion immobilière.</p>
            <p>© {{ date('Y') }} - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
