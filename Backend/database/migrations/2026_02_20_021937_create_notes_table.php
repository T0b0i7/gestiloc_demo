<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Relations
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('property_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('lease_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');

            // Contenu
            $table->string('title');
            $table->text('content')->nullable();

            // Partage
            $table->boolean('is_shared')->default(false);
            $table->json('shared_with')->nullable(); // Tableau des IDs des propriétaires/copropriétaires

            // Fichiers
            $table->json('files')->nullable(); // Tableau des chemins de fichiers

            // Métadonnées
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index('is_shared');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
