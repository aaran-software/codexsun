<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Aaran\Assets\Features\Customise::hasBlog()) {

            Schema::create('blog_posts', function (Blueprint $table) {
                $table->id();
                $table->string('vname');
                $table->longText('body');
                $table->longText('image')->nullable();
                $table->foreignId('blog_category_id')->references('id')->on('blog_categories');
                $table->foreignId('blog_tag_id')->references('id')->on('blog_tags');
                $table->foreignId('user_id')->references('id')->on('users');
                $table->boolean('visibility')->nullable();
                $table->tinyInteger('active_id')->nullable();
                $table->timestamps();
            });

        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
