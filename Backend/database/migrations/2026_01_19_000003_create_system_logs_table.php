<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();

            // Contexte
            $table->string('level'); // emergency, alert, critical, error, warning, notice, info, debug
            $table->string('channel')->default('system'); // app, database, payment, api, pdf, etc.
            $table->string('message'); // Message d'erreur ou d'information

            // Source
            $table->string('environment'); // local, staging, production
            $table->string('context')->nullable(); // Contexte de l'erreur (controller, job, etc.)
            $table->string('source_file')->nullable(); // Fichier source
            $table->integer('line_number')->nullable(); // Numéro de ligne

            // Utilisateur et requête
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('request_id')->nullable(); // ID unique de la requête
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('request_method')->nullable();
            $table->text('request_url')->nullable();

            // Données techniques
            $table->string('exception_class', 255)->nullable(); // Classe de l'exception
            $table->text('stack_trace')->nullable(); // Stack trace complet
            $table->json('context_data')->nullable(); // Données additionnelles
            $table->json('request_data')->nullable(); // Données de la requête
            $table->json('session_data')->nullable(); // Données de session

            // Performance
            $table->integer('memory_usage')->nullable(); // Usage mémoire en octets
            $table->float('execution_time')->nullable(); // Temps d'exécution en secondes

            // Résolution
            $table->boolean('resolved')->default(false);
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');

            // Timestamps
            $table->timestamps();

            // Index pour performance
            $table->index(['level', 'created_at']);
            $table->index(['channel', 'created_at']);
            $table->index(['environment', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['resolved', 'created_at']);
            $table->index(['exception_class', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
