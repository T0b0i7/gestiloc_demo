<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       // Gestion des compteurs (Eau/Électricité)
Schema::create('utilities', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('property_id')->index();
    $table->string('type'); // 'electricity' (SBEE), 'water' (SONEB)
    $table->string('meter_number')->unique(); // Numéro du compteur
    $table->string('contract_number')->nullable(); // Numéro de police
    $table->timestamps();

    $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilities');
    }
};
