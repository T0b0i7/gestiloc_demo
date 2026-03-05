<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rent_receipts', function (Blueprint $table) {

            if (!Schema::hasColumn('rent_receipts', 'type')) {
                $table->string('type')->default('independent')->index(); // independent | invoice
            }

            if (!Schema::hasColumn('rent_receipts', 'paid_month')) {
                $table->string('paid_month', 7)->nullable()->index(); // "YYYY-MM"
            }

            // Optionnels (si tu ne les as pas déjà)
            if (!Schema::hasColumn('rent_receipts', 'issued_date')) {
                $table->date('issued_date')->nullable();
            }

            if (!Schema::hasColumn('rent_receipts', 'amount_paid')) {
                $table->decimal('amount_paid', 12, 2)->nullable();
            }

            if (!Schema::hasColumn('rent_receipts', 'status')) {
                $table->string('status')->default('issued')->index(); // issued/cancelled...
            }

            if (!Schema::hasColumn('rent_receipts', 'notes')) {
                $table->text('notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('rent_receipts', function (Blueprint $table) {
            if (Schema::hasColumn('rent_receipts', 'type')) $table->dropColumn('type');
            if (Schema::hasColumn('rent_receipts', 'paid_month')) $table->dropColumn('paid_month');
            if (Schema::hasColumn('rent_receipts', 'issued_date')) $table->dropColumn('issued_date');
            if (Schema::hasColumn('rent_receipts', 'amount_paid')) $table->dropColumn('amount_paid');
            if (Schema::hasColumn('rent_receipts', 'status')) $table->dropColumn('status');
            if (Schema::hasColumn('rent_receipts', 'notes')) $table->dropColumn('notes');
        });
    }
};
