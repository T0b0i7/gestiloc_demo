<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Préférences
            $table->string('language')->default('fr')->after('phone');
            $table->string('timezone')->default('Europe/Paris')->after('language');
            $table->string('date_format')->default('d/m/Y')->after('timezone');
            $table->string('currency')->default('FCFA')->after('date_format');
            $table->boolean('dark_mode')->default(false)->after('currency');

            // Sécurité
            $table->boolean('two_factor_enabled')->default(false)->after('dark_mode');
            $table->string('two_factor_secret')->nullable()->after('two_factor_enabled');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');

            // Notifications - stockées en JSON pour flexibilité
            $table->json('notification_settings')->nullable()->after('two_factor_recovery_codes');

            // Confidentialité
            $table->boolean('data_sharing')->default(true)->after('notification_settings');

            // Dernière activité
            $table->timestamp('last_password_change')->nullable()->after('data_sharing');
            $table->timestamp('last_login_at')->nullable()->after('last_password_change');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'language',
                'timezone',
                'date_format',
                'currency',
                'dark_mode',
                'two_factor_enabled',
                'two_factor_secret',
                'two_factor_recovery_codes',
                'notification_settings',
                'data_sharing',
                'last_password_change',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
