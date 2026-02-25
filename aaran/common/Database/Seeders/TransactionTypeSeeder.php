<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\TransactionType;
use Illuminate\Database\Seeder;

class TransactionTypeSeeder extends Seeder
{
    public static function run(): void
    {
        TransactionType::create([
           'name' => 'CASH',
           'active_id' => 1,
        ]);

        TransactionType::create([
            'name' => 'BANK',
            'active_id' => 1,
        ]);

        TransactionType::create([
            'name' => 'UPI',
            'active_id' => 1,
        ]);

        TransactionType::create([
            'name' => '-',
            'active_id' => 1,
        ]);

    }
}
