<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rent_receipts', function (Blueprint $table) {
            // ✅ Le plus safe : varchar(20)
            $table->string('status', 20)->default('issued')->change();
        });
    }

    public function down(): void
    {
        Schema::table('rent_receipts', function (Blueprint $table) {
            $table->string('status', 10)->change(); // adapte si besoin
        });
    }
};
