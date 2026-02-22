<?php

use Aaran\Tenant\Controllers\StorefrontController;
use Aaran\Tenant\Controllers\ThemeController;

Route::get('/storefront', [StorefrontController::class, 'index'])->name('storefront');

Route::post('/theme/switch', [ThemeController::class, 'switch'])
    ->name('theme.switch');
