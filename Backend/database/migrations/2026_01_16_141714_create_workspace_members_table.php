<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('workspace_members', function (Blueprint $table) {
            $table->id();

            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // V1 : owner = landlord (lecture seule), manager = co-owner/agence (full)
            $table->enum('role', ['owner', 'manager'])->index();

            // null => defaults by role (owner=view, manager=*)
            $table->json('permissions')->nullable();

            $table->enum('status', ['active', 'invited', 'disabled'])->default('active')->index();
            $table->timestamp('joined_at')->nullable();

            $table->timestamps();

            $table->unique(['workspace_id', 'user_id']);
            $table->index(['workspace_id', 'role']);
            $table->index(['user_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_members');
    }
};
