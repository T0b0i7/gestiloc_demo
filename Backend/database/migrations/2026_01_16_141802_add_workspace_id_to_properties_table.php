<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->foreignId('workspace_id')
                ->nullable()
                ->after('landlord_id')
                ->constrained('workspaces')
                ->nullOnDelete();

            $table->index(['workspace_id']);
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropConstrainedForeignId('workspace_id');
        });
    }
};
