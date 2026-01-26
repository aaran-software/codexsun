<?php

use App\Http\Controllers\Settings\DeployController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Route::get('/', function () {
//    return Inertia::render('welcome', [
//        'canRegister' => Features::enabled(Features::registration()),
//    ]);
// })->name('home');

Route::get('/', function () {
    return Inertia::render('web/home/index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/abouts', function () {
    return Inertia::render('web/abouts/index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('abouts');

Route::get('/services', function () {
    return Inertia::render('web/services/index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('services');

Route::get('/blogs', function () {
    return Inertia::render('web/blogs/index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('blogs');

Route::get('/web-contacts', function () {
    return Inertia::render('web/web-contacts/index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('web-contacts');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('todos', function () {
        return Inertia::render('todos');
    })->name('todos');

    Route::post('deploy', [DeployController::class, 'update'])->name('deploy.update');
    Route::get('/settings/deploy', fn () => Inertia::render('settings/deploy'));

});

require __DIR__.'/settings.php';
