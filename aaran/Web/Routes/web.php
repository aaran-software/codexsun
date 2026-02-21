<?php

use Inertia\Inertia;

Route::get('/abouts', function () {
    return Inertia::render('web/abouts/index');
})->name('abouts');

Route::get('/services', function () {
    return Inertia::render('web/services/index');
})->name('services');


Route::get('/web-contacts', function () {
    return Inertia::render('web/web-contacts/index');
})->name('web-contacts');
