<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Pour MySQL, nous devons modifier le type ENUM manuellement
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE tenants MODIFY COLUMN `status` ENUM('candidate', 'active', 'inactive', 'archived', 'pending', 'rejected', 'suspended') DEFAULT 'candidate'");
        } else {
            // Pour PostgreSQL/SQLite, utiliser Schema
            Schema::table('tenants', function (Blueprint $table) {
                $table->enum('status', [
                    'candidate', 'active', 'inactive', 'archived',
                    'pending', 'rejected', 'suspended'
                ])->default('candidate')->change();
            });
        }

        // Ajouter un commentaire à la colonne pour la documentation
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE tenants MODIFY COLUMN `status` ENUM('candidate', 'active', 'inactive', 'archived', 'pending', 'rejected', 'suspended') DEFAULT 'candidate' COMMENT 'candidate: Candidat, active: Actif, inactive: Inactif, archived: Archivé, pending: En attente, rejected: Rejeté, suspended: Suspendu'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revenir aux anciennes valeurs 
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE tenants MODIFY COLUMN `status` ENUM('candidate', 'active', 'inactive') DEFAULT 'candidate'");
        } else {
            Schema::table('tenants', function (Blueprint $table) {
                $table->enum('status', ['candidate', 'active', 'inactive'])
                      ->default('candidate')
                      ->change();
            });
        }
    }
};
