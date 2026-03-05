<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('landlords', function (Blueprint $table) {
            $table->string('fedapay_subaccount_id')->nullable()->after('vat_number');
            $table->json('fedapay_meta')->nullable()->after('fedapay_subaccount_id');
        });
    }

    public function down(): void
    {
        Schema::table('landlords', function (Blueprint $table) {
            $table->dropColumn(['fedapay_subaccount_id', 'fedapay_meta']);
        });
    }
};
