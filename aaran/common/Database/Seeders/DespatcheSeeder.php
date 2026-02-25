<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Despatch;
use Illuminate\Database\Seeder;

class DespatcheSeeder extends Seeder
{
    public static function run(): void
    {
        Despatch::create([
            'name' => '-',
            'vdate' => '-',
            'active_id' => '1',
        ]);
    }
}
