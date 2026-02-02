<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('co_owners', function (Blueprint $table) {
            $table->string('co_owner_type')->default('co_owner')->after('is_professional');
        });
    }

    public function down(): void
    {
        Schema::table('co_owners', function (Blueprint $table) {
            $table->dropColumn('co_owner_type');
        });
    }
};
