<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('landlords', function (Blueprint $table) {
            $table->enum('owner_type', ['landlord', 'co_owner'])->default('landlord')->after('user_id');
            $table->index(['owner_type']);
        });
    }

    public function down(): void
    {
        Schema::table('landlords', function (Blueprint $table) {
            $table->dropIndex(['owner_type']);
            $table->dropColumn('owner_type');
        });
    }
};
