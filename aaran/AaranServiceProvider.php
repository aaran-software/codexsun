<?php

namespace Aaran;

use Aaran\Blog\Providers\BlogServiceProvider;
use Aaran\Tenant\Providers\TenantServiceProvider;
use Aaran\Web\Providers\WebServiceProvider;
use Illuminate\Support\ServiceProvider;

class AaranServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(TenantServiceProvider::class);
        $this->app->register(WebServiceProvider::class);
        $this->app->register(BlogServiceProvider::class);

    }

    public function boot(): void {}
}
