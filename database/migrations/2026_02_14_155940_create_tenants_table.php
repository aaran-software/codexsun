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

            /*
            |--------------------------------------------------------------------------
            | Identity
            |--------------------------------------------------------------------------
            */
            $table->string('key')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('industry')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Domain
            |--------------------------------------------------------------------------
            */
            $table->string('domain')->nullable()->unique();
            $table->string('custom_domain')->nullable()->unique();
            $table->boolean('force_https')->default(true);

            /*
            |--------------------------------------------------------------------------
            | Branding & Config
            |--------------------------------------------------------------------------
            */
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->json('theme')->nullable();
            $table->json('settings')->nullable();
            $table->json('features')->nullable();
            $table->json('seo')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */
            $table->boolean('is_active')->default(true);
            $table->boolean('is_suspended')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['domain', 'custom_domain']);
            $table->index('is_active');
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
