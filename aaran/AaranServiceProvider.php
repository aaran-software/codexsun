<?php

namespace Aaran;

use Aaran\Blog\Providers\BlogServiceProvider;
use Aaran\Core\Providers\CoreServiceProvider;
use Illuminate\Support\ServiceProvider;

class AaranServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(CoreServiceProvider::class);
        $this->app->register(BlogServiceProvider::class);

    }

}
