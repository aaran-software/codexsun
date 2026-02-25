<?php

namespace Aaran\BMS\Billing\Common\Providers;

use Aaran\BMS\Billing\Common\Livewire\Class;
use Illuminate\Support\ServiceProvider;
use Livewire\Livewire;

class CommonServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(CommonRouteProvider::class);
        $this->loadViews();
    }

    public function boot(): void
    {
        Livewire::component('common::city-list', Class\CityList::class);
        Livewire::component('common::district-list', Class\DistrictList::class);
        Livewire::component('common::state-list', Class\StateList::class);
        Livewire::component('common::pincode-list', Class\PincodeList::class);
        Livewire::component('common::country-list', Class\CountryList::class);
        Livewire::component('common::hsncode-list', Class\HsncodeList::class);
        Livewire::component('common::unit-list', Class\UnitList::class);
        Livewire::component('common::category-list', Class\CategoryList::class);
        Livewire::component('common::colour-list', Class\ColourList::class);
        Livewire::component('common::size-list', Class\SizeList::class);
        Livewire::component('common::department-list', Class\DepartmentList::class);
        Livewire::component('common::transport-list', Class\TransportList::class);
        Livewire::component('common::gst-list', Class\GstPercentList::class);
        Livewire::component('common::receipt-type-list', Class\ReceiptTypeList::class);
        Livewire::component('common::dispatch-list', Class\DespatchList::class);
        Livewire::component('common::payment-mode-list', Class\PaymentModeList::class);
        Livewire::component('common::bank-list', Class\BankList::class);
        Livewire::component('common::contact-type-list', Class\ContactTypeList::class);
        Livewire::component('common::account-type-list', Class\AccountTypeList::class);

        Livewire::component('common::lookup.city', Class\Lookup\CityLookup::class);
        Livewire::component('common::lookup.state', Class\Lookup\StateLookup::class);
        Livewire::component('common::lookup.pincode', Class\Lookup\PinCodeLookup::class);
        Livewire::component('common::lookup.country', Class\Lookup\CountryLookup::class);
        Livewire::component('common::lookup.colour', Class\Lookup\ColourLookup::class);
        Livewire::component('common::lookup.size', Class\Lookup\SizeLookup::class);
        Livewire::component('common::lookup.transport', Class\Lookup\TransportLookup::class);
        Livewire::component('common::lookup.transaction-type', Class\Lookup\TransactionTypeLookup::class);
        Livewire::component('common::lookup.bank', Class\Lookup\BankLookup::class);
        Livewire::component('common::lookup.account-type', Class\Lookup\AccountTypeLookup::class);
        Livewire::component('common::lookup.payment-method', Class\Lookup\PaymentMethodLookup::class);
    }

    protected function loadViews(): void
    {
        $this->loadViewsFrom(__DIR__.'/../Livewire/Views', 'common');
    }
}
