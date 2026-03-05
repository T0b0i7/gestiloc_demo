<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            // Si actuellement c'est un ENUM ou un TINYINT, on change en ENUM('nu','meuble')
            DB::statement("ALTER TABLE leases MODIFY COLUMN type ENUM('nu', 'meuble') NOT NULL DEFAULT 'nu'");
        });
    }

    public function down(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            // Remets ici l'ancien type si tu veux être propre,
            // par ex :
            // DB::statement("ALTER TABLE leases MODIFY COLUMN type VARCHAR(50) NOT NULL");
        });
    }
};
