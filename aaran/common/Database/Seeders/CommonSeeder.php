<?php

namespace Aaran\Common\Database\Seeders;

use Illuminate\Database\Seeder;

class CommonSeeder extends Seeder
{
    public static function run(): void
    {
        CitySeeder::run();
        DistrictSeeder::run();
        StateSeeder::run();
        CountrySeeder::run();
        PincodeSeeder::run();
        HsncodeSeeder::run();
        UnitSeeder::run();
        CategorySeeder::run();
        ColourSeeder::run();
        SizeSeeder::run();
        DepartmentSeeder::run();
        TransportSeeder::run();
        BankSeeder::run();
        ReceipttypeSeeder::run();
        DespatcheSeeder::run();
        GstPercentSeeder::run();
        ContactTypeSeeder::run();
        PaymentModeSeeder::run();
        TransactionTypeSeeder::run();
        AccountTypeSeeder::run();
    }
}
