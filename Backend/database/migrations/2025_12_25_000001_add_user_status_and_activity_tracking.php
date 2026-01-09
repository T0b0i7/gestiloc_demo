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
        Schema::table('users', function (Blueprint $table) {
            // Last activity timestamp for online tracking
            $table->timestamp('last_activity_at')->nullable()->after('remember_token');
            
            // Account status management
            $table->enum('status', ['active', 'suspended', 'deactivated'])->default('active')->after('last_activity_at');
            
            // Suspension/deactivation details
            $table->text('suspension_reason')->nullable()->after('status');
            $table->timestamp('suspended_at')->nullable()->after('suspension_reason');
            $table->unsignedBigInteger('suspended_by')->nullable()->after('suspended_at');
            
            // Deactivation details
            $table->text('deactivation_reason')->nullable()->after('suspended_by');
            $table->timestamp('deactivated_at')->nullable()->after('deactivation_reason');
            $table->unsignedBigInteger('deactivated_by')->nullable()->after('deactivated_at');
            
            // Indexes for performance
            $table->index('last_activity_at');
            $table->index('status');
            $table->index(['status', 'last_activity_at']);
            
            // Foreign keys for admin actions
            $table->foreign('suspended_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('deactivated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['suspended_by']);
            $table->dropForeign(['deactivated_by']);
            $table->dropIndex(['last_activity_at']);
            $table->dropIndex(['status']);
            $table->dropIndex(['status', 'last_activity_at']);
            
            $table->dropColumn([
                'last_activity_at',
                'status', 
                'suspension_reason',
                'suspended_at',
                'suspended_by',
                'deactivation_reason',
                'deactivated_at',
                'deactivated_by'
            ]);
        });
    }
};
