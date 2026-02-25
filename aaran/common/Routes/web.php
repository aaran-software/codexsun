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
Route::middleware(['auth', 'tenant'])->group(function () {

    Route::get('/cities', [CityController::class, 'index'])->name('cities');
    Route::get('/districts', [DistrictController::class, 'index'])->name('districts');
    Route::get('/states', [StateController::class, 'index'])->name('states');
    Route::get('/pin-codes', [PincodeController::class, 'index'])->name('pin-codes');
    Route::get('/countries', [CountryController::class, 'index'])->name('countries');
    Route::get('/hsn-codes', [HsncodeController::class, 'index'])->name('hsn-codes');
    Route::get('/units', [UnitController::class, 'index'])->name('units');
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
    Route::get('/colours', [ColourController::class, 'index'])->name('colours');
    Route::get('/sizes', [SizeController::class, 'index'])->name('sizes');
    Route::get('/departments', [DepartmentController::class, 'index'])->name('departments');
    Route::get('/transports', [TransportController::class, 'index'])->name('transports');
    Route::get('/banks', [BankController::class, 'index'])->name('banks');
    Route::get('/receipt-types', [ReceiptTypeController::class, 'index'])->name('receipt-types');
    Route::get('/despatches', [DespatchController::class, 'index'])->name('despatches');
    Route::get('/gst-percents', [GstPercentController::class, 'index'])->name('gst-percents');
    Route::get('/contact-types', [ContactTypeController::class, 'index'])->name('contact-types');
    Route::get('/accountTypes', [AccountTypeController::class, 'index'])->name('accountTypes');
    Route::get('/payment-modes', [PaymentModeController::class, 'index'])->name('payment-modes');
    Route::get('/transaction-type', [TransactionTypeController::class, 'index'])->name('transaction-type-list');

});
