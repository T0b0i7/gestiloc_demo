<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Type de locataire

  $table->string('tenant_type')->nullable()->after('id');
            // Contact d'urgence - email et revenu mensuel
            $table->string('emergency_contact_email')->nullable();

            // Garant - date et lieu de naissance
            $table->date('guarantor_birth_date')->nullable();
            $table->string('guarantor_birth_place')->nullable();
            $table->decimal('guarantor_monthly_income', 12, 2)->nullable();

            // Documents
            $table->string('document_type')->nullable();
            $table->string('document_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'tenant_type',
                'emergency_contact_email',
                'monthly_income',
                'guarantor_birth_date',
                'guarantor_birth_place',
                'guarantor_monthly_income',
                'document_type',
                'document_path'
            ]);
        });
    }
};
