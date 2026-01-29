<?php

namespace Aaran\Stock\Database\Seeders;

use Aaran\Blog\Models\BlogCategory;
use Aaran\Stock\Models\ProductType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductTypeSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            'Goods',
            'Services',
        ];

        foreach ($items as $name) {
            ProductType::create([
                'name' => $name,
                'active_id' => 1,
            ]);
        }
    }
}
