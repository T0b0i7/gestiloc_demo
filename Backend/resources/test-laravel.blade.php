<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Laravel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4a5568;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #4299e1;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
        }
        .btn:hover {
            background: #3182ce;
        }
        .btn-danger {
            background: #f56565;
        }
        .btn-danger:hover {
            background: #e53e3e;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Page Laravel de Test</h1>
        <p>Si vous voyez cette page, Laravel fonctionne correctement !</p>

        <h2>Liens de test :</h2>
        <div>
            <a href="/coproprietaire/tenants" class="btn">Liste des locataires</a>
            <a href="/coproprietaire/tenants/create" class="btn">Créer un locataire</a>
            <a href="/dashboard" class="btn">Retour à React</a>
        </div>

        <h2>Informations de session :</h2>
        <ul>
            <li>Utilisateur connecté : {{ auth()->user()->email ?? 'Non connecté' }}</li>
            <li>Rôle : {{ auth()->user()->roles->first()->name ?? 'Aucun rôle' }}</li>
            <li>ID : {{ auth()->user()->id ?? 'N/A' }}</li>
        </ul>
    </div>
</body>
</html>
