<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Ajouter les colonnes qui sont utilisées dans votre formulaire
            $table->date('birth_date')->nullable()->after('last_name');
            $table->string('birth_place')->nullable()->after('birth_date');
            $table->string('marital_status')->nullable()->after('birth_place');
            $table->string('profession')->nullable()->after('marital_status');
            $table->string('employer')->nullable()->after('profession');
            $table->decimal('annual_income', 12, 2)->nullable()->after('employer');
            $table->decimal('monthly_income', 12, 2)->nullable()->after('annual_income');
            $table->string('contract_type')->nullable()->after('monthly_income');
            $table->string('emergency_contact_name')->nullable()->after('contract_type');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->text('notes')->nullable()->after('emergency_contact_phone');
            $table->string('address')->nullable()->after('notes');
            $table->string('zip_code')->nullable()->after('address');
            $table->string('city')->nullable()->after('zip_code');
            $table->string('country')->nullable()->after('city');
            $table->string('guarantor_name')->nullable()->after('country');
            $table->string('guarantor_phone')->nullable()->after('guarantor_name');
            $table->string('guarantor_email')->nullable()->after('guarantor_phone');
            $table->string('guarantor_profession')->nullable()->after('guarantor_email');
            $table->decimal('guarantor_income', 12, 2)->nullable()->after('guarantor_profession');
            $table->string('guarantor_address')->nullable()->after('guarantor_income');


        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date',
                'birth_place',
                'marital_status',
                'profession',
                'employer',
                'annual_income',
                'monthly_income',
                'contract_type',
                'emergency_contact_name',
                'emergency_contact_phone',
                'notes',
                'address',
                'zip_code',
                'city',
                'country',
                'guarantor_name',
                'guarantor_phone',
                'guarantor_email',
                'guarantor_profession',
                'guarantor_income',
                'guarantor_address',
            ]);
        });
    }
};
