<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\ReceiptType;
use Illuminate\Database\Seeder;

class ReceipttypeSeeder extends Seeder
{
    public static function run(): void
    {
        $receiptTypes = [
            '-',
            'Cash',
            'Cheque',
            'Demand Draft',
            'PhonePe',
            'GPay',
            'Paytm',
            'UPI',
            'RTGS',
            'NEFT',
            'IMPS',
            'Bank Transfer',
            'Credit Card',
            'Debit Card',
            'Net Banking',
            'Wallet Payment',
        ];

        foreach ($receiptTypes as $type) {
            ReceiptType::create([
                'name' => $type,
                'active_id' => '1',
            ]);
        }
    }
}
