<?php

use Aaran\Web\Controllers\AboutController;
use Aaran\Web\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [AboutController::class, 'index'])->name('about');


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
