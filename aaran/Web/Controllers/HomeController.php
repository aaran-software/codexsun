<?php

namespace Aaran\Web\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Web/Home/Index', [
            'message' => [
                'greetings' => 'Welcome to Aaran!',
                'date' => date('l jS \of F Y h:i:s A'),
            ],
            'slider' => $this->getSliderData(),
            'abouts' => $this->getTenantAboutData(),
            'hero' => $this->getHeroData(),
        ]);
    }

    private function getSliderData(): array
    {
        return [
            'slides' => [
                [
                    'id' => 1,
                    'title' => 'High-Performance Laptops & Workstations',
                    'tagline' => 'Power up your productivity with the latest Intel & AMD processors',
                    'action' => ['text' => 'Shop Laptops', 'href' => '/laptops'],
                    'media' => [
                        'type' => 'image',
                        'src' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600',
                    ],
                    'highlights' => [
                        ['text' => 'Latest 13th/14th Gen', 'variant' => 'success'],
                        ['text' => 'Up to 64GB RAM', 'variant' => 'primary'],
                    ],
                    'btn_cta' => 'bg-blue-600 hover:bg-blue-700 text-white',
                    'duration' => 7000,
                    'intensity' => 'medium',
                    'backgroundMode' => 'cinematic',
                ],
                [
                    'id' => 2,
                    'title' => 'Expert Repair & Upgrade Services',
                    'tagline' => 'Screen replacement, battery fix, SSD upgrade — same day service available',
                    'action' => ['text' => 'Book Repair', 'href' => '/repair'],
                    'media' => [
                        'type' => 'video',
                        'mp4' => '/assets/techmedia/videos/motherboard.mp4',
                    ],
                    'duration' => 14000,
                    'highlights' => [
                        ['text' => 'Genuine Parts', 'variant' => 'success'],
                        ['text' => '90-day Warranty', 'variant' => 'primary'],
                    ],
                    'intensity' => 'high',
                    'showOverlay' => false,
                ],
                [
                    'id' => 3,
                    'title' => '',
                    'tagline' => '',
                    'action' => ['text' => 'Build Your PC', 'href' => '/custom-pc'],
                    'media' => ['type' => 'youtube', 'videoId' => 'GckqQX355iE'],
                    'duration' => 18000,
                    'showOverlay' => false,
                    'overlayColor' => 'bg-green-100/20',
                ],
                [
                    'id' => 4,
                    'title' => 'Business & Office Solutions',
                    'tagline' => 'Bulk orders, Windows Pro licensing, network setup & support',
                    'action' => ['text' => 'Get Quote', 'href' => '/business'],
                    'media' => [
                        'type' => 'image',
                        'src' => 'https://news.lenovo.com/wp-content/uploads/2023/03/11_B_Lenovo_LOQ_15IRH8_Closeup_Port.jpg',
                    ],
                    'intensity' => 'low',
                    'backgroundMode' => 'cinematic',
                    'showOverlay' => true,
                ],
                [
                    'id' => 5,
                    'title' => 'Accessories & Peripherals',
                    'tagline' => 'Mechanical keyboards, 4K monitors, wireless mice — all in stock',
                    'action' => ['text' => 'Browse Accessories', 'href' => '/accessories'],
                    'media' => [
                        'type' => 'image',
                        'src' => 'https://eftm.com/wp-content/uploads/2024/05/PXL_20240519_023954042-797x600.jpg',
                    ],
                    'intensity' => 'low',
                ],
                [
                    'id' => 6,
                    'title' => '',
                    'tagline' => 'RTX 40-series, Ryzen 7000, liquid cooling — play at ultra settings',
                    'action' => ['text' => 'Build Your PC', 'href' => '/custom-pc'],
                    'media' => ['type' => 'youtube', 'videoId' => 'd86ws7mQYIg'],
                    'duration' => 14000,
                    'highlights' => [
                        ['text' => 'RGB Customizable', 'variant' => 'success'],
                        ['text' => '3-Year Support', 'variant' => 'primary'],
                    ],
                ],
            ],
            'options' => [
                'parallax' => true,
                'defaultVariant' => 'saas',
                'defaultIntensity' => 'medium',
                'defaultDirection' => 'fade',
                'defaultBackgroundMode' => 'cinematic',
            ],
        ];
    }

    private function getHeroData()
    {
        return [
            'title' => 'Techmedia',
            'subtitle' => 'Delivering Quality & Reliability Since Day One',
        ];
    }
    private function getTenantAboutData(): ?array
    {
        return [
            'backgroundColor' => '#f9fafb',
            'title' => 'About Us',
            'subtitle' => 'Delivering Quality & Reliability Since Day One',
            'content' => [
                'We are a passionate team dedicated to providing top-quality products and exceptional service to our customers.',
                'With years of experience and a commitment to excellence, we help businesses and individuals achieve their goals through reliable technology solutions.',
                'Customer satisfaction is at the heart of everything we do.',
            ],
            'image' => [
                'src' => '/assets/images/fallback-about.jpg',
                'alt' => 'Our dedicated team and showroom',
            ],
        ];
    }
}
