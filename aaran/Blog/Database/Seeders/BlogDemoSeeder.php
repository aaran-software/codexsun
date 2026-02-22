<?php

namespace Aaran\Blog\Database\Seeders;

use Aaran\Blog\Models\BlogCategory;
use Aaran\Blog\Models\BlogPost;
use Aaran\Blog\Models\BlogTag;
use App\Models\User;
use Illuminate\Database\Seeder;
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
            'featured_image' => 'assets/techmedia/blogs/budget-laptops-2025.jpg',
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
            'featured_image' => 'assets/techmedia/blogs/overheating-fix.jpg',
            'blog_category_id' => $category2->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);

        $post2->tags()->attach(BlogTag::whereIn('slug', ['repair', 'laptop', 'hardware-tips'])->pluck('id'));

        // Post 3 – Review
        $post3 = BlogPost::create([
            'title' => 'Top 5 Gaming Laptops Under ₹80,000 in 2025',
            'slug' => Str::slug('Top 5 Gaming Laptops Under ₹80,000 in 2025'),
            'excerpt' => 'Looking for solid 1080p gaming performance without breaking the bank? Here are our current top picks available in India.',
            'body' => '<p>1. Acer Nitro 5 (Ryzen 5 7535HS + RTX 4050)<br>2. Lenovo LOQ 15 (i5-12450H + RTX 4050)<br>3. MSI Thin GF63 (i5-12450H + RTX 4050)<br>4. HP Victus 15 (Ryzen 5 8645HS + RTX 4050)<br>5. ASUS TUF Gaming A15 (Ryzen 7 7735HS + RTX 4050)<br><br>Full comparison of thermals, battery, display quality, and upgradeability...</p>',
            'featured_image' => 'assets/techmedia/blogs/gaming-laptops-under-80k-2025.jpg',
            'blog_category_id' => $category2?->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);
        $post3->tags()->attach(BlogTag::whereIn('slug', ['gaming-laptop', 'budget-gaming', 'rtx-4050', '2025'])->pluck('id'));

        // Post 4 – Service / Repair
        $post4 = BlogPost::create([
            'title' => 'How to Replace a Laptop Screen – Step-by-Step Guide',
            'slug' => Str::slug('How to Replace a Laptop Screen – Step-by-Step Guide'),
            'excerpt' => 'Cracked screen? We show you how to safely replace it yourself or what to expect when bringing it to our service center.',
            'body' => '<p>Tools needed • Compatible panel lookup • Cable disconnection guide • Reassembly tips • Common mistakes to avoid • When to go professional instead...</p>',
            'featured_image' => 'assets/techmedia/blogs/laptop-screen-replacement.jpg',
            'blog_category_id' => $category2?->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);
        $post4->tags()->attach(BlogTag::whereIn('slug', ['screen-replacement', 'diy-repair', 'laptop-service', 'hardware'])->pluck('id'));

        // Post 5 – Review
        $post5 = BlogPost::create([
            'title' => 'Best Laptops for Engineering Students in 2025 (India)',
            'slug' => Str::slug('Best Laptops for Engineering Students in 2025 (India)'),
            'excerpt' => 'Solid performance for AutoCAD, MATLAB, coding + long battery life – our top recommendations under different budgets.',
            'body' => '<p>Best overall: Dell Inspiron 14 Plus (Intel Core Ultra 7)<br>Best value: Lenovo IdeaPad Slim 5 (Ryzen 7 7840HS)<br>Best portability: ASUS Zenbook 14 OLED<br>Best for heavy CAD: HP Pavilion Plus 16...</p>',
            'featured_image' => 'assets/techmedia/blogs/engineering-student-laptops-2025.jpg',
            'blog_category_id' => $category2?->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);
        $post5->tags()->attach(BlogTag::whereIn('slug', ['student-laptop', 'engineering', 'autocad', 'matlab', 'india'])->pluck('id'));

        // Post 6 – Service / Repair
        $post6 = BlogPost::create([
            'title' => 'Laptop Battery Not Charging? 7 Common Causes & Fixes',
            'slug' => Str::slug('Laptop Battery Not Charging? 7 Common Causes & Fixes'),
            'excerpt' => 'From faulty chargers to BIOS issues – quick troubleshooting steps before you bring it to the service center.',
            'body' => '<ol><li>Check cable & adapter</li><li>Try different socket</li><li>Reset SMC / power cycle</li><li>BIOS battery settings</li><li>Windows power troubleshooter</li><li>Battery calibration</li><li>When to replace the battery...</li></ol>',
            'featured_image' => 'assets/techmedia/blogs/battery-not-charging.jpg',
            'blog_category_id' => $category2?->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);
        $post6->tags()->attach(BlogTag::whereIn('slug', ['battery-issue', 'charging-problem', 'laptop-repair', 'troubleshooting'])->pluck('id'));

        // Post 7 – Review
        $post7 = BlogPost::create([
            'title' => 'Is OLED Worth It? We Compared OLED vs IPS Laptops in 2025',
            'slug' => Str::slug('Is OLED Worth It? We Compared OLED vs IPS Laptops in 2025'),
            'excerpt' => 'Color accuracy, contrast, burn-in risk, battery impact – real-world comparison for creators, students & everyday users.',
            'body' => '<p>Pros of OLED: perfect blacks, vibrant colors, HDR support<br>Cons: burn-in risk, higher price, slightly worse battery<br>Best OLED models right now: ASUS Zenbook 14 OLED, Lenovo Yoga Slim 7x, Dell XPS 13...</p>',
            'featured_image' => 'assets/techmedia/blogs/oled-vs-ips-2025.jpg',
            'blog_category_id' => $category2?->id,
            'user_id' => $user->id,
            'published' => true,
            'active_id' => 1,
        ]);
        $post7->tags()->attach(BlogTag::whereIn('slug', ['oled-laptop', 'display-comparison', 'creator-laptop', '2025'])->pluck('id'));
    }
}
