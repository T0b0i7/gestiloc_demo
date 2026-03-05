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
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            
            // Clé étrangère pour la propriété
            $table->unsignedBigInteger('property_id');
            
            // Clé étrangère pour le propriétaire
            $table->unsignedBigInteger('landlord_id');
            
            // Clé étrangère pour le locataire
            $table->unsignedBigInteger('tenant_id');
            
            $table->enum('type', ['landlord', 'tenant']);
            $table->text('reason');
            $table->date('notice_date');
            $table->date('end_date');
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ajout des contraintes de clé étrangère après la création de la table
            $table->foreign('property_id')
                ->references('id')
                ->on('properties')
                ->onDelete('cascade');
                
            $table->foreign('landlord_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
                
            $table->foreign('tenant_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};
