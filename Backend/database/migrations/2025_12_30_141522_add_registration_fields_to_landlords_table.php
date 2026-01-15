<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    // Migration vide - les champs ont été retirés de la table landlords
    // Ils ne doivent exister que dans la table co_owners
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Migration vide - aucun champ à retirer
    }
};
