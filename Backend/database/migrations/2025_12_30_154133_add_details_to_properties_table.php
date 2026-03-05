<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::table('properties', function (Blueprint $table) {

        // 🏠 Détails
        if (!Schema::hasColumn('properties', 'floor')) {
            $table->integer('floor')->nullable()->after('surface');
        }

        if (!Schema::hasColumn('properties', 'total_floors')) {
            $table->integer('total_floors')->nullable()->after('floor');
        }

        if (!Schema::hasColumn('properties', 'bedroom_count')) {
            $table->integer('bedroom_count')->nullable()->after('room_count');
        }

        if (!Schema::hasColumn('properties', 'bathroom_count')) {
            $table->integer('bathroom_count')->nullable()->after('bedroom_count');
        }

        if (!Schema::hasColumn('properties', 'wc_count')) {
            $table->integer('wc_count')->nullable()->after('bathroom_count');
        }

        if (!Schema::hasColumn('properties', 'has_garage')) {
            $table->boolean('has_garage')->default(false)->after('wc_count');
        }

        if (!Schema::hasColumn('properties', 'has_parking')) {
            $table->boolean('has_parking')->default(false)->after('has_garage');
        }

        if (!Schema::hasColumn('properties', 'is_furnished')) {
            $table->boolean('is_furnished')->default(false)->after('has_parking');
        }

        if (!Schema::hasColumn('properties', 'has_elevator')) {
            $table->boolean('has_elevator')->default(false)->after('is_furnished');
        }

        if (!Schema::hasColumn('properties', 'has_balcony')) {
            $table->boolean('has_balcony')->default(false)->after('has_elevator');
        }

        if (!Schema::hasColumn('properties', 'has_terrace')) {
            $table->boolean('has_terrace')->default(false)->after('has_balcony');
        }

        if (!Schema::hasColumn('properties', 'has_cellar')) {
            $table->boolean('has_cellar')->default(false)->after('has_terrace');
        }

        if (!Schema::hasColumn('properties', 'construction_year')) {
            $table->year('construction_year')->nullable()->after('has_cellar');
        }

        // 📍 Géoloc (si déjà existantes chez toi en string, on ne touche pas ici)
        if (!Schema::hasColumn('properties', 'latitude')) {
            $table->decimal('latitude', 10, 7)->nullable()->after('zip_code');
        }
        if (!Schema::hasColumn('properties', 'longitude')) {
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        }
        if (!Schema::hasColumn('properties', 'location_source')) {
            $table->enum('location_source', ['manual', 'gps', 'google_maps'])->nullable()->after('longitude');
        }

        // ⚙️ amenities
        if (!Schema::hasColumn('properties', 'amenities')) {
            $table->json('amenities')->nullable()->after('photos');
        }

        // meta nullable (si ta colonne meta existe déjà et est json)
        // ⚠️ Le change() nécessite doctrine/dbal. Donc on le retire ici pour éviter une autre erreur.
    });
}

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {

            $table->dropColumn([
                'floor',
                'total_floors',
                'bedroom_count',
                'bathroom_count',
                'wc_count',
                'has_garage',
                'has_parking',
                'is_furnished',
                'has_elevator',
                'has_balcony',
                'has_terrace',
                'has_cellar',
                'construction_year',
                'latitude',
                'longitude',
                'location_source',
                'amenities',
            ]);
        });
    }
};
