<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Créer un Locataire - Co-propriétaire</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4a5568;
            border-bottom: 2px solid #48bb78;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #4a5568;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #cbd5e0;
            border-radius: 5px;
            font-size: 16px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #4299e1;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
            border: none;
            cursor: pointer;
            font-size: 16px;
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
        .session-box {
            margin-top: 30px;
            padding: 15px;
            background: #f7fafc;
            border-radius: 5px;
        }
    </style>
</head>

<body>
<div class="container">

    <h1>👤 Créer un Nouveau Locataire</h1>

    <div style="background:#f0fff4;border-left:4px solid #48bb78;padding:15px;margin:20px 0;border-radius:5px;">
        <p><strong>✅ Formulaire Laravel fonctionnel</strong></p>
        <p>Cette page est servie par Laravel Blade.</p>
    </div>

    <form action="" method="POST">
        @csrf

        <div class="form-group">
            <label for="first_name">Prénom :</label>
            <input type="text" id="first_name" name="first_name" required>
        </div>

        <div class="form-group">
            <label for="last_name">Nom :</label>
            <input type="text" id="last_name" name="last_name" required>
        </div>

        <div class="form-group">
            <label for="email">Email :</label>
            <input type="email" id="email" name="email" required>
        </div>

        <div class="form-group">
            <label for="phone">Téléphone :</label>
            <input type="tel" id="phone" name="phone">
        </div>

        <div style="margin-top: 30px;">
            <button type="submit" class="btn btn-success">
                ✅ Créer le locataire
            </button>

            <a href="{{ route('co-owner.tenants.index') }}" class="btn">
                ← Retour à la liste
            </a>

            <a href="/dashboard" class="btn">
                🏠 Tableau de bord
            </a>
        </div>
    </form>

    <div class="session-box">
        <h3>Informations de session :</h3>

        @auth
            <p>
                Utilisateur :
                <strong>{{ auth()->user()->email }}</strong>
            </p>
            <p>
                Rôle :
                <strong>{{ auth()->user()->roles->first()->name ?? '—' }}</strong>
            </p>
        @else
            <p><strong>Utilisateur non connecté</strong></p>
        @endauth
    </div>

</div>
</body>
</html>
