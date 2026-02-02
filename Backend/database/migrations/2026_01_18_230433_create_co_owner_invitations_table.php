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
            $table->string('invited_by_type');
            $table->unsignedBigInteger('invited_by_id');
            $table->string('target_type');
            $table->unsignedBigInteger('landlord_id');
            $table->unsignedBigInteger('co_owner_user_id')->nullable();
            $table->string('email');
            $table->string('name');
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->timestamp('accepted_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            
            $table->index(['email']);
            $table->index(['token']);
            $table->index(['landlord_id']);
            $table->index(['co_owner_user_id']);
            $table->index(['accepted_at']);
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
