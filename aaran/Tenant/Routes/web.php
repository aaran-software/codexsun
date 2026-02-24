<?php

use Aaran\Tenant\Controllers\DomainController;
use Aaran\Tenant\Controllers\FeatureController;
use Aaran\Tenant\Controllers\StorefrontController;
use Aaran\Tenant\Controllers\TenantController;
use Aaran\Tenant\Controllers\TenantFeatureController;
use Aaran\Tenant\Controllers\ThemeController;

Route::get('/storefront', [StorefrontController::class, 'index'])->name('storefront');

Route::post('/theme/switch', [ThemeController::class, 'switch'])
    ->name('theme.switch');

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {

    Route::resource('tenants', TenantController::class);

    Route::patch('tenants/{id}/restore', [TenantController::class, 'restore'])->name('tenants.restore');

    Route::get('tenants/current', [TenantController::class, 'current'])->name('tenants.current');

    Route::resource('domains', DomainController::class);
    Route::patch('domains/{id}/restore', [DomainController::class, 'restore'])->name('domains.restore');


    Route::resource('features', FeatureController::class);
    Route::resource('tenant-features', TenantFeatureController::class);

});
