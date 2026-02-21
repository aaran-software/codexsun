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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_group_id')
                ->references('id')->on('menu_groups')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('url')->nullable();

            $table->integer('position')->default(0);
            $table->boolean('is_active')->default(true);

            // 🔥 Feature-based visibility
            $table->string('feature_key')->nullable();

            $table->timestamps();

            $table->index(['menu_group_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
