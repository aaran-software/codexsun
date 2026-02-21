<?php

namespace Aaran\Blog\Database\Seeders;

use Aaran\Blog\Models\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Laptop Reviews',
            'Desktop Builds',
            'Hardware Tips',
            'Software Guides',
            'Repair & Service',
            'Sales & Offers',
            'Gaming Setup',
            'Accessories',
        ];

        foreach ($categories as $name) {
            BlogCategory::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'active_id' => 1,
            ]);
        }
    }
}
