<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique(); // Sécurité API
            $table->unsignedBigInteger('landlord_id')->index(); // Propriétaire

            // Infos Générales
            $table->string('type')->index(); // apartment, house, office, store, land
            $table->string('name')->nullable(); // ex: "Villa Cotonou - Zone A"
            $table->text('description')->nullable();
            $table->string('reference_code')->unique(); // Référence interne (ex: REF-001)

            // Localisation (Adapté Bénin)
            $table->string('address'); // Rue ou Carré
            $table->string('district')->nullable(); // Quartier (Important au Bénin)
            $table->string('city')->index(); // Cotonou, Calavi, Porto-Novo...
            $table->string('state')->nullable(); // Département (Littoral, Atlantique...)
            $table->string('zip_code')->nullable();
            $table->decimal('latitude', 10, 8)->nullable(); // Pour la carte "Retina"
            $table->decimal('longitude', 11, 8)->nullable();

            // Détails techniques
            $table->decimal('surface', 8, 2)->nullable(); // m²
            $table->integer('room_count')->nullable(); // Nbr pièces
            $table->integer('bedroom_count')->nullable(); // Nbr chambres
            $table->integer('bathroom_count')->nullable(); // Nbr douches

            // Financier (Valeurs par défaut)
            $table->decimal('rent_amount', 12, 2)->nullable(); // Loyer hors charges
            $table->decimal('charges_amount', 12, 2)->default(0); // Charges (Eau/Vidange/Gardiennage)

            // État & Configuration
            $table->enum('status', ['available', 'rented', 'maintenance', 'off_market'])->default('available')->index();
            $table->json('amenities')->nullable(); // { "wifi": true, "ac": true, "parking": true }
            $table->json('photos')->nullable(); // Stockage rapide des URLs principales
            $table->json('meta')->nullable(); // Champs flexibles (ex: num compteur SBEE backup)

            $table->timestamps();
            $table->softDeletes(); // Corbeille

            $table->foreign('landlord_id')->references('id')->on('landlords')->onDelete('cascade');
            $table->index(['city', 'status', 'rent_amount']); // Optimisation recherche
        });
    }

    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
