<?php

namespace Aaran;

use Aaran\Web\Providers\WebServiceProvider;
use Illuminate\Support\ServiceProvider;

class AaranServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(WebServiceProvider::class);

    }

    public function boot(): void {}
}
