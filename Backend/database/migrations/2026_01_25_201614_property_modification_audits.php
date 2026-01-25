<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_modification_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('co_owner_id')->constrained('co_owners')->onDelete('cascade');
            $table->foreignId('landlord_id')->constrained('landlords')->onDelete('cascade');
            $table->json('original_data');
            $table->json('modified_data');
            $table->enum('status', ['pending_approval', 'approved', 'rejected'])->default('pending_approval');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['property_id', 'co_owner_id']);
            $table->index(['landlord_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_modification_audits');
    }
};