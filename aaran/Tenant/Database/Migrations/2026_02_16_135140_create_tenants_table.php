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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->string('name');
            $table->string('display_name');
            $table->string('tagline')->nullable();
            $table->string('slug')->unique();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('settings')->nullable();
            $table->foreignId('plan_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_suspended')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_active', 'is_suspended']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
