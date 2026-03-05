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
// Gestion des équipements (Clim, Ventilateur, Lit...)
Schema::create('property_equipments', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('property_id')->index();
    $table->string('name'); // ex: "Climatiseur Salon"
    $table->string('brand')->nullable();
    $table->date('installation_date')->nullable();
    $table->decimal('value', 10, 2)->nullable(); // Valeur pour amortissement
    $table->enum('condition', ['new', 'good', 'average', 'poor'])->default('good');
    $table->timestamps();

    $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_equipments');
    }
};
