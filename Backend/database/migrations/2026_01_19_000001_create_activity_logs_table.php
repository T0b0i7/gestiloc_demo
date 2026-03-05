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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            
            // Acteur
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade');
            $table->string('actor_role'); // admin, tenant, landlord, agency
            
            // Action
            $table->string('action'); // login, create, update, delete, generate_pdf, payment_attempt, etc.
            $table->text('description')->nullable(); // Description lisible de l'action
            
            // Cible
            $table->string('target_type')->nullable(); // Property, Lease, Payment, Invoice, User, etc.
            $table->unsignedBigInteger('target_id')->nullable();
            
            // Status et contexte
            $table->string('status')->default('success'); // success, failed, pending, warning
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            // Métadonnées flexibles
            $table->json('meta')->nullable(); // Données additionnelles structurées
            
            // Timestamps
            $table->timestamp('created_at')->useCurrent();
            
            // Index pour performance
            $table->index(['actor_id', 'created_at']);
            $table->index(['target_type', 'target_id']);
            $table->index(['action', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
