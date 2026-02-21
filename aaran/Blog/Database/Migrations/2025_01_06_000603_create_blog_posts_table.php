<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
            Schema::create('blog_posts', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('excerpt')->nullable();
                $table->longText('body');
                $table->string('featured_image')->nullable();// e.g., primary thumbnail
                $table->foreignId('blog_category_id')->references('id')->on('blog_categories');
                $table->foreignId('user_id')->references('id')->on('users');
                $table->json('meta_keywords')->nullable();
                $table->boolean('published')->default(true);
                $table->tinyInteger('active_id')->default(1);
                $table->timestamps();
                $table->softDeletes();

                $table->index('blog_category_id');
                $table->index('published');
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
