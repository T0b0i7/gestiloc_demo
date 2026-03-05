<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('status', ['candidate','active','inactive'])->default('candidate')->index();
            $table->decimal('solvency_score', 5, 2)->nullable(); // 0.00 - 999.99
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
