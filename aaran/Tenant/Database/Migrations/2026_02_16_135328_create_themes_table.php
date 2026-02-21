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
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreignId('preset_id')
                ->nullable()
                ->constrained('theme_presets')
                ->nullOnDelete();

            $table->string('mode')->default('light'); // light | dark
            $table->json('custom_variables')->nullable();
            $table->string('primary_override')->nullable();

            $table->timestamps();
            $table->unique('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('themes');
    }
};
