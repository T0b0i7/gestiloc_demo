<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fix_rent_receipts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lease_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('landlord_user_id')->constrained('users')->cascadeOnDelete();

            $table->string('receipt_number')->unique();
            $table->date('issued_date');
            $table->string('paid_month')->nullable(); // YYYY-MM

            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->string('pdf_path')->nullable(); // storage path
            $table->string('status')->default('issued'); // issued|draft

            $table->json('meta')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fix_rent_receipts');
    }
};
