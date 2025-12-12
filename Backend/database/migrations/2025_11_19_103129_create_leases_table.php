<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->unsignedBigInteger('property_id')->index();
            $table->unsignedBigInteger('tenant_id')->index();

            // Infos Contrat
            $table->string('lease_number')->unique(); // ex: BAIL-2023-0054
            $table->enum('type', ['residential', 'commercial', 'professional', 'seasonal'])->default('residential');
            $table->date('start_date');
            $table->date('end_date')->nullable(); // Null si durée indéterminée
            $table->boolean('tacit_renewal')->default(true); // Renouvellement tacite

            // Conditions Financières
            $table->decimal('rent_amount', 12, 2); // Loyer principal
            $table->decimal('charges_amount', 12, 2)->default(0); // Charges mensuelles fixes

            // Spécifique Bénin / Afrique de l'Ouest
            $table->decimal('guarantee_amount', 12, 2)->default(0); // Caution (Remboursable)
            $table->integer('prepaid_rent_months')->default(0); // Nombre de mois d'avance payés à l'entrée

            // Gestion des paiements
            $table->integer('billing_day')->default(1); // Jour de paiement (le 1, le 5...)
            $table->enum('payment_frequency', ['monthly', 'quarterly', 'annually'])->default('monthly');
            $table->decimal('penalty_rate', 5, 2)->default(0); // % pénalité retard

            // État du bail
            $table->enum('status', ['draft', 'active', 'terminated', 'pending_signature'])->default('draft')->index();

            // Documents & Annexes
            $table->string('contract_file_path')->nullable(); // PDF signé stocké
            $table->json('terms')->nullable(); // Conditions particulières (Animaux, Sous-location...)
            $table->text('termination_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('leases');
    }
};
