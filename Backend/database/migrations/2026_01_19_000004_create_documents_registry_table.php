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
        Schema::create('documents_registry', function (Blueprint $table) {
            $table->id();
            
            // Type et modèle
            $table->string('document_type'); // lease_contract, rent_receipt, notice, invoice, etc.
            $table->string('template_name')->nullable(); // Nom du modèle utilisé
            $table->string('template_version')->nullable(); // Version du modèle
            
            // Relations
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->string('target_type'); // lease, payment, invoice, user, property, etc.
            $table->unsignedBigInteger('target_id');
            
            // Métadonnées du document
            $table->string('title'); // Titre lisible du document
            $table->string('reference')->unique(); // Référence unique du document
            $table->text('description')->nullable(); // Description optionnelle
            
            // Fichier
            $table->string('file_path'); // Chemin du fichier
            $table->string('file_name'); // Nom du fichier
            $table->string('file_type'); // pdf, docx, etc.
            $table->integer('file_size'); // Taille en octets
            $table->string('mime_type')->nullable(); // MIME type
            
            // Status et cycle de vie
            $table->string('status')->default('generated'); // generated, signed, archived, deleted
            $table->string('visibility')->default('private'); // public, private, restricted
            $table->timestamp('expires_at')->nullable(); // Date d'expiration
            
            // Métadonnées additionnelles
            $table->json('metadata')->nullable(); // Données structurées additionnelles
            $table->json('tags')->nullable(); // Tags pour recherche
            
            // Accès et partage
            $table->json('access_permissions')->nullable(); // Qui peut accéder
            $table->string('share_token')->nullable()->unique(); // Token de partage public
            $table->timestamp('share_expires_at')->nullable(); // Expiration du partage
            
            // Audit
            $table->timestamp('last_accessed_at')->nullable();
            $table->integer('download_count')->default(0);
            $table->text('access_log')->nullable(); // JSON des accès
            
            // Timestamps
            $table->timestamps();
            
            // Index pour performance
            $table->index(['document_type', 'created_at']);
            $table->index(['target_type', 'target_id']);
            $table->index(['generated_by', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index(['visibility', 'created_at']);
            $table->index(['reference']);
            $table->index(['share_token']);
            
            // Contrainte unique pour éviter les doublons
            $table->unique(['target_type', 'target_id', 'document_type'], 'unique_target_document');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents_registry');
    }
};
