<?php

use Aaran\Blog\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('blog')->group(function () {

    // Blog Categories
    Route::get('categories', [CategoryController::class, 'index'])
        ->name('blog.categories.index');
    Route::get('categories/create', [CategoryController::class, 'create'])
        ->name('blog.categories.create');
    Route::post('categories', [CategoryController::class, 'store'])
        ->name('blog.categories.store');
    Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])
        ->name('blog.categories.edit');
    Route::put('categories/{category}', [CategoryController::class, 'update'])
        ->name('blog.categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])
        ->name('blog.categories.destroy');


});
