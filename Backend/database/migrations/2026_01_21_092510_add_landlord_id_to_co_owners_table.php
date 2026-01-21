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
        Schema::table('co_owners', function (Blueprint $table) {
            $table->foreignId('landlord_id')->nullable()->after('invitation_id');
            $table->index(['landlord_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('co_owners', function (Blueprint $table) {
            $table->dropIndex(['landlord_id']);
            $table->dropForeign(['landlord_id']);
            $table->dropColumn('landlord_id');
        });
    }
};
