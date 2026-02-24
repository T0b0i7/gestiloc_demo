{{-- resources/views/dossier-public.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dossier de candidature</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app">
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center animate-fadeIn">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Chargement du dossier</h1>
                <p class="text-gray-600 mb-4">Veuillez patienter pendant le chargement du dossier...</p>
                <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Rediriger vers l'API pour récupérer les données
        window.location.href = '/api/public/dossier/' + '{{ $shareUrl }}';
    </script>
</body>
</html>
