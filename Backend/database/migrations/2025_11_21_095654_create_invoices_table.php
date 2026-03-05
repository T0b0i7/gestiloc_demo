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
       // Les factures / Avis d'échéance / Quittances
Schema::create('invoices', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('lease_id')->index();
    $table->string('invoice_number')->unique(); // ex: INV-2023-001
    $table->enum('type', ['rent', 'deposit', 'charge', 'repair'])->default('rent');
    $table->date('due_date'); // Date limite de paiement
    $table->date('period_start')->nullable(); // Période concernée (ex: 01 Mars)
    $table->date('period_end')->nullable();   // (ex: 31 Mars)

    $table->decimal('amount_total', 12, 2);
    $table->decimal('amount_paid', 12, 2)->default(0);

    $table->enum('status', ['pending', 'partial', 'paid', 'overdue', 'cancelled'])->default('pending')->index();

    $table->string('pdf_path')->nullable(); // Lien vers la quittance générée
    $table->timestamp('sent_at')->nullable(); // Date d'envoi par email
    $table->timestamps();

    $table->foreign('lease_id')->references('id')->on('leases')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
