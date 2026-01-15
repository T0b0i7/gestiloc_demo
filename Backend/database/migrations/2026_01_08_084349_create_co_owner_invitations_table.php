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
        Schema::create('co_owner_invitations', function (Blueprint $table) {
            $table->id();
            $table->enum('invited_by_type', ['landlord', 'co_owner']);
            $table->foreignId('invited_by_id');
            $table->enum('target_type', ['landlord', 'co_owner']);
            $table->foreignId('landlord_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('co_owner_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('email');
            $table->string('name');
            $table->string('token')->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->boolean('used')->default(false);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['token', 'used']);
            $table->index(['email', 'used']);
            $table->index(['invited_by_type', 'invited_by_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('co_owner_invitations');
    }
};
