<?php

namespace Aaran\Blog\Database\Seeders;

use Aaran\Blog\Models\BlogCategory;
use Aaran\Blog\Models\BlogPost;
use Aaran\Blog\Models\BlogTag;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Str;

class BlogDemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $category1 = BlogCategory::where('slug', 'laptop-reviews')->first();
        $category2 = BlogCategory::where('slug', 'repair-service')->first();

        $post1 = BlogPost::create([
            'title' => 'Best Budget Laptops for 2025 in Our Store',
            'slug' => Str::slug('Best Budget Laptops for 2025 in Our Store'),
            'excerpt' => 'We review the top budget laptops available for sale with excellent performance for daily use and light gaming.',
            'body' => '<p>Detailed review content here...</p>',
            'featured_image' => 'blog/featured/budget-laptops-2025.jpg',
            'blog_category_id' => $category1->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);

        $post1->tags()->attach(BlogTag::whereIn('slug', ['laptop', 'budget-build', 'new-arrival'])->pluck('id'));

        $post2 = BlogPost::create([
            'title' => 'How to Fix Common Laptop Overheating Issues',
            'slug' => Str::slug('How to Fix Common Laptop Overheating Issues'),
            'excerpt' => 'Step-by-step guide from our service team on diagnosing and repairing overheating problems.',
            'body' => '<p>Service guide content here...</p>',
            'featured_image' => 'blog/featured/overheating-fix.jpg',
            'blog_category_id' => $category2->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);

        $post2->tags()->attach(BlogTag::whereIn('slug', ['repair', 'laptop', 'hardware-tips'])->pluck('id'));
    }
}
