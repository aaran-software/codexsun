<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public static function run(): void
    {
        $countries = [
            ['India', 'IN', '₹'],
            ['-', '-', '-'],
            ['United States', 'US', '$'],
            ['Canada', 'CA', 'C$'],
            ['United Kingdom', 'GB', '£'],
            ['Germany', 'DE', '€'],
            ['France', 'FR', '€'],
            ['Italy', 'IT', '€'],
            ['Spain', 'ES', '€'],
            ['Australia', 'AU', 'A$'],
            ['China', 'CN', '¥'],
            ['Japan', 'JP', '¥'],
            ['South Korea', 'KR', '₩'],
            ['Brazil', 'BR', 'R$'],
            ['Mexico', 'MX', '$'],
            ['Russia', 'RU', '₽'],
            ['South Africa', 'ZA', 'R'],
            ['Saudi Arabia', 'SA', '﷼'],
            ['United Arab Emirates', 'AE', 'د.إ'],
            ['Argentina', 'AR', '$'],
            ['Indonesia', 'ID', 'Rp'],
            ['Turkey', 'TR', '₺'],
            ['Sweden', 'SE', 'kr'],
            ['Netherlands', 'NL', '€'],
            ['Switzerland', 'CH', 'CHF'],
            ['Singapore', 'SG', 'S$']
        ];

        foreach ($countries as [$name, $code, $currency]) {
            Country::create([
                'name' => $name,
                'country_code' => $code,
                'currency_symbol' => $currency,
                'active_id' => '1'
            ]);
        }
    }
}
