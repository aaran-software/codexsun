<?php

namespace Aaran\Web\Providers;

use Illuminate\Support\ServiceProvider;

class WebServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'Web';

    protected string $moduleNameLower = 'web';

    public function register(): void
    {
        $this->app->register(WebRouteProvider::class);
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
