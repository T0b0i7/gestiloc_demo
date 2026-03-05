<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lease_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('name');
            $table->string('type'); // bail, quittance, dpe, diagnostic, acte_vente, autre
            $table->string('category')->nullable(); // document, template
            $table->string('bien')->nullable();
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_size')->nullable();
            $table->string('file_type')->nullable(); // pdf, doc, xls, image, etc.

            $table->boolean('is_shared')->default(false);
            $table->json('shared_with')->nullable(); // tableau d'IDs d'utilisateurs
            $table->json('shared_with_emails')->nullable(); // tableau d'emails externes

            $table->string('status')->default('actif'); // actif, archive
            $table->date('document_date')->nullable();
            $table->json('metadata')->nullable(); // infos supplémentaires

            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};
