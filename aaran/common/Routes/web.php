<?php

use Aaran\BMS\Billing\Common\Livewire\Class;
use Illuminate\Support\Facades\Route;

//Common
Route::middleware(['auth', 'tenant'])->group(function () {

    Route::get('/cities', Class\CityList::class)->name('cities');
    Route::get('/districts', Class\DistrictList::class)->name('districts');
    Route::get('/states', Class\StateList::class)->name('states');
    Route::get('/pin-codes', Class\PincodeList::class)->name('pin-codes');
    Route::get('/countries', Class\CountryList::class)->name('countries');
    Route::get('/hsn-codes', Class\HsncodeList::class)->name('hsn-codes');
    Route::get('/units', Class\UnitList::class)->name('units');
    Route::get('/categories', Class\CategoryList::class)->name('categories');
    Route::get('/colours', Class\ColourList::class)->name('colours');
    Route::get('/sizes', Class\SizeList::class)->name('sizes');
    Route::get('/departments', Class\DepartmentList::class)->name('departments');
    Route::get('/transports', Class\TransportList::class)->name('transports');
    Route::get('/banks', Class\BankList::class)->name('banks');
    Route::get('/receipt-types', Class\ReceiptTypeList::class)->name('receipt-types');
    Route::get('/despatches', Class\DespatchList::class)->name('despatches');
    Route::get('/gst-percents', Class\GstPercentList::class)->name('gst-percents');
    Route::get('/contact-types', Class\ContactTypeList::class)->name('contact-types');
    Route::get('/accountTypes', Class\AccountTypeList::class)->name('accountTypes');
    Route::get('/payment-modes', Class\PaymentModeList::class)->name('payment-modes');
    Route::get('/transaction-type', Class\TransactionTypeList::class)->name('transaction-type-list');


});
