<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            // Drop ancienne FK (vers users)
            $table->dropForeign(['tenant_id']);

            // Recrée FK vers tenants
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);

            $table->foreign('tenant_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }
};
