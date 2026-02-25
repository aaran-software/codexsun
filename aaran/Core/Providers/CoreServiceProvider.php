<?php

namespace Aaran\Core\Providers;

use Illuminate\Support\ServiceProvider;

class CoreServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->getConfig();
    }

    public function getConfig(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../Config/aaran.php', 'aaran-app');
        $this->mergeConfigFrom(__DIR__.'/../Config/software.php', 'software');

        $this->mergeConfigFrom(__DIR__.'/../Settings/developer.php', 'developer');
    }
}
