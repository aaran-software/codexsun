<?php

namespace Aaran\Shop\Providers;

use Illuminate\Support\ServiceProvider;

class ShopServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Blog';

    protected string $moduleNameLower = 'blog';

    public function register(): void
    {
        $this->app->register(ShopRouteProvider::class);
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
