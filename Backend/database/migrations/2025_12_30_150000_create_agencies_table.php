<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            
            // Informations de l'agence/gestionnaire
            $table->string('company_name'); // Obligatoire pour une agence
            $table->string('license_number')->nullable(); // Numéro de licence professionnelle
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            
            // Statut juridique (similaire à landlord)
            $table->boolean('is_professional')->default(true); // Une agence est toujours professionnelle
            $table->string('id_type', 50)->nullable();
            $table->string('id_number', 100)->nullable();
            
            // Informations fiscales (similaire à landlord)
            $table->string('ifu', 50)->nullable();
            $table->string('rccm', 50)->nullable();
            $table->string('vat_number')->nullable();
            
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['company_name']);
            $table->index(['ifu']);
            $table->index(['rccm']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agencies');
    }
};
