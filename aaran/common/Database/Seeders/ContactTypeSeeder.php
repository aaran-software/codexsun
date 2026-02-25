<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\ContactType;
use Illuminate\Database\Seeder;

class ContactTypeSeeder extends Seeder
{
    public static function run(): void
    {
        $contactTypes = [
            1 => '-',
            2 => 'Creditors',
            3 => 'Debtors',
        ];

        foreach ($contactTypes as $id => $name) {
            ContactType::create([
                'id' => $id,
                'name' => $name,
                'active_id' => '1',
            ]);
        }
    }
}
