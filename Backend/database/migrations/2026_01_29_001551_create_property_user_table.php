<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->unsignedBigInteger('lease_id')->nullable();
            $table->unsignedBigInteger('landlord_id')->nullable();

            // Informations sur l'attribution
            $table->string('role')->default('tenant'); // tenant, co-tenant, occupant
            $table->decimal('share_percentage', 5, 2)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending', 'terminated'])->default('active');

            // Dates de création/mise à jour
            $table->timestamps();

            // Clés étrangères
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('lease_id')->references('id')->on('leases')->onDelete('cascade');
            $table->foreign('landlord_id')->references('id')->on('landlords')->onDelete('cascade');

            // Index pour performances
            $table->index(['property_id', 'user_id']);
            $table->index(['user_id', 'status']);
            $table->index(['property_id', 'status']);
            $table->index('landlord_id');
            $table->index('start_date');
            $table->index('end_date');

            // Unique constraint pour éviter les doublons
            $table->unique(['property_id', 'user_id', 'status'], 'property_user_unique_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_user');
    }
};
