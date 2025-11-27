#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Copy .env.example to .env if .env does not exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
fi

# Run composer install
echo "Running composer install..."
composer install --no-interaction --prefer-dist --optimize-autoloader

# Generate application key if it's not set
KEY_EXISTS=$(grep -c "APP_KEY=" .env)
if [ "$KEY_EXISTS" -eq 0 ]; then
    echo "Generating application key..."
    php artisan key:generate
else
    echo "Application key already exists."
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed the database (optional, only if you have seeders)
# echo "Seeding database..."
# php artisan db:seed --force

# Execute the original command (php-fpm in this case)
exec "$@"
