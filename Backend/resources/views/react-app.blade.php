<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GestiLoc - Co-propriétaire</title>
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Scripts -->
    <script src="{{ asset('js/app.js') }}" defer></script>

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">

    <!-- Inline styles pour éviter le flash blanc -->
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        #root {
            min-height: 100vh;
            background-color: #ffffff;
        }
    </style>
</head>
<body>
    <!-- Root element pour React -->
    <div id="root"></div>

    <!-- Initial state pour React -->
   @php
    $user = auth()->user();
@endphp

<script>
    window.Laravel = {
        csrfToken: "{{ csrf_token() }}",
        user: @json($user),
        permissions: @json($user?->getAllPermissions()?->pluck('name') ?? []),
        roles: @json($user?->roles?->pluck('name') ?? []),
        appName: "{{ config('app.name') }}",
        appUrl: "{{ config('app.url') }}"
    };
</script>

</body>
</html>
