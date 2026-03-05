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
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            
            // Référence au paiement original
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('lease_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('set null');
            
            // Type de log
            $table->string('log_type'); // attempt, callback, webhook, failure, success, refund, chargeback
            
            // Informations de paiement
            $table->string('gateway'); // fedapay, stripe, orange_money, etc.
            $table->string('transaction_id')->nullable(); // ID transaction externe
            $table->string('reference')->nullable(); // Référence interne
            
            // Montants
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('XOF');
            
            // Status et résultats
            $table->string('status'); // pending, processing, success, failed, cancelled, refunded
            $table->string('response_code')->nullable();
            $table->text('response_message')->nullable();
            $table->json('gateway_response')->nullable(); // Réponse brute du gateway
            
            // Contexte technique
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('payment_method')->nullable(); // card, mobile_money, bank_transfer
            
            // Métadonnées
            $table->json('metadata')->nullable(); // Données additionnelles
            
            // Timestamps
            $table->timestamp('processed_at')->nullable(); // Quand le paiement a été traité
            $table->timestamps();
            
            // Index pour performance
            $table->index(['payment_id', 'log_type']);
            $table->index(['invoice_id', 'status']);
            $table->index(['tenant_id', 'created_at']);
            $table->index(['gateway', 'status']);
            $table->index(['log_type', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};
