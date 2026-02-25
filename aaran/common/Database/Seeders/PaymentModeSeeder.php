<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\PaymentMode;
use Illuminate\Database\Seeder;

class PaymentModeSeeder extends Seeder
{
    public static function run(): void
    {
        PaymentMode::create([
            'name' => 'Payment',
            'active_id' => '1'
        ]);

        PaymentMode::create([
            'name' => 'Receipt',
            'active_id' => '1'
        ]);

    }
}
