<?php

namespace Aaran\Stock\Providers;

use Illuminate\Support\ServiceProvider;

class StockServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Stock';
    protected string $moduleNameLower = 'Stock';

    public function register(): void
    {
        $this->app->register(StockRouteProvider::class);
    }

    public function boot(): void
    {
        $this->registerMigrations();

    }

    private function registerMigrations(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
    }

}
