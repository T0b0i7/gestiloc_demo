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
       // Détails pièce par pièce (Salon -> Mur -> Bon état)
Schema::create('inventory_items', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('inventory_id')->index();
    $table->string('room_name'); // Salon, Cuisine...
    $table->string('element_name'); // Mur, Sol, Prise élec...
    $table->enum('state', ['new', 'good', 'used', 'damaged', 'destroyed']);
    $table->text('observation')->nullable();
    $table->integer('quantity')->default(1);
    $table->json('photos')->nullable(); // Array of URLs (Important pour le coté visuel)
    $table->timestamps();

    $table->foreign('inventory_id')->references('id')->on('property_inventories')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
