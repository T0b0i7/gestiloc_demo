<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {

            $table->id();

            // Relation utilisateur
            $table->unsignedBigInteger('user_id')->unique();

            // Identité
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();

            // Type de locataire
            $table->string('tenant_type')->nullable();

            // Statut
            $table->enum('status', [
                'candidate',
                'active',
                'inactive',
                'archived',
                'pending',
                'rejected',
                'suspended'
            ])->default('candidate')->index();

            // Informations personnelles
            $table->date('birth_date')->nullable();
            $table->string('birth_place')->nullable();
            $table->string('marital_status')->nullable();

            // Situation professionnelle
            $table->string('profession')->nullable();
            $table->string('employer')->nullable();
            $table->string('contract_type')->nullable();
            $table->decimal('monthly_income', 12, 2)->nullable();
            $table->decimal('annual_income', 12, 2)->nullable();

            // Adresse
            $table->string('address')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();

            // Contact d'urgence
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_email')->nullable();

            // Garant
            $table->string('guarantor_name')->nullable();
            $table->string('guarantor_phone')->nullable();
            $table->string('guarantor_email')->nullable();
            $table->string('guarantor_profession')->nullable();
            $table->decimal('guarantor_income', 12, 2)->nullable();
            $table->decimal('guarantor_monthly_income', 12, 2)->nullable();
            $table->string('guarantor_address')->nullable();
            $table->date('guarantor_birth_date')->nullable();
            $table->string('guarantor_birth_place')->nullable();

            // Documents
            $table->string('document_type')->nullable();
            $table->string('document_path')->nullable();

            // Analyse financière
            $table->decimal('solvency_score', 5, 2)->nullable();

            // Métadonnées
            $table->json('meta')->nullable();

            // Notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Clé étrangère
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
