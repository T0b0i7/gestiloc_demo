<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lease_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();

            // landlord user id (pas landlord table) car tes FK notices/landlord_id => users.id
            $table->foreignId('landlord_user_id')->constrained('users')->cascadeOnDelete();

            $table->string('provider')->default('fedapay'); // fedapay/...
            $table->string('status')->default('initiated'); // initiated|pending|approved|declined|cancelled|failed
            $table->decimal('amount_total', 12, 2)->default(0);
            $table->decimal('fee_amount', 12, 2)->default(0);      // 5%
            $table->decimal('amount_net', 12, 2)->default(0);      // reste au propriétaire

            $table->string('currency')->default('XOF');

            $table->string('fedapay_transaction_id')->nullable()->index();
            $table->string('fedapay_reference')->nullable()->index();
            $table->string('checkout_token')->nullable()->index();
            $table->string('checkout_url')->nullable();

            $table->json('provider_payload')->nullable(); // pour debug (sans données sensibles)
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->unique(['invoice_id', 'provider']); // 1 paiement provider par facture
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
