<?php

namespace Aaran\Blog\Database\Seeders;

use Aaran\Blog\Models\BlogTag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogTagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'laptop', 'desktop', 'gaming', 'repair', 'windows', 'linux',
            'ssd', 'ram-upgrade', 'virus-removal', 'data-recovery',
            'discount', 'new-arrival', 'budget-build', 'high-end',
        ];

        foreach ($tags as $name) {
            BlogTag::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'active_id' => 1,
            ]);
        }
    }
}
