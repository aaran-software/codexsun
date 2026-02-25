<?php

namespace Aaran\Blog\Providers;

use Illuminate\Support\ServiceProvider;

class BlogServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Blog';

    protected string $moduleNameLower = 'blog';

    public function register(): void
    {
        $this->app->register(BlogRouteProvider::class);
    }

    public function boot(): void
    {
        $this->registerMigrations();

    }

    private function registerMigrations(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
