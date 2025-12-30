<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rent_receipts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lease_id')->constrained('leases')->cascadeOnDelete();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();

            $table->foreignId('landlord_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();


            // mois/année du paiement
            $table->unsignedTinyInteger('month'); // 1..12
            $table->unsignedSmallInteger('year'); // ex: 2025

            // date réelle de paiement (optionnelle)
            $table->date('paid_at')->nullable();

            // montants
            $table->decimal('rent_amount', 10, 2)->default(0);
            $table->decimal('charges_amount', 10, 2)->default(0);

            // ref unique lisible
            $table->string('reference')->unique();

            // statut simple
            $table->enum('status', ['paid', 'cancelled'])->default('paid');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->unique(['lease_id', 'month', 'year']); // 1 quittance/mois/bail
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rent_receipts');
    }
};
