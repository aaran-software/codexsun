<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('original_price', 12, 2)->nullable();
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();           // multiple images
            $table->integer('stock_quantity')->default(0);
            $table->boolean('in_stock')->default(true);
            $table->decimal('rating', 3, 1)->nullable();
            $table->integer('review_count')->default(0);
            $table->string('badge')->nullable();           // New, Sale, Hot, ...
            $table->boolean('is_featured')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'slug']);
            $table->index(['tenant_id', 'category_id']);
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
