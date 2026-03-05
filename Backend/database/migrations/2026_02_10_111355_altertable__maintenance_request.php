<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            // Champs pour les coûts et dates
            $table->decimal('estimated_cost', 10, 2)->nullable()->after('priority');
            $table->decimal('actual_cost', 10, 2)->nullable()->after('estimated_cost');
            $table->date('started_at')->nullable()->after('status');
            $table->date('estimated_end_date')->nullable()->after('started_at');
            $table->integer('progress')->default(0)->after('estimated_end_date');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->dropColumn(['estimated_cost', 'actual_cost', 'started_at', 'estimated_end_date', 'progress']);
        });
    }
};
