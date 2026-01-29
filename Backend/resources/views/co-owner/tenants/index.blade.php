<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liste des Locataires - Co-propriétaire</title>
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
            border-bottom: 2px solid #4299e1;
            padding-bottom: 10px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #4299e1;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #3182ce;
        }
        .btn-success {
            background: #48bb78;
        }
        .btn-success:hover {
            background: #38a169;
        }
        .btn-danger {
            background: #f56565;
        }
        .btn-danger:hover {
            background: #e53e3e;
        }
        .info-box {
            background: #ebf8ff;
            border-left: 4px solid #4299e1;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Liste des Locataires</h1>

        <div class="info-box">
            <p><strong>✅ Page Laravel fonctionnelle !</strong></p>
            <p>Cette page est servie par Laravel Blade, pas par React.</p>
        </div>

        <h2>Actions disponibles :</h2>
        <div>
            <a href="/coproprietaire/tenants/create" class="btn btn-success">
                ➕ Créer un nouveau locataire
            </a>
            <a href="/dashboard" class="btn">
                ← Retour au tableau de bord React
            </a>
            <a href="/test-laravel" class="btn">
                🧪 Page de test Laravel
            </a>
        </div>

        <h2>Session utilisateur :</h2>
        <ul>
            <li>Email : <strong>{{ auth()->user()->email }}</strong></li>
            <li>Rôle : <strong>{{ auth()->user()->roles->first()->name }}</strong></li>
            <li>ID utilisateur : <strong>{{ auth()->user()->id }}</strong></li>
            <li>ID co-propriétaire : <strong>{{ auth()->user()->coOwner->id ?? 'N/A' }}</strong></li>
        </ul>

        <h2>Débogage :</h2>
        <p>Timestamp : {{ now() }}</p>
        <p>URL : {{ request()->url() }}</p>
    </div>
</body>
</html>
