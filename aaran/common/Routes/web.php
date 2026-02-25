<?php

use Aaran\Blog\Controllers\CategoryController;
use Aaran\Common\Controllers\AccountTypeController;
use Aaran\Common\Controllers\BankController;
use Aaran\Common\Controllers\CityController;
use Aaran\Common\Controllers\ColourController;
use Aaran\Common\Controllers\ContactTypeController;
use Aaran\Common\Controllers\CountryController;
use Aaran\Common\Controllers\DepartmentController;
use Aaran\Common\Controllers\DespatchController;
use Aaran\Common\Controllers\DistrictController;
use Aaran\Common\Controllers\GstPercentController;
use Aaran\Common\Controllers\HsncodeController;
use Aaran\Common\Controllers\PaymentModeController;
use Aaran\Common\Controllers\PincodeController;
use Aaran\Common\Controllers\ReceiptTypeController;
use Aaran\Common\Controllers\SizeController;
use Aaran\Common\Controllers\StateController;
use Aaran\Common\Controllers\TransactionTypeController;
use Aaran\Common\Controllers\TransportController;
use Aaran\Common\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

// Common
Route::middleware(['auth'])->group(function () {

    Route::resource('/cities', CityController::class);
    Route::resource('/districts', DistrictController::class);
    Route::resource('/states', StateController::class);
    Route::resource('/pin-codes', PincodeController::class);
    Route::resource('/countries', CountryController::class);
    Route::resource('/hsn-codes', HsncodeController::class);
    Route::resource('/units', UnitController::class);
    Route::resource('/categories', CategoryController::class);
    Route::resource('/colours', ColourController::class);
    Route::resource('/sizes', SizeController::class);
    Route::resource('/departments', DepartmentController::class);
    Route::resource('/transports', TransportController::class);
    Route::resource('/banks', BankController::class);
    Route::resource('/receipt-types', ReceiptTypeController::class);
    Route::resource('/despatches', DespatchController::class);
    Route::resource('/gst-percents', GstPercentController::class);
    Route::resource('/contact-types', ContactTypeController::class);
    Route::resource('/accountTypes', AccountTypeController::class);
    Route::resource('/payment-modes', PaymentModeController::class);
    Route::resource('/transaction-type', TransactionTypeController::class);

    // Bulk actions - using POST + _method spoofing (most reliable with Inertia)
    Route::post('/cities/bulk-activate',   [CityController::class, 'bulkActivate'])->name('cities.bulk-activate');
    Route::post('/cities/bulk-deactivate', [CityController::class, 'bulkDeactivate'])->name('cities.bulk-deactivate');
    Route::post('/cities/bulk-destroy',    [CityController::class, 'bulkDestroy'])->name('cities.bulk-destroy');

    Route::post('/districts/bulk-activate',   [DistrictController::class, 'bulkActivate'])->name('districts.bulk-activate');
    Route::post('/districts/bulk-deactivate', [DistrictController::class, 'bulkDeactivate'])->name('districts.bulk-deactivate');
    Route::post('/districts/bulk-destroy',    [DistrictController::class, 'bulkDestroy'])->name('districts.bulk-destroy');


});
