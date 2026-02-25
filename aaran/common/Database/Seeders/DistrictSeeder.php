<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\District;
use Illuminate\Database\Seeder;

class DistrictSeeder extends Seeder
{
    public static function run(): void
    {
        $districts = [
            '-', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode',
            'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam',
            'Kanniyakumari', 'Namakkal', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem',
            'Sivagangai', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
            'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
        ];

        foreach ($districts as $district) {
            District::create([
                'name' => $district,
                'active_id' => '1',
            ]);
        }
    }
}
