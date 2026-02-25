<?php

namespace Aaran\Common\Providers;

use Illuminate\Support\ServiceProvider;

class CommonServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Common';

    protected string $moduleNameLower = 'common';

    public function register(): void
    {
        $this->app->register(CommonRouteProvider::class);
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
