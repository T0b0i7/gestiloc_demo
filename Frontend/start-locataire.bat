@echo off
REM Script de démarrage rapide pour GestiLoc - Module Locataire
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         GestiLoc - Module Locataire - Démarrage               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Vérifier si bun est installé
where bun >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur : bun n'est pas installé ou n'est pas dans le PATH
    echo.
    echo Pour installer bun, visitez : https://bun.sh
    pause
    exit /b 1
)

echo ✅ bun trouvé
echo.

REM Afficher les options
echo Veuillez sélectionner une action :
echo.
echo 1) Démarrer le serveur de développement (http://localhost:5173)
echo 2) Build pour production
echo 3) Lancer le linting
echo 4) Prévisualiser la build
echo 5) Réinstaller les dépendances
echo 6) Quitter
echo.

set /p choice="Entrez votre choix (1-6) : "

if "%choice%"=="1" (
    echo.
    echo 🚀 Démarrage du serveur de développement...
    echo.
    call bun run dev
    echo.
    echo 📝 L'application est accessible à http://localhost:5173/app/locataire
    echo.
    pause
) else if "%choice%"=="2" (
    echo.
    echo 🔨 Build en cours...
    echo.
    call bun run build
    echo.
    echo ✅ Build terminée ! Les fichiers sont dans le dossier dist/
    echo.
    pause
) else if "%choice%"=="3" (
    echo.
    echo 🔍 Vérification du linting...
    echo.
    call bun run lint
    echo.
    pause
) else if "%choice%"=="4" (
    echo.
    echo 👁️  Prévisualisation de la build...
    echo.
    call bun run preview
    echo.
    pause
) else if "%choice%"=="5" (
    echo.
    echo 📦 Réinstallation des dépendances...
    echo.
    call bun install
    echo.
    echo ✅ Dépendances installées !
    echo.
    pause
) else if "%choice%"=="6" (
    echo Au revoir !
    exit /b 0
) else (
    echo ❌ Choix invalide. Veuillez recommencer.
    pause
    cls
    goto :start
)

goto :start
