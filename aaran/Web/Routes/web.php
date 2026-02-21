<?php

use Inertia\Inertia;

Route::get('/abouts', function () {
    return Inertia::render('web/abouts/index');
})->name('abouts');

Route::get('/services', function () {
    return Inertia::render('web/services/index');
})->name('services');

Route::prefix('blog')->name('blog.')->group(function () {
    Route::get('/', [BlogController::class, 'index'])->name('index');
    Route::get('/{blog}', [BlogController::class, 'show'])->name('show');
});

Route::get('/web-contacts', function () {
    return Inertia::render('web/web-contacts/index');
})->name('web-contacts');
