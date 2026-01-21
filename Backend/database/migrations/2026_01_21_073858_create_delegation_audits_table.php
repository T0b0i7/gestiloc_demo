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
        Schema::create('delegation_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delegation_id')->constrained('property_delegations')->onDelete('cascade');
            $table->string('auditable_type');
            $table->unsignedBigInteger('auditable_id');
            $table->string('action'); // created, updated, revoked, expired, permission_changed
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('reason')->nullable();
            $table->string('performed_by_type'); // user, landlord, co_owner, agency
            $table->unsignedBigInteger('performed_by_id');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['performed_by_type', 'performed_by_id']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delegation_audits');
    }
};
