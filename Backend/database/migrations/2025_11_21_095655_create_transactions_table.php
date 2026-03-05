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
       // Les paiements réels (Cash, MTN Money, Moov Money, Virement)
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('invoice_id')->index();
    $table->string('payment_method'); // 'cash', 'mtn_momo', 'moov_money', 'bank_transfer', 'stripe'
    $table->string('transaction_reference')->nullable(); // ID de transaction de l'API (Kkiapay/Fedapay/Stripe)
    $table->decimal('amount', 12, 2);
    $table->date('payment_date');
    $table->text('notes')->nullable(); // ex: "Payé en main propre par le frère du locataire"
    $table->unsignedBigInteger('recorded_by')->nullable(); // Qui a validé le paiement (Admin ou Bailleur)
    $table->timestamps();

    $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
