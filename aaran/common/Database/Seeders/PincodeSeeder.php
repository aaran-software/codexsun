<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Pincode;
use Illuminate\Database\Seeder;

class PincodeSeeder extends Seeder
{
    public static function run(): void
    {
        $pincodes = [
            '-',
            '641601', '641602', '641603', '641604', '641605', '641606', // Tiruppur
            '600001', // Chennai
            '110001', // Delhi
            '400001', // Mumbai
            '700001', // Kolkata
            '560001', // Bangalore
            '500001', // Hyderabad
            '380001', // Ahmedabad
            '302001', // Jaipur
            '751001', // Bhubaneswar
            '462001', // Bhopal
            '682001', // Kochi
            '695001', // Thiruvananthapuram
            '144001', // Jalandhar
            '800001', // Patna
            '226001', // Lucknow
        ];

        foreach ($pincodes as $pincode) {
            Pincode::create([
                'name' => $pincode,
                'active_id' => '1',
            ]);
        }
    }
}
