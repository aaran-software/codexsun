<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Transport;
use Illuminate\Database\Seeder;

class TransportSeeder extends Seeder
{
    public static function run(): void
    {

        Transport::create([
            'name' => '-',
            'vehicle_no' => '1',
            'active_id' => '1',
        ]);

        Transport::create([
            'name' => 'Transport',
            'vehicle_no' => '1',
            'active_id' => '1',
        ]);
    }
}
