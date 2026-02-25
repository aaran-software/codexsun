<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        if (Aaran\Core\Features\Customise::hasCommon()) {

            Schema::create('receipt_types', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->tinyInteger('active_id')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('receipt_types');
    }
};
