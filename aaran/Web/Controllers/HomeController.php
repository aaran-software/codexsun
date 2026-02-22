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
            'abouts' => $this->getAboutData(),
            'hero' => $this->getHeroData(),
            'stats' => $this->getStatsData(),
            'catalog' => $this->CatalogData(),
            'productRange' => $this->productRangeData(),
            'whyChooseUs' => $this->whyChooseUs(),
            'brandSlider' => $this->brandSliderData(),
            'features' => $this->features(),
            'callToAction' => $this->callToAction(),
            'location' => $this->location(),
            'newsletter' => $this->newsletter(),
            'footer' => $this->footer(),
            'company' => $this->getCompanyData(),
        ]);
    }

    private function getCompanyData(): array
    {
        // fallback values - override with tenant data when available
        return [
            'name' => 'Tech Media Retail',
            'tagline' => 'Your Trusted IT Partner Since 2002',
            'address1' => '436, Avinashi Road',
            'address2' => '',
            'city' => 'Tiruppur',
            'state' => 'Tamil Nadu',
            'pinCode' => '641602',
            'gstin' => '33AABCT1234D1Z5',
            'mobile1' => '+91 98946 44450',
            'email' => 'info@techmedia.in',
        ];
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
            'title' => 'Your Trusted Computer Store & Service Partner in Tiruppur',
            'subtitle' => 'Complete IT solutions since 2002 — hardware sales, custom builds, repair, networking, CCTV, cloud services & reliable support.',
        ];
    }

    private function getAboutData(): ?array
    {
        return [
            'backgroundColor' => '#f9fafb',
            'title' => 'About Tech Media Retail',
            'subtitle' => 'Your Trusted IT Partner in Tiruppur Since 2002',
            'content' => [
                'Tech Media Retail is Coimbatore & Tiruppur’s leading computer sales, service, and IT solutions center, established in 2002.',
                'With 24+ years of expertise, we serve individuals, businesses, schools, offices, and institutions with genuine products and expert technical support.',
            ],
            'image' => [
                'src' => '/assets/techmedia/images/dell-showroom.jpg',
                'alt' => 'Tech Media Retail Showroom',
            ],
        ];
    }

    private function getStatsData(): ?array
    {
        return ['backgroundColor' => '#ffffff',
            'borderColor' => '#e5e7eb',
            'stats' => [
                ['value' => 50, 'suffix' => '+', 'label' => 'Trusted Brands'],
                ['value' => 12000, 'suffix' => '+', 'label' => 'Products In Stock'],
                ['value' => 8000, 'suffix' => '+', 'label' => 'Happy Customers'],
                ['value' => 24, 'suffix' => '', 'label' => 'Years of Expertise'],
            ],
        ];
    }

    private function CatalogData(): ?array
    {
        return [
            'heading' => 'Complete Computer & Accessories Catalog',
            'subheading' => 'High-quality hardware, peripherals, networking gear, CCTV solutions and IT essentials — perfect for retail, bulk orders, offices, schools and businesses.',
            'categories' => [
                [
                    'title' => 'Laptops & Notebooks',
                    'slug' => 'laptops',
                    'description' => 'Latest models from top brands — performance, gaming, business & student series',
                    'image' => '/assets/techmedia/categories/laptops.jpg',
                    'variants' => [
                        'Gaming Laptops',
                        'Ultrabooks',
                        'Business Laptops',
                        'Student Laptops',
                    ],
                    'bulkBadge' => 'Ready Stock',
                    'featuredBadge' => 'Latest Models',
                    'badgeVariant' => 'emerald',
                    'featuredBadgeVariant' => 'amber',
                ],
                [
                    'title' => 'Desktops & Workstations',
                    'slug' => 'desktops',
                    'description' => 'Custom builds, pre-built systems, office PCs, gaming rigs & professional workstations',
                    'image' => '/assets/techmedia/categories/desktops.png',
                    'variants' => [
                        'Gaming Desktops',
                        'Office PCs',
                        'All-in-One',
                        'Workstations',
                    ],
                    'bulkBadge' => 'Custom Builds',
                    'featuredBadge' => '',
                    'badgeVariant' => 'blue',
                    'featuredBadgeVariant' => null,
                ],
                [
                    'title' => 'Monitors & Displays',
                    'slug' => 'monitors',
                    'description' => 'Full HD, 4K, curved, ultrawide, gaming & professional color-accurate displays',
                    'image' => '/assets/techmedia/categories/monitor.avif',
                    'variants' => [
                        'Gaming Monitors',
                        '4K Monitors',
                        'Office Displays',
                        'Portable Monitors',
                    ],
                    'bulkBadge' => '',
                    'featuredBadge' => '2026 New Series',
                    'badgeVariant' => 'amber',
                    'featuredBadgeVariant' => 'purple',
                ],
                [
                    'title' => 'Networking & Connectivity',
                    'slug' => 'networking',
                    'description' => 'Routers, switches, Wi-Fi extenders, cables, access points and complete office networking solutions',
                    'image' => '/assets/techmedia/categories/networking.webp',
                    'variants' => [
                        'Routers',
                        'Switches',
                        'Wi-Fi Extenders',
                        'Cables & Adapters',
                    ],
                    'bulkBadge' => 'Enterprise Bulk',
                    'featuredBadge' => '',
                    'badgeVariant' => 'purple',
                    'featuredBadgeVariant' => null,
                ],
                [
                    'title' => 'CCTV & Surveillance',
                    'slug' => 'cctv',
                    'description' => 'HD cameras, NVRs, DVRs, complete security systems with mobile monitoring support',
                    'image' => '/assets/techmedia/categories/cctv-camera.png',
                    'variants' => [
                        'Bullet Cameras',
                        'Dome Cameras',
                        'PTZ Cameras',
                        'NVR Systems',
                    ],
                    'bulkBadge' => 'Bulk Offers',
                    'featuredBadge' => 'Latest 4K Series',
                    'badgeVariant' => 'rose',
                    'featuredBadgeVariant' => null,
                ],
                [
                    'title' => 'Peripherals & Accessories',
                    'slug' => 'peripherals',
                    'description' => 'Keyboards, mice, headsets, webcams, speakers, UPS, laptop bags & much more',
                    'image' => '/assets/techmedia/categories/peripherals.webp',
                    'variants' => [
                        'Keyboard & Mouse Combo',
                        'Headsets',
                        'Webcams',
                        'UPS & Power Backup',
                    ],
                    'bulkBadge' => 'Bulk Accessories',
                    'featuredBadge' => '',
                    'badgeVariant' => 'cyan',
                    'featuredBadgeVariant' => null,
                ],
                [
                    'title' => 'Printers & Scanners',
                    'slug' => 'printers',
                    'description' => 'Inkjet, laser, all-in-one, multifunction printers, scanners and cartridges',
                    'image' => '/assets/techmedia/categories/printer-epson.jpg',
                    'variants' => [
                        'Laser Printers',
                        'Inkjet Printers',
                        'All-in-One',
                        'Scanners',
                    ],
                    'bulkBadge' => 'Office Deals',
                    'featuredBadge' => 'New Laser Models',
                    'badgeVariant' => 'indigo',
                    'featuredBadgeVariant' => null,
                ],
                [
                    'title' => 'Storage Devices',
                    'slug' => 'storage',
                    'description' => 'Internal HDD/SSD, external drives, NAS, memory cards, pen drives & cloud solutions',
                    'image' => '/assets/techmedia/categories/harddisk.jpg',
                    'variants' => [
                        'External HDD',
                        'Portable SSD',
                        'Pen Drives',
                        'Memory Cards',
                    ],
                    'bulkBadge' => 'Bulk Pricing',
                    'featuredBadge' => '',
                    'badgeVariant' => 'rose',
                    'featuredBadgeVariant' => null,
                ],
            ],
        ];
    }

    private function productRangeData(): ?array
    {
        return [
            'heading' => 'Explore Our Comprehensive Range of Computer Accessories',
            'subheading' => 'From essential peripherals to advanced connectivity solutions — everything you need for a complete IT setup',
            'categories' => [
                [
                    'name' => 'USB Flash Drives & Pen Drives',
                    'image' => '/assets/techmedia/products/usb-drive.jpg',
                    'slug' => 'usb-flash-drives',
                ],
                [
                    'name' => 'External Hard Disks & SSDs',
                    'image' => '/assets/techmedia/products/external-hdd.jpg',
                    'slug' => 'external-storage',
                ],
                [
                    'name' => 'Mouse & Keyboards (Wired & Wireless)',
                    'image' => '/assets/techmedia/products/mouse-keyboard.jpg',
                    'slug' => 'mouse-keyboards',
                ],
                [
                    'name' => 'Webcams & Conference Cameras',
                    'image' => '/assets/techmedia/products/webcam.jpg',
                    'slug' => 'webcams',
                ],
                [
                    'name' => 'Headphones & Earphones',
                    'image' => '/assets/techmedia/products/headphones.jpg',
                    'slug' => 'headphones-earphones',
                ],
                [
                    'name' => 'Speakers & Soundbars',
                    'image' => '/assets/techmedia/products/speakers.jpg',
                    'slug' => 'speakers',
                ],
                [
                    'name' => 'Cables, Chargers & Adapters',
                    'image' => '/assets/techmedia/products/cables-chargers.jpg',
                    'slug' => 'cables-adapters',
                ],
                [
                    'name' => 'Laptop Bags & Sleeves',
                    'image' => '/assets/techmedia/products/laptop-bag.jpg',
                    'slug' => 'laptop-bags',
                ],
                [
                    'name' => 'CCTV Cameras & Accessories',
                    'image' => '/assets/techmedia/products/cctv-camera.jpg',
                    'slug' => 'cctv-accessories',
                ],
                [
                    'name' => 'Networking Cables & Routers',
                    'image' => '/assets/techmedia/products/networking.jpg',
                    'slug' => 'networking',
                ],
                [
                    'name' => 'Printers, Scanners & Ink',
                    'image' => '/assets/techmedia/products/printer.jpg',
                    'slug' => 'printers-scanners',
                ],
                [
                    'name' => 'UPS & Power Backup Solutions',
                    'image' => '/assets/techmedia/products/ups.jpg',
                    'slug' => 'ups-power-backup',
                ],
            ],
        ];
    }

    private function whyChooseUs(): ?array
    {
        return [
            'heading' => 'Why Choose Tech Media Retail',
            'subheading' => 'Your trusted IT partner in Tiruppur — delivering quality hardware, expert service, and reliable solutions since 2002.',
            'features' => [
                [
                    'title' => 'Expert Hardware Selection',
                    'description' => 'Carefully curated range of desktops, laptops, monitors, servers, and peripherals from top global brands.',
                    'icon' => 'BadgeCheck',
                ],
                [
                    'title' => 'Competitive Pricing',
                    'description' => 'Best-in-class prices for retail, bulk, and corporate buyers with transparent no-hidden-cost policy.',
                    'icon' => 'IndianRupee',
                ],
                [
                    'title' => 'Custom PC Builds',
                    'description' => 'Tailor-made gaming rigs, workstations, office setups and server configurations to match your exact needs.',
                    'icon' => 'Factory',
                ],
                [
                    'title' => 'Fast Delivery & Installation',
                    'description' => 'Quick delivery across Tiruppur and nearby areas with professional on-site setup and configuration support.',
                    'icon' => 'Truck',
                ],
                [
                    'title' => 'Reliable After-Sales Service',
                    'description' => 'Dedicated service team for repairs, upgrades, troubleshooting, AMC contracts and warranty support.',
                    'icon' => 'ShieldCheck',
                ],
                [
                    'title' => 'Business & Bulk Solutions',
                    'description' => 'Special pricing and support for schools, offices, shops, startups and institutional bulk requirements.',
                    'icon' => 'Users',
                ],
            ],
        ];
    }

    private function brandSliderData(): ?array
    {
        return [
            'heading' => 'Trusted Brands We Work With',
            'backgroundColor' => '#ffffff',
            'hoverColor' => '#3b82f6',
            'animationDuration' => 40,
            'pauseOnHover' => true,
            'logos' => [
                ['name' => 'Lenovo', 'logo' => '/assets/techmedia/brands/lenovo.png'],
                ['name' => 'Dell', 'logo' => '/assets/techmedia/brands/dell.png'],
                ['name' => 'HP', 'logo' => '/assets/techmedia/brands/hp.jpg'],
                ['name' => 'Asus', 'logo' => '/assets/techmedia/brands/asus.png'],
                ['name' => 'Acer', 'logo' => '/assets/techmedia/brands/acer.png'],
                ['name' => 'MSI', 'logo' => '/assets/techmedia/brands/msi.png'],
                ['name' => 'Gigabyte', 'logo' => '/assets/techmedia/brands/gigabyte.png'],
                ['name' => 'Intel', 'logo' => '/assets/techmedia/brands/intel.png'],
                ['name' => 'AMD', 'logo' => '/assets/techmedia/brands/amd.png'],
                ['name' => 'NVIDIA', 'logo' => '/assets/techmedia/brands/nvidia.png'],
                ['name' => 'Logitech', 'logo' => '/assets/techmedia/brands/logitech.png'],
                ['name' => 'COCONUT', 'logo' => '/assets/techmedia/brands/coconut.jpg'],
                ['name' => 'EPSON', 'logo' => '/assets/techmedia/brands/epson.png'],
                ['name' => 'Brother', 'logo' => '/assets/techmedia/brands/brother.png'],
            ],
        ];
    }

    private function features(): ?array
    {
        return [
            'title' => 'Workstations • Corporate Laptops • Gaming PCs & Laptops',
            'description' => "Expert solutions for professionals, businesses and gamers.\n".
                "Custom-built workstations | Enterprise laptops | High-end gaming rigs\n".
                'Bulk orders • Corporate pricing • On-site setup & support',
            'backgroundColor' => 'rgb(203,243,161)',
            'image' => [
                'src' => '/assets/techmedia/brands/alienware.avif',
                'alt' => 'Dual-monitor Workstation Configuration',
            ],
            'bullets' => [
                'ISV-certified workstations (Dell Precision, HP Z, Lenovo ThinkStation, ASUS ProArt)',
                'Business-class laptops with vPro, long battery, spill-resistant keyboards',
                'Custom gaming desktops – optimized airflow, RGB, liquid cooling options',
                'High-refresh-rate gaming laptops up to RTX 4090 & 240 Hz displays',
                'Dedicated account managers for bulk & repeat corporate orders',
            ],
        ];
    }

    private function callToAction(): ?array
    {
        return ['backgroundColor' => '#0f172a',
            'title' => 'Build Your Perfect Computer Setup Today',
            'description' => "Visit our showroom in Tiruppur or contact us for custom PC builds,\n".
                "bulk hardware orders, workstation configurations, gaming rigs,\n".
                'CCTV & networking solutions, and exclusive pricing.',
            'buttonText' => 'Get Quote or Visit Us',
            'buttonHref' => '/web-contacts?source=cta',
            'buttonBg' => 'bg-emerald-600',
            'buttonTextColor' => 'text-white',
            'buttonHoverBg' => 'hover:bg-emerald-700', ];

    }

    private function location(): ?array
    {
        return [
            'displayName' => 'Techmedia Retail',
            'title' => 'Our Shop',
            'address' => "436, Avinashi Road,\nTiruppur, Tamil Nadu 641602",
            'timings' => [
                [
                    'day' => 'Monday – Friday',
                    'hours' => '9:00 AM – 8:00 PM',
                ],
                [
                    'day' => 'Saturday',
                    'hours' => '9:00 AM – 8:00 PM',
                ],
                [
                    'day' => 'Sunday',
                    'hours' => '10:00 AM – 4:00 PM',
                ],
            ],
            'contact' => [
                'phone' => '+91 98946 44450',
                'email' => 'info@techmedia.in',
            ],
            'buttonText' => 'CONTACT US',
            'buttonHref' => '/web-contacts',
            'image' => [
                'src' => '/assets/techmedia/images/dell-showroom.jpg',
                'alt' => 'TechMedia Retail Showroom',
                'className' => 'w-full h-[500px] md:h-[600px] object-cover',
            ],
            'map' => [
                'embedUrl' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.058!2d77.334138!3d11.1133183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907abde6b9b0b%3A0x15ed72f683d49e9b!2sTech%20Media%20Retail!5e0!3m2!1sen!2sin!4v1739876543210!5m2!1sen!2sin',
                'title' => 'Tech Media Retail - Avinashi Road, Tiruppur',
                'placeId' => '0x3ba907abde6b9b0b:0x15ed72f683d49e9b',
                'coordinates' => [
                    'lat' => 11.1133183,
                    'lng' => 77.3367129,
                ],
            ],
        ];
    }

    private function newsletter(): ?array
    {
        return [
            'title' => 'Subscribe to Our Newsletter',
            'description' => "Get the latest updates on new computer arrivals, hardware deals,\n".
                "service offers, networking solutions, CCTV promotions,\n".
                'and exclusive bulk purchase discounts in Tirupur.',
            'placeholderName' => 'Your Name',
            'placeholderEmail' => 'Your Email',
            'buttonText' => 'Subscribe Now',
            'trustNote' => 'We respect your privacy. No spam. Only useful tech updates & offers.',
            'backgroundColor' => '#F9D75C',
            'buttonBg' => 'bg-black',
            'buttonHoverBg' => 'hover:bg-[#1e40af]',
            'image' => [
                'src' => '/assets/techmedia/brands/alienware.avif',
                'alt' => 'Computer & IT Setup',
            ],
        ];
    }

    private function footer(): ?array
    {
        return [
            'sections' => [
                [
                    'title' => 'Company',
                    'links' => [
                        ['label' => 'About Us', 'href' => '/about'],
                        ['label' => 'Our Story', 'href' => '/our-story'],
                        ['label' => 'Why Choose Us', 'href' => '/why-us'],
                        ['label' => 'Careers', 'href' => '/careers'],
                        ['label' => 'Contact Us', 'href' => '/contact'],
                    ],
                ],
                [
                    'title' => 'Our Services',
                    'links' => [
                        ['label' => 'Computer Sales', 'href' => '/shop/computers'],
                        ['label' => 'Laptop & Repair', 'href' => '/services/repair'],
                        ['label' => 'Networking Solutions', 'href' => '/services/networking'],
                        ['label' => 'CCTV Installation', 'href' => '/services/cctv'],
                        ['label' => 'Cloud & Backup', 'href' => '/services/cloud'],
                        ['label' => 'ERP and Billing Software', 'href' => '/services/software'],
                        ['label' => 'Website and Domain Service', 'href' => '/services/domain'],
                    ],
                ],
                [
                    'title' => 'Legal',
                    'links' => [
                        ['label' => 'Privacy Policy', 'href' => '/privacy-policy'],
                        ['label' => 'Terms & Conditions', 'href' => '/terms'],
                        ['label' => 'Refund & Warranty', 'href' => '/refund-policy'],
                    ],
                ],
                [
                    'title' => 'Support',
                    'links' => [
                        ['label' => 'Track Service', 'href' => '/track-service'],
                        ['label' => 'FAQs', 'href' => '/faqs'],
                        ['label' => 'Service Request', 'href' => '/service-request'],
                    ],
                ],
            ],

            'social' => [
                [
                    'label' => 'Facebook',
                    'href' => 'https://facebook.com/techmediaretail',
                    'Icon' => 'Facebook',
                ],
                [
                    'label' => 'Instagram',
                    'href' => 'https://instagram.com/techmediaretail',
                    'Icon' => 'Instagram',
                ],
                [
                    'label' => 'Twitter',
                    'href' => 'https://twitter.com/techmediaretail',
                    'Icon' => 'Twitter',
                ],
                [
                    'label' => 'LinkedIn',
                    'href' => 'https://linkedin.com/techmediaretail',
                    'Icon' => 'Linkedin',
                ],
                [
                    'label' => 'YouTube',
                    'href' => 'https://youtube.com/techmediaretail',
                    'Icon' => 'Youtube',
                ],
            ],
        ];
    }
}
