<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_invitations', function (Blueprint $table) {
            if (! Schema::hasColumn('tenant_invitations', 'accepted_at')) {
                $table->timestamp('accepted_at')->nullable()->after('expires_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tenant_invitations', function (Blueprint $table) {
            $table->dropColumn('accepted_at');
        });
    }
};
