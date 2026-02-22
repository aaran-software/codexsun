<?php

namespace Aaran\Shop\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CustomController extends Controller
{
    public function index()
    {
        return Inertia::render('Web/custom/CustomPc', [
            'customPc' => $this->getCustomPcData(),
        ]);
    }

    public function builder()
    {
        return Inertia::render('Web/custom/CustomPcBuilder', [
            'customPc' => $this->getCustomPcData(),
        ]);
    }

    public function cart()
    {
        return Inertia::render('Web/custom/CustomCart', [
            'cart' => $this->getCartData(),
        ]);
    }

    private function getCustomPcData(): array
    {
        return [
            'heading' => 'Build Your Dream PC',
            'subheading' => 'Custom PC Builder',
            'description' => 'Choose the best components and build your perfect PC with expert guidance and compatibility assurance.',
            'components' => [
                'cpu' => [
                    [
                        'id' => 1,
                        'name' => 'AMD Ryzen 7 7800X3D',
                        'price' => 42999,
                        'category' => 'cpu',
                        'socket' => 'AM5',
                        'tdp' => 120,
                        'image' => '/assets/techmedia/components/ryzen-7800x3d.jpg',
                    ],
                    [
                        'id' => 2,
                        'name' => 'Intel Core i9-14900K',
                        'price' => 58999,
                        'category' => 'cpu',
                        'socket' => 'LGA1700',
                        'tdp' => 253,
                        'image' => '/assets/techmedia/components/i9-14900k.jpg',
                    ],
                    [
                        'id' => 3,
                        'name' => 'AMD Ryzen 5 7600',
                        'price' => 21999,
                        'category' => 'cpu',
                        'socket' => 'AM5',
                        'tdp' => 65,
                        'image' => '/assets/techmedia/components/ryzen-7600.jpg',
                    ],
                ],
                'motherboard' => [
                    [
                        'id' => 4,
                        'name' => 'ASUS ROG Strix B650-E Gaming WiFi',
                        'price' => 28999,
                        'category' => 'motherboard',
                        'ram_type' => 'DDR5',
                        'form_factor' => 'ATX',
                        'supportedSockets' => ['AM5'],
                        'image' => '/assets/techmedia/components/b650-strix.jpg',
                    ],
                    [
                        'id' => 5,
                        'name' => 'MSI MAG Z790 Tomahawk WiFi',
                        'price' => 31999,
                        'category' => 'motherboard',
                        'ram_type' => 'DDR5',
                        'form_factor' => 'ATX',
                        'supportedSockets' => ['LGA1700'],
                        'image' => '/assets/techmedia/components/z790-tomahawk.jpg',
                    ],
                ],
                'ram' => [
                    [
                        'id' => 6,
                        'name' => 'Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz',
                        'price' => 11999,
                        'category' => 'ram',
                        'ram_type' => 'DDR5',
                        'image' => '/assets/techmedia/components/vengeance-ddr5.jpg',
                    ],
                    [
                        'id' => 7,
                        'name' => 'G.Skill Trident Z5 RGB 64GB DDR5 6400MHz',
                        'price' => 24999,
                        'category' => 'ram',
                        'ram_type' => 'DDR5',
                        'image' => '/assets/techmedia/components/trident-z5.jpg',
                    ],
                ],
                'gpu' => [
                    [
                        'id' => 8,
                        'name' => 'NVIDIA GeForce RTX 4070 Ti Super',
                        'price' => 84999,
                        'category' => 'gpu',
                        'tdp' => 285,
                        'image' => '/assets/techmedia/components/rtx-4070ti.jpg',
                    ],
                    [
                        'id' => 9,
                        'name' => 'AMD Radeon RX 7900 XTX',
                        'price' => 104999,
                        'category' => 'gpu',
                        'tdp' => 355,
                        'image' => '/assets/techmedia/components/rx-7900xtx.jpg',
                    ],
                ],
                'storage' => [
                    [
                        'id' => 10,
                        'name' => 'Samsung 990 PRO 2TB NVMe SSD',
                        'price' => 17999,
                        'category' => 'storage',
                        'image' => '/assets/techmedia/components/990pro.jpg',
                    ],
                    [
                        'id' => 11,
                        'name' => 'WD Black SN850X 4TB',
                        'price' => 34999,
                        'category' => 'storage',
                        'image' => '/assets/techmedia/components/sn850x.jpg',
                    ],
                ],
                'psu' => [
                    [
                        'id' => 12,
                        'name' => 'Corsair RM850x 850W 80+ Gold',
                        'price' => 13999,
                        'category' => 'psu',
                        'wattage' => 850,
                        'image' => '/assets/techmedia/components/rm850x.jpg',
                    ],
                    [
                        'id' => 13,
                        'name' => 'Seasonic PRIME TX-1000 1000W',
                        'price' => 24999,
                        'category' => 'psu',
                        'wattage' => 1000,
                        'image' => '/assets/techmedia/components/prime-tx.jpg',
                    ],
                ],
                'case' => [
                    [
                        'id' => 14,
                        'name' => 'Lian Li Lancool 216 RGB',
                        'price' => 9999,
                        'category' => 'case',
                        'form_factor' => 'ATX',
                        'image' => '/assets/techmedia/components/lancool-216.jpg',
                    ],
                    [
                        'id' => 15,
                        'name' => 'Fractal Design Meshify 2 Compact',
                        'price' => 14999,
                        'category' => 'case',
                        'form_factor' => 'ATX',
                        'image' => '/assets/techmedia/components/meshify-2.jpg',
                    ],
                ],
                'cooler' => [
                    [
                        'id' => 16,
                        'name' => 'Noctua NH-D15 chromax.black',
                        'price' => 11999,
                        'category' => 'cooler',
                        'supportedSockets' => ['AM5', 'LGA1700'],
                        'image' => '/assets/techmedia/components/nh-d15.jpg',
                    ],
                    [
                        'id' => 17,
                        'name' => 'NZXT Kraken Elite 360 RGB',
                        'price' => 18999,
                        'category' => 'cooler',
                        'supportedSockets' => ['AM5', 'LGA1700'],
                        'image' => '/assets/techmedia/components/kraken-360.jpg',
                    ],
                ],
            ],
        ];
    }

    private function getCartData(): array
    {
        return [
            'heading' => 'Your Custom PC Cart',
            'emptyMessage' => 'Your cart is empty',
            'continueShoppingText' => 'Continue Shopping',
            'continueShoppingHref' => '/custom-pc',
            'subtotalLabel' => 'Subtotal',
            'shippingLabel' => 'Shipping',
            'shippingValue' => 'Free',
            'totalLabel' => 'Total',
            'proceedToCheckoutText' => 'Proceed to Checkout',
            'proceedToCheckoutHref' => '/checkout',
            'items' => [],
        ];
    }
}
