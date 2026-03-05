# ---- Build deps (composer) ----
FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

COPY . .
RUN composer dump-autoload --no-dev --optimize

# ---- Runtime (PHP-FPM + Nginx) ----
FROM php:8.2-fpm-alpine

# System deps
RUN apk add --no-cache \
  nginx \
  bash \
  curl \
  icu-dev \
  oniguruma-dev \
  libzip-dev \
  zip \
  unzip \
  mysql-client

# PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring zip intl opcache

# Workdir
WORKDIR /var/www/html

# Copy app from build stage
COPY --from=vendor /app /var/www/html

# Nginx + start script
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Permissions (storage + cache)
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
 && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
 && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 10000
CMD ["/start.sh"]
