<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public static function run(): void
    {
        $units = [
            ['-', '-'],
            ['KGS', 'Kilogram'],
            ['PCS', 'Pieces'],
            ['NOS', 'Numbers'],
            ['LTR', 'Litre'],
            ['GMS', 'Gram'],
            ['ROLL', 'Roll'],
            ['SET', 'Set'],
            ['MG', 'Milligram'],
            ['TON', 'Metric Ton'],
            ['LBS', 'Pound'],
            ['OZ', 'Ounce'],
            ['ML', 'Millilitre'],
            ['GAL', 'Gallon'],
            ['MTR', 'Meter'],
            ['CM', 'Centimeter'],
            ['MM', 'Millimeter'],
            ['FT', 'Foot'],
            ['IN', 'Inch'],
            ['YD', 'Yard'],
            ['SQM', 'Square Meter'],
            ['SQFT', 'Square Foot'],
            ['CBM', 'Cubic Meter'],
            ['CBFT', 'Cubic Foot'],
            ['DOZ', 'Dozen'],
            ['PKT', 'Packet'],
            ['BOX', 'Box'],
            ['BAG', 'Bag'],
            ['PAIR', 'Pair'],
            ['BUNDLE', 'Bundle'],
            ['CONE', 'Cone'],
            ['SPOOL', 'Spool'],
            ['SHEET', 'Sheet'],
            ['TUBE', 'Tube'],
            ['CAN', 'Can'],
        ];

        foreach ($units as [$name, $description]) {
            Unit::create([
                'name' => $name,
                'description' => $description,
                'active_id' => '1',
            ]);
        }
    }
}
