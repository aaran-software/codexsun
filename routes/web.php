<?php

use Aaran\Blog\Controllers\BlogController;
use Aaran\Shop\Controllers\CustomController;
use Aaran\Shop\Controllers\ShopController;
use Aaran\Web\Controllers\AboutController;
use Aaran\Web\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [AboutController::class, 'index'])->name('about');

Route::prefix('shop')->name('shop.')->group(function () {
    Route::get('/', [ShopController::class, 'index'])->name('index');
});

Route::get('/custom-pc', [CustomController::class, 'builder'])->name('custom-pc');
Route::get('/custom-pc/builder', [CustomController::class, 'builder'])->name('custom-pc.builder');
Route::get('/custom-pc/cart', [CustomController::class, 'cart'])->name('custom-pc.cart');

Route::prefix('blog')->name('blog.')->group(function () {
    Route::get('/', [BlogController::class, 'index'])->name('index');
    Route::get('/{blog}', [BlogController::class, 'show'])->name('show');
});



Route::get('/service', function () {
    return Inertia::render('Web/services/index');
})->name('service');


Route::get('/web-contact', function () {
    return Inertia::render('Web/web-contacts/index');
})->name('web-contact');


Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/settings.php';
