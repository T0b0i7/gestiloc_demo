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
        Schema::create('co_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('address_billing')->nullable();
            $table->string('phone')->nullable();
            $table->string('license_number')->nullable();
            $table->boolean('is_professional')->default(false);
            $table->string('ifu')->nullable();
            $table->string('rccm')->nullable();
            $table->string('vat_number')->nullable();
            $table->json('meta')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->foreignId('invitation_id')->nullable();
            $table->timestamps();
            
            $table->index(['user_id']);
            $table->index(['status']);
            $table->index(['invitation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('co_owners');
    }
};
