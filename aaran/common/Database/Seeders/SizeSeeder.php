<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Size;
use Illuminate\Database\Seeder;

class SizeSeeder extends Seeder
{
    public static function run(): void
    {
        $sizes = [
            ['-', '-'],
            ['XS', 'Extra Small'],
            ['S', 'Small'],
            ['M', 'Medium'],
            ['L', 'Large'],
            ['XL', 'Extra Large'],
            ['XXL', 'Double Extra Large'],
            ['XXXL', 'Triple Extra Large'],
            ['4XL', 'Four Extra Large'],
            ['5XL', 'Five Extra Large'],
            ['All', 'All Size'],

            // Kids' Sizes
            ['0-3M', '0-3 Months'],
            ['3-6M', '3-6 Months'],
            ['6-12M', '6-12 Months'],
            ['1Y', '1 Year'],
            ['2Y', '2 Years'],
            ['3Y', '3 Years'],
            ['4Y', '4 Years'],
            ['5Y', '5 Years'],
            ['6Y', '6 Years'],
            ['7Y', '7 Years'],
            ['8Y', '8 Years'],
            ['9Y', '9 Years'],
            ['10Y', '10 Years'],
        ];

        foreach ($sizes as [$name, $description]) {
            Size::create([
                'name' => $name,
                'description' => $description,
                'active_id' => '1'
            ]);
        }
    }

}
