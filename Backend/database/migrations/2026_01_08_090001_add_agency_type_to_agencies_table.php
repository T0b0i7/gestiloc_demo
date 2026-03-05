<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->enum('agency_type', ['agency', 'co_owner_agency'])->default('agency')->after('user_id');
            $table->index(['agency_type']);
        });
    }

    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            $table->dropIndex(['agency_type']);
            $table->dropColumn('agency_type');
        });
    }
};
