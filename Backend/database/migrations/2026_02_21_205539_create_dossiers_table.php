<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dossiers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            // Informations personnelles
            $table->string('nom');
            $table->string('prenoms');
            $table->date('date_naissance')->nullable();
            $table->text('a_propos')->nullable();

            // Contact
            $table->string('email');
            $table->string('telephone')->nullable();
            $table->string('mobile')->nullable();

            // Adresse
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->string('pays')->nullable();
            $table->string('region')->nullable();

            // Situation professionnelle
            $table->string('type_activite')->nullable(); // Salarié CDI, CDD, etc.
            $table->string('profession')->nullable();
            $table->decimal('revenus_mensuels', 10, 2)->nullable();

            // Garant
            $table->boolean('has_garant')->default(false);
            $table->string('garant_type')->nullable(); // Personne physique, Organisme, etc.
            $table->text('garant_description')->nullable();

            // Documents associés
            $table->json('documents')->nullable(); // tableau des IDs de documents

            // Partage
            $table->boolean('is_shared')->default(false);
            $table->json('shared_with')->nullable(); // tableau d'IDs d'utilisateurs
            $table->json('shared_with_emails')->nullable(); // tableau d'emails externes
            $table->string('share_url')->nullable(); // URL publique unique

            $table->string('status')->default('brouillon'); // brouillon, publie, archive

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('dossiers');
    }
};
