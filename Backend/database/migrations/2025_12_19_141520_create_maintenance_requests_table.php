<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('landlord_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->string('category')->default('other'); // plumbing | electricity | heating | other
            $table->text('description')->nullable();

            $table->string('status')->default('open');    // open | in_progress | resolved | cancelled
            $table->string('priority')->default('medium'); // low | medium | high | emergency

            // Dispos proposées (slots)
            $table->json('preferred_slots')->nullable();  // [{date:"2025-12-21", from:"09:00", to:"12:00"}]

            // Photos (paths storage)
            $table->json('photos')->nullable();           // ["maintenance/xx.jpg", ...]

            // Suivi
            $table->string('assigned_provider')->nullable(); // nom du prestataire
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['property_id', 'tenant_id', 'landlord_id']);
            $table->index(['status', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
