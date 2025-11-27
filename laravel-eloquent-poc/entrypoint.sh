#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Copy .env.example to .env if .env does not exist
echo "STARTING: .env file check"
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
fi
echo "FINISHED: .env file check"

# Run composer install
echo "STARTING: composer install"
composer install --no-interaction --prefer-dist --optimize-autoloader
echo "FINISHED: composer install"

# Generate application key if it's not set
echo "STARTING: application key check"
KEY_EXISTS=$(grep -c "APP_KEY=" .env)
if [ "$KEY_EXISTS" -eq 0 ]; then
    echo "Generating application key..."
    php artisan key:generate
else
    echo "Application key already exists."
fi
echo "FINISHED: application key check"

# Set appropriate permissions for Laravel
echo "STARTING: setting permissions for Laravel directories"
chown -R laradock:www-data storage bootstrap/cache
chown -R laradock:www-data database
echo "FINISHED: setting permissions for Laravel directories"

# Run database migrations and seed the database
echo "STARTING: database migrations and seeding"
php artisan migrate:fresh --seed --force
echo "FINISHED: database migrations and seeding"

# Execute the original command (php-fpm in this case)
exec "$@"
