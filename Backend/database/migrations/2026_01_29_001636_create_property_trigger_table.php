<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_user_audit', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->unsignedBigInteger('lease_id')->nullable();
            $table->string('action'); // assigned, terminated, updated
            $table->string('role')->nullable();
            $table->decimal('share_percentage', 5, 2)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('changes')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable(); // Rendre nullable
            $table->string('performed_by_role');
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('lease_id')->references('id')->on('leases')->onDelete('cascade');
            $table->foreign('performed_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['property_id', 'user_id']);
            $table->index('action');
            $table->index('created_at');
        });

        // Nettoyage au cas où
        DB::unprepared('
            DROP TRIGGER IF EXISTS property_user_ai;
            DROP TRIGGER IF EXISTS property_user_au;
            DROP TRIGGER IF EXISTS property_user_ad;
        ');

        // AFTER INSERT
        DB::unprepared('
            CREATE TRIGGER property_user_ai
            AFTER INSERT ON property_user
            FOR EACH ROW
            BEGIN
                DECLARE landlord_id_val BIGINT;

                -- Récupérer le landlord_id depuis le bien
                SELECT landlord_id INTO landlord_id_val
                FROM properties
                WHERE id = NEW.property_id;

                INSERT INTO property_user_audit (
                    property_id, user_id, tenant_id, lease_id, action, role,
                    share_percentage, start_date, end_date, old_status, new_status,
                    changes, performed_by, performed_by_role, created_at, updated_at
                ) VALUES (
                    NEW.property_id, NEW.user_id, NEW.tenant_id, NEW.lease_id,
                    "assigned", NEW.role, NEW.share_percentage, NEW.start_date,
                    NEW.end_date, NULL, NEW.status, NULL,
                    landlord_id_val, "system", NOW(), NOW()
                );
            END;
        ');

        // AFTER UPDATE
        DB::unprepared('
            CREATE TRIGGER property_user_au
            AFTER UPDATE ON property_user
            FOR EACH ROW
            BEGIN
                DECLARE landlord_id_val BIGINT;

                -- Récupérer le landlord_id depuis le bien
                SELECT landlord_id INTO landlord_id_val
                FROM properties
                WHERE id = NEW.property_id;

                INSERT INTO property_user_audit (
                    property_id, user_id, tenant_id, lease_id, action, role,
                    share_percentage, start_date, end_date, old_status, new_status,
                    changes, performed_by, performed_by_role, created_at, updated_at
                ) VALUES (
                    NEW.property_id, NEW.user_id, NEW.tenant_id, NEW.lease_id,
                    "updated", NEW.role, NEW.share_percentage, NEW.start_date,
                    NEW.end_date, OLD.status, NEW.status,
                    JSON_OBJECT(
                        "status", JSON_OBJECT("old", OLD.status, "new", NEW.status),
                        "end_date", JSON_OBJECT("old", OLD.end_date, "new", NEW.end_date),
                        "role", JSON_OBJECT("old", OLD.role, "new", NEW.role),
                        "share_percentage", JSON_OBJECT("old", OLD.share_percentage, "new", NEW.share_percentage)
                    ),
                    landlord_id_val, "system", NOW(), NOW()
                );
            END;
        ');

        // AFTER DELETE
        DB::unprepared('
            CREATE TRIGGER property_user_ad
            AFTER DELETE ON property_user
            FOR EACH ROW
            BEGIN
                DECLARE landlord_id_val BIGINT;

                -- Récupérer le landlord_id depuis le bien
                SELECT landlord_id INTO landlord_id_val
                FROM properties
                WHERE id = OLD.property_id;

                INSERT INTO property_user_audit (
                    property_id, user_id, tenant_id, lease_id, action, role,
                    share_percentage, start_date, end_date, old_status, new_status,
                    changes, performed_by, performed_by_role, created_at, updated_at
                ) VALUES (
                    OLD.property_id, OLD.user_id, OLD.tenant_id, OLD.lease_id,
                    "terminated", OLD.role, OLD.share_percentage, OLD.start_date,
                    OLD.end_date, OLD.status, NULL, NULL,
                    landlord_id_val, "system", NOW(), NOW()
                );
            END;
        ');
    }

    public function down(): void
    {
        DB::unprepared('
            DROP TRIGGER IF EXISTS property_user_ai;
            DROP TRIGGER IF EXISTS property_user_au;
            DROP TRIGGER IF EXISTS property_user_ad;
        ');

        Schema::dropIfExists('property_user_audit');
    }
};
