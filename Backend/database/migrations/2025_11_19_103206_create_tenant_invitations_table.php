<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenant_invitations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('landlord_id')->index();
            $table->unsignedBigInteger('tenant_user_id')->nullable()->index();
            $table->string('email')->index();
            $table->string('name')->nullable();
            $table->string('token')->unique();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('used')->default(false)->index();
            $table->timestamps();

            $table->foreign('landlord_id')->references('id')->on('landlords')->onDelete('cascade');
            $table->foreign('tenant_user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['landlord_id','email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_invitations');
    }
};
