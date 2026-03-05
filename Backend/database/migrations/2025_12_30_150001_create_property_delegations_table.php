<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_delegations', function (Blueprint $table) {
            $table->id();

            // Clés étrangères
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('landlord_id')->constrained()->onDelete('cascade');

         
            $table->unsignedBigInteger('co_owner_id')->nullable();
            $table->string('co_owner_type')->nullable();

            // Statut et dates
            $table->enum('status', ['active', 'revoked', 'expired'])->default('active');
            $table->timestamp('delegated_at')->default(now());
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Conditions de délégation
            $table->text('notes')->nullable();
            $table->json('permissions')->nullable(); // ex: ["manage_lease", "collect_rent", "manage_maintenance"]

            $table->timestamps();

            // Index pour la performance
            $table->index(['property_id', 'status']);
            $table->index(['landlord_id', 'status']);
            $table->index(['co_owner_id', 'co_owner_type', 'status']); // Index pour relation polymorphe
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_delegations');
    }
};
