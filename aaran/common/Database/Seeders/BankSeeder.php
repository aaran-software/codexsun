<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Bank;
use Illuminate\Database\Seeder;

class BankSeeder extends Seeder
{
    public static function run(): void
    {
        $banks = [
            // Public Sector Banks (PSBs)
            '-',
            'State Bank of India',
            'Punjab National Bank',
            'Bank of Baroda',
            'Canara Bank',
            'Union Bank of India',
            'Bank of India',
            'Indian Bank',
            'Central Bank of India',
            'Indian Overseas Bank',
            'UCO Bank',
            'Bank of Maharashtra',
            'Punjab & Sind Bank',

            // Private Sector Banks
            'HDFC Bank',
            'ICICI Bank',
            'Axis Bank',
            'Kotak Mahindra Bank',
            'IndusInd Bank',
            'Yes Bank',
            'IDFC First Bank',
            'Federal Bank',
            'South Indian Bank',
            'RBL Bank',
            'Bandhan Bank',
            'City Union Bank',
            'Karur Vysya Bank',
            'Tamilnad Mercantile Bank',
            'DCB Bank',
            'IDBI Bank',
            'Jammu & Kashmir Bank',
            'Karnataka Bank',
            'Lakshmi Vilas Bank',
            'Nainital Bank',

            // Small Finance Banks
            'AU Small Finance Bank',
            'Equitas Small Finance Bank',
            'Ujjivan Small Finance Bank',
            'Jana Small Finance Bank',

            // Foreign Banks
            'Citibank',
            'Standard Chartered Bank',
            'HSBC Bank',
            'DBS Bank',
        ];

        foreach ($banks as $bank) {
            Bank::create([
                'name' => $bank,
                'active_id' => '1',
            ]);
        }
    }
}
