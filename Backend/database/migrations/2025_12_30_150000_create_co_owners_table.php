<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
       
        // Table pour les copropriétaires (similaire à landlords mais adapté pour la gestion déléguée)
        Schema::create('co_owners', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('company_name')->nullable(); // Pour agence/copropriétaire professionnel
            $table->string('address_billing')->nullable();
            $table->string('vat_number')->nullable();
            $table->string('license_number')->nullable(); // Pour agence immobilière
            $table->boolean('is_professional')->default(false); // true si agence, false si copropriétaire simple
            $table->string('ifu', 50)->nullable();
            $table->string('rccm', 50)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['company_name']);
            $table->index(['is_professional']);
        });
    }

    public function down(): void
    {
        
        Schema::dropIfExists('co_owners');
    }
};
