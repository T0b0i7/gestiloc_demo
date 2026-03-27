<!DOCTYPE html>
<html>
<head>
    <title>Nouvelles photos ajoutées</title>
</head>
<body>
    <h2>Nouvelles photos ajoutées</h2>
    <p>Le co-propriétaire <strong>{{ $coOwner->first_name }} {{ $coOwner->last_name }}</strong> a ajouté <strong>{{ $photoCount }}</strong> nouvelle(s) photo(s) au bien <strong>{{ $property->name }}</strong>.</p>
    <p>Vous pouvez les consulter sur votre tableau de bord.</p>
</body>
</html>
