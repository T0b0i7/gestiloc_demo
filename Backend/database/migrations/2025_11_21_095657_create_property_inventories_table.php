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
        Schema::create('property_inventories', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('lease_id')->index();
    $table->enum('type', ['check_in', 'check_out', 'interim']); // Entrée / Sortie
    $table->date('date');
    $table->string('report_pdf_path')->nullable();
    $table->boolean('is_signed')->default(false);
    $table->json('signatures')->nullable(); // Stocker les métadonnées de signature électronique
    $table->text('general_comments')->nullable();
    $table->timestamps();

    $table->foreign('lease_id')->references('id')->on('leases')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_inventories');
    }
};
