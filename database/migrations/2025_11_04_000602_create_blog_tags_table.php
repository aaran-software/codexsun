<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Aaran\Assets\Features\Customise::hasBlog()) {

            Schema::create('blog_tags', function (Blueprint $table) {
                $table->id();
                $table->string('vname')->unique();
                $table->foreignId('blog_category_id')->references('id')->on('blog_categories');
                $table->tinyInteger('active_id')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_tags');
    }
};
