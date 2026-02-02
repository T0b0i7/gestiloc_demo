<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('property_delegations', function (Blueprint $table) {
            $table->string('delegation_type')->default('shared')->after('permissions');
            // 'full' = agence (gestion complète)
            // 'shared' = copropriétaire simple (gestion partagée)
        });
    }

    public function down(): void
    {
        Schema::table('property_delegations', function (Blueprint $table) {
            $table->dropColumn('delegation_type');
        });
    }
};