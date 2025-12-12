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
       Schema::create('tickets', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('lease_id')->index();
    $table->unsignedBigInteger('creator_user_id'); // Qui a ouvert le ticket
    $table->string('subject');
    $table->text('description');
    $table->enum('priority', ['low', 'medium', 'high', 'emergency'])->default('medium');
    $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
    $table->unsignedBigInteger('assigned_vendor_id')->nullable(); // Si vous avez une table "artisans" plus tard
    $table->timestamps();

    $table->foreign('lease_id')->references('id')->on('leases')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
