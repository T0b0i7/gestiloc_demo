<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  public function up(): void
{
    DB::statement("ALTER TABLE property_modification_audits
                  MODIFY COLUMN status
                  ENUM('modified', 'pending_approval', 'approved', 'rejected')
                  NOT NULL DEFAULT 'modified'");

    // Ajouter la colonne seulement si elle n'existe pas
    if (!Schema::hasColumn('property_modification_audits', 'notification_sent_at')) {
        Schema::table('property_modification_audits', function (Blueprint $table) {
            $table->timestamp('notification_sent_at')->nullable()->after('approved_at');
        });
    }

    DB::table('property_modification_audits')
        ->where('status', 'pending_approval')
        ->update(['status' => 'modified']);
}


    public function down(): void
    {
        // 1. Retirer la colonne notification_sent_at
        Schema::table('property_modification_audits', function (Blueprint $table) {
            $table->dropColumn('notification_sent_at');
        });

        // 2. Remettre la valeur par défaut originale
        DB::statement("ALTER TABLE property_modification_audits
                      MODIFY COLUMN status
                      ENUM('pending_approval', 'approved', 'rejected')
                      NOT NULL DEFAULT 'pending_approval'");
    }
};
