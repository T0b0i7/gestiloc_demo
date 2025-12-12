<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_condition_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('property_condition_reports')->onDelete('cascade');
            $table->string('path');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->unsignedInteger('size');
            $table->text('caption')->nullable();
            $table->dateTime('taken_at');
            $table->enum('condition_status', ['good', 'satisfactory', 'poor', 'damaged'])->default('good');
            $table->text('condition_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('property_condition_photos');
    }
};
