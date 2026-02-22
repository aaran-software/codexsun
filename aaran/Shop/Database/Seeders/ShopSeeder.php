<?php

namespace Aaran\Shop\Database\Seeders;

use Aaran\Shop\Models\Category;
use Aaran\Shop\Models\Product;
use Aaran\Tenant\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create default tenant
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'techmedia'],
            [
                'name' => 'Tech Media',
                'short_name' => 'Techmedia',
                'display_name' => 'Tech Media',
                'slogan' => 'Your Trusted Computer Store & Service Partner',
                // ... other required fields
            ]
        );

        $tenantId = $tenant->id;

        // ──────────────────────────────────────────────
        // Create 6 categories
        // ──────────────────────────────────────────────
        $categoriesData = [
            ['name' => 'Laptops & Notebooks',     'slug' => 'laptops'],
            ['name' => 'Desktops & Workstations', 'slug' => 'desktops'],
            ['name' => 'PC Components',           'slug' => 'components'],
            ['name' => 'Monitors & Displays',     'slug' => 'monitors'],
            ['name' => 'Gaming Gear & Peripherals', 'slug' => 'gaming'],
            ['name' => 'Accessories & Networking', 'slug' => 'accessories'],
        ];

        $categories = collect();
        foreach ($categoriesData as $index => $data) {
            $category = Category::firstOrCreate(
                ['tenant_id' => $tenantId, 'slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'display_order' => $index + 1,
                    'is_active' => true,
                ]
            );
            $categories->push($category);
        }

        // ──────────────────────────────────────────────
        // Create 20 products with local images 1.jpg to 20.jpg
        // ──────────────────────────────────────────────
        $productsData = [
            // Laptops (1–6)
            ['name' => 'ASUS ROG Strix G16 RTX 4070', 'price' => 124999, 'category_slug' => 'laptops', 'badge' => 'Sale'],
            ['name' => 'Lenovo Legion Pro 7 Ryzen 9', 'price' => 149999, 'category_slug' => 'laptops', 'badge' => 'New'],
            ['name' => 'Dell XPS 15 OLED i9',         'price' => 199999, 'category_slug' => 'laptops'],
            ['name' => 'HP Omen 16 RTX 4060',         'price' => 98999,  'category_slug' => 'laptops'],
            ['name' => 'MacBook Pro M3 Max',          'price' => 289999, 'category_slug' => 'laptops'],
            ['name' => 'Acer Predator Helios Neo 16', 'price' => 89999,  'category_slug' => 'laptops'],

            // Desktops (7–10)
            ['name' => 'Custom Ryzen 9 7950X3D + RTX 4090', 'price' => 289999, 'category_slug' => 'desktops', 'badge' => 'Featured'],
            ['name' => 'Intel i9-14900K + RTX 4080 Build', 'price' => 249999, 'category_slug' => 'desktops'],
            ['name' => 'Dell Alienware Aurora R16',       'price' => 219999, 'category_slug' => 'desktops'],
            ['name' => 'HP Omen 45L Gaming Desktop',      'price' => 179999, 'category_slug' => 'desktops'],

            // Components (11–15)
            ['name' => 'NVIDIA RTX 4070 Ti 12GB',         'price' => 64999,  'category_slug' => 'components'],
            ['name' => 'AMD Ryzen 9 7950X3D',             'price' => 58999,  'category_slug' => 'components'],
            ['name' => 'Corsair Vengeance DDR5 32GB',     'price' => 12499,  'category_slug' => 'components'],
            ['name' => 'Samsung 990 PRO 2TB NVMe SSD',    'price' => 14999,  'category_slug' => 'components'],
            ['name' => 'NZXT Kraken 360 RGB AIO Cooler',  'price' => 16999,  'category_slug' => 'components'],

            // Monitors (16–18)
            ['name' => 'Samsung Odyssey G9 49" 240Hz',    'price' => 94999,  'category_slug' => 'monitors', 'badge' => 'Sale'],
            ['name' => 'LG UltraGear 27GP950-B 4K',       'price' => 44999,  'category_slug' => 'monitors'],
            ['name' => 'Dell Alienware AW3423DW QD-OLED', 'price' => 109999, 'category_slug' => 'monitors'],

            // Gaming Gear & Accessories (19–20)
            ['name' => 'Logitech G Pro X Superlight Mouse', 'price' => 10999, 'category_slug' => 'gaming'],
            ['name' => 'Razer BlackWidow V4 Pro Keyboard',  'price' => 22999, 'category_slug' => 'gaming'],
        ];

        $imageCounter = 1;

        foreach ($productsData as $data) {
            $category = $categories->firstWhere('slug', $data['category_slug']);

            if (! $category) {
                $this->command->warn('Category not found for: '.$data['name']);

                continue;
            }

            Product::create([
                'tenant_id' => $tenantId,
                'category_id' => $category->id,
                'name' => $data['name'],
                'slug' => Str::slug($data['name']).'-'.rand(1000, 9999),
                'price' => $data['price'],
                'original_price' => $data['price'] * (rand(80, 120) / 100), // random discount
                'image' => "/assets/techmedia/products/{$imageCounter}.jpg",
                'in_stock' => rand(0, 10) > 1,
                'stock_quantity' => rand(5, 100),
                'rating' => rand(35, 50) / 10,
                'review_count' => rand(12, 420),
                'badge' => $data['badge'] ?? null,
                'is_featured' => rand(1, 10) <= 3,
            ]);

            $imageCounter++;
            if ($imageCounter > 20) {
                $imageCounter = 1;
            } // loop back if needed
        }

        $this->command->info('ShopSeeder completed: '.$categories->count().' categories, '.Product::count().' products created.');
    }
}
