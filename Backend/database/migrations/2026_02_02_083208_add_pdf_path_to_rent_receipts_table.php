<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPdfPathToRentReceiptsTable extends Migration
{
    public function up()
    {
        Schema::table('rent_receipts', function (Blueprint $table) {
            $table->string('pdf_path')->nullable()->after('notes');
        });
    }

    public function down()
    {
        Schema::table('rent_receipts', function (Blueprint $table) {
            $table->dropColumn('pdf_path');
        });
    }
}
