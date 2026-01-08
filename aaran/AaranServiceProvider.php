<?php

namespace Aaran;

use Aaran\Blog\Providers\BlogServiceProvider;
use Aaran\Core\Providers\CoreServiceProvider;
use Aaran\Ecart\Providers\EcartServiceProvider;
use Aaran\Stock\Providers\StockServiceProvider;
use Illuminate\Support\ServiceProvider;

class AaranServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(CoreServiceProvider::class);
        $this->app->register(BlogServiceProvider::class);
        $this->app->register(EcartServiceProvider::class);
        $this->app->register(StockServiceProvider::class);

    }

}
