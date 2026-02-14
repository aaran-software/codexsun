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
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->text('tagline')->nullable();

            $table->string('action_text')->nullable();
            $table->string('action_link')->nullable();

            $table->enum('media_type', ['image', 'video', 'youtube']);
            $table->string('media_src')->nullable(); // image or video path
            $table->string('youtube_id')->nullable();

            $table->json('highlights')->nullable();

            $table->string('btn_cta')->nullable();

            $table->enum('direction', ['left', 'right', 'fade'])->default('left');
            $table->enum('background_mode', ['normal', 'parallax', '3d', 'cinematic'])->default('normal');
            $table->enum('intensity', ['low', 'medium', 'high'])->default('medium');

            $table->integer('duration')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sliders');
    }
};
