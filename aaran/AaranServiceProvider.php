<?php

namespace Aaran;

use Aaran\admin\providers\AdminServiceProvider;
use Aaran\Blog\Providers\BlogServiceProvider;
use Aaran\Core\Providers\CoreServiceProvider;
use Aaran\Core\Tenant\Tenant;
use Aaran\Ecart\Providers\EcartServiceProvider;
use Aaran\Stock\Providers\StockServiceProvider;
use Illuminate\Support\ServiceProvider;

class AaranServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(CoreServiceProvider::class);
        $this->app->register(AdminServiceProvider::class);
        $this->app->register(BlogServiceProvider::class);
//        $this->app->register(EcartServiceProvider::class);
//        $this->app->register(StockServiceProvider::class);

    }

    public function boot(): void
    {
        if ($industry = Tenant::industry()) {
            config(['aaran-app.app_code' => config("software.$industry")]);
        }
    }
}
