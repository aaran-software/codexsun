<?php

use Aaran\Blog\Controllers\CategoryController;
use Aaran\Stock\Controllers\ProductTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('stock')->group(function () {

    // Blog Categories
    Route::get('product_types', [ProductTypeController::class, 'index'])
        ->name('stock.product_types.index');

});
