<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_condition_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('lease_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('created_by')->constrained('users');
            $table->enum('type', ['entry', 'exit', 'intermediate']);
            $table->date('report_date');
            $table->text('notes')->nullable();
            $table->json('signature_data')->nullable();
            $table->string('signed_by')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();
        });


    }

    public function down()
    {
        
        Schema::dropIfExists('property_condition_reports');
    }
};
