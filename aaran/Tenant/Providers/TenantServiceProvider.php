<?php

namespace Aaran\Tenant\Providers;

use Illuminate\Support\ServiceProvider;

class TenantServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Blog';

    protected string $moduleNameLower = 'blog';

    public function register(): void
    {
        $this->app->register(TenantRouteProvider::class);
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
