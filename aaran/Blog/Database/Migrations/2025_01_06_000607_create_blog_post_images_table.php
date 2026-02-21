<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
            Schema::create('blog_post_images', function (Blueprint $table) {
                $table->id();
                $table->foreignId('blog_post_id')
                    ->constrained('blog_posts')
                    ->onDelete('cascade'); // Delete images if post is deleted

                $table->string('image_path');           // e.g., "blog/posts/123/image1.jpg"
                $table->string('alt_text')->nullable(); // For SEO & accessibility
                $table->text('caption')->nullable();    // Optional caption for gallery
                $table->unsignedInteger('sort_order')->default(0); // For manual ordering

                $table->timestamps();

                // Indexes for performance
                $table->index('blog_post_id');
                $table->index('sort_order');
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_post_images');
    }
};
