<?php

use Aaran\admin\Controllers\SliderController;

use Aaran\admin\Controllers\TenantController;
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

    Route::get('/settings/deploy', fn () => Inertia::render('settings/deploy'));

});

Route::post('/deploy', [DeployController::class, 'run'])
    ->middleware(['auth']);

Route::get('/slow', function () {
    sleep(2); // 2 seconds delay

    return Inertia::render('web/home/index');
});

Route::get('/catalog/{category}', function ($category) {
    return Inertia::render('catalog/category', [
        'category' => $category,
    ]);
})->name('catalog.category');


Route::get('/api/tenant', [TenantController::class, 'current']);


Route::middleware(['auth'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::resource('tenants', TenantController::class);
        Route::resource('sliders', SliderController::class);
    });


require __DIR__.'/settings.php';
