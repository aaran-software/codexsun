<?php

namespace Aaran\Ecart\Providers;

use Illuminate\Support\ServiceProvider;

class EcartServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Ecart';
    protected string $moduleNameLower = 'Ecart';

    public function register(): void
    {
        $this->app->register(EcartRouteProvider::class);
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
