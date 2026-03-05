@echo off
REM Script de démarrage rapide pour GestiLoc - Module Proprietaire
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         GestiLoc - Module Proprietaire - Démarrage            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Le serveur est déjà en cours d'exécution
REM Ouvrir directement le navigateur

echo ✅ Ouverture de l'application Proprietaire...
echo.
echo 🌐 URL: http://localhost:8081/app/proprietaire
echo.

REM Ouvrir dans le navigateur par défaut
start http://localhost:8081/app/proprietaire

echo.
echo ✅ Application lancée !
echo.
echo Pour arrêter le serveur, appuyez sur Ctrl+C dans le terminal Vite
echo.
pause
