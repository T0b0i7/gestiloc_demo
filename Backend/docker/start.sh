#!/usr/bin/env bash
set -e

export APP_ENV=${APP_ENV:-production}

echo "==> Fix permissions"
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

echo "==> Ensure storage symlink (public/storage -> storage/app/public)"
# Option 1: via artisan (safe)
php artisan storage:link || true

# Option 2 (alternative): symlink direct (décommente si tu préfères)
# ln -s /var/www/html/storage/app/public /var/www/html/public/storage || true

echo "==> Clear & cache"
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "==> Running migrations"
  php artisan migrate --force
fi

echo "==> Start PHP-FPM"
php-fpm -D

echo "==> Start Nginx"
nginx -g "daemon off;"
