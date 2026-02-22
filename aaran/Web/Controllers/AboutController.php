<?php

namespace Aaran\Web\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Web/About/Index', [
            'hero' => $this->getHeroData(),
            'abouts' => $this->getAboutData(),
            'features' => $this->features(),
            'whyChooseUs' => $this->whatWeOffer(),
            'footer' => $this->footer(),
            'company' => $this->getCompanyData(),
            'team' => $this->getTeamData(),
            'testimonials' => $this->getTestimonialsData(),
            'callToAction' => $this->callToAction(),
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

    private function getHeroData(): ?array
    {
        return [
            'title' => 'Powering Tiruppur’s Businesses & Homes with Reliable Technology Since 2002',
            'subtitle' => 'From custom-built PCs to enterprise IT infrastructure, we provide trusted solutions, expert service, and long-term support.',
        ];
    }

    private function getAboutData(): ?array
    {
        return [
            'backgroundColor' => '#f9fafb',
            'title' => 'About Tech Media Retail – Leading Computer Store in Tiruppur',
            'subtitle' => 'Trusted Computer Sales, Service & IT Solutions Provider in Tiruppur Since 2002',
            'content' => [
                'Tech Media Retail is a leading computer store in Tiruppur, specializing in computer sales, laptop sales, desktop solutions, and complete IT services since 2002. We provide genuine hardware, accessories, and enterprise-grade solutions for retail customers, textile businesses, schools, and corporate offices.',

                'As a trusted computer sales and service center in Tiruppur, we offer custom PC builds, gaming systems, networking solutions, CCTV installation, cloud services, and annual maintenance contracts (AMC) with reliable after-sales support.',

                'With over two decades of experience, competitive pricing, and expert technical guidance, Tech Media Retail has become the preferred choice for businesses and individuals looking for dependable computer hardware and IT infrastructure solutions in Tiruppur.',
            ],
            'image' => [
                'src' => '/assets/techmedia/images/dell-showroom.jpg',
                'alt' => 'Tech Media Retail – Computer Store in Tiruppur Showroom',
            ],
        ];
    }

    private function whatWeOffer(): ?array
    {
        return [
            'heading' => 'What We Offer',
            'subheading' => 'Complete Computer Sales & IT Services in Tiruppur — Products, Repairs, and Business Solutions Under One Roof.',
            'features' => [
                [
                    'title' => 'Laptops & Desktops',
                    'description' => 'Wide range of branded laptops and desktop computers for students, home users, offices, and corporate environments.',
                    'icon' => 'Laptop',
                ],
                [
                    'title' => 'Custom PC Builds & Gaming Systems',
                    'description' => 'High-performance custom-built PCs, gaming rigs, and professional workstations tailored to your exact needs.',
                    'icon' => 'Cpu',
                ],
                [
                    'title' => 'Printers & Networking Devices',
                    'description' => 'Printers, routers, switches, and complete networking solutions for homes, offices, and institutions.',
                    'icon' => 'Network',
                ],
                [
                    'title' => 'Computer Accessories',
                    'description' => 'Keyboards, mouse, SSDs, RAM, monitors, storage devices, and essential peripherals from trusted brands.',
                    'icon' => 'Keyboard',
                ],
                [
                    'title' => 'Laptop & Desktop Repair',
                    'description' => 'Professional repair services including hardware troubleshooting, screen replacement, and motherboard repair.',
                    'icon' => 'Wrench',
                ],
                [
                    'title' => 'OS Installation & Virus Removal',
                    'description' => 'Operating system installation, software setup, malware removal, and complete system optimization.',
                    'icon' => 'Shield',
                ],
                [
                    'title' => 'Data Recovery & Upgrade Services',
                    'description' => 'Secure data recovery solutions along with RAM, SSD, and performance upgrades to extend device lifespan.',
                    'icon' => 'HardDrive',
                ],
                [
                    'title' => 'Annual Maintenance Contracts (AMC)',
                    'description' => 'Reliable AMC services for businesses, schools, and offices with scheduled maintenance and priority support.',
                    'icon' => 'ClipboardCheck',
                ],
            ],
        ];
    }

    private function features(): ?array
    {
        return [
            'title' => 'Our Mission & Vision',
            'description' => "Driven by commitment. Built on trust.\n".
                'Delivering reliable technology solutions for businesses and individuals in Tiruppur since 2002.',
            'backgroundColor' => 'rgb(203,243,161)',
            'image' => [
                'src' => '/assets/techmedia/images/mission-vision.jpg',
                'alt' => 'Tech Media Retail Mission and Vision',
            ],
            'bullets' => [
                'Mission: To deliver reliable, high-performance technology solutions with honesty, expertise, and long-term customer support.',
                'Mission: To provide genuine hardware, transparent pricing, and dependable after-sales service for retail and corporate clients.',
                'Vision: To become the most trusted computer store and IT service provider in Tiruppur and surrounding regions.',
                'Vision: To empower businesses, schools, and individuals with modern, scalable, and future-ready IT infrastructure solutions.',
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

    private function getTeamData(): ?array
    {
        // You can later make this tenant-specific from DB / tenant settings
        return [
            'heading' => 'Our Leadership Team',
            'subheading' => 'Experienced professionals dedicated to delivering quality IT solutions and exceptional service.',
            'members' => [
                [
                    'name' => 'Mr. A. Vijayananth',
                    'designation' => 'Managing Director',
                    'bio' => 'Over 22 years in IT hardware retail and distribution. Visionary leader behind Tech Media Retail.',
                    'image' => '/assets/techmedia/team/team1.jpg',
                ],
                [
                    'name' => 'Mr. S. Ramesh',
                    'designation' => 'Operations & Service Head',
                    'bio' => 'Expert in repair, upgrades, and inventory management. Ensures smooth daily operations.',
                    'image' => '/assets/techmedia/team/team2.jpg',
                ],
                [
                    'name' => 'Ms. P. Ratheesh',
                    'designation' => 'Procurement & Vendor Manager',
                    'bio' => 'Handles sourcing from top brands and maintains strong supplier relationships.',
                    'image' => '/assets/techmedia/team/team1.jpg',
                ],
                [
                    'name' => 'Mr. K. Mahendran',
                    'designation' => 'Sales & Business Development',
                    'bio' => 'Specializes in corporate, bulk, and institutional sales with personalized solutions.',
                    'image' => '/assets/techmedia/team/team1.jpg',
                ],
            ],
        ];
    }

    private function getTestimonialsData(): ?array
    {
        return [
            'heading' => 'What Our Customers Say',
            'subheading' => 'Trusted by businesses, schools, offices and individuals across Tiruppur and beyond',
            'items' => [
                [
                    'quote' => 'Best service and genuine products. Their team helped us set up complete lab for our school with excellent after-sales support.',
                    'name' => 'Dr. Rajesh Kumar',
                    'role' => 'Principal',
                    'company' => 'Sri Vidya Matriculation School',
                ],
                [
                    'quote' => 'Fast repair turnaround and transparent pricing. Got my workstation upgraded with RTX 4070 in just 2 days!',
                    'name' => 'Vikram S',
                    'role' => 'Freelance Video Editor',
                    'company' => 'Freelancer',
                    //                    'avatar' => '/assets/testimonials/vikram.jpg',
                ],
                [
                    'quote' => 'Bulk purchase of 45 laptops for our office was seamless. Great pricing and on-site installation included.',
                    'name' => 'Priya Menon',
                    'role' => 'IT Manager',
                    'company' => 'Global Exports Pvt Ltd',
                    //                    'avatar' => '/assets/testimonials/priya.jpg',
                ],
                [
                    'quote' => 'Professional CCTV installation with clear 4K footage and mobile app access. Very satisfied!',
                    'name' => 'Mohanraj P',
                    'role' => 'Shop Owner',
                    'company' => 'Mohan Textiles',
                ],
                // add more as needed
            ],
        ];
    }

    private function callToAction(): ?array
    {
        return ['backgroundColor' => '#2B166D',
            'title' => 'Build Your Perfect Computer Setup Today',
            'description' => "Visit our showroom in Tiruppur or contact us for custom PC builds,\n".
                "bulk hardware orders, workstation configurations, gaming rigs,\n".
                'CCTV & networking solutions, and exclusive pricing.',
            'buttonText' => 'Get Quote or Visit Us',
            'buttonHref' => '/web-contacts?source=cta',
            'buttonBg' => 'bg-amber-500',
            'buttonTextColor' => 'text-black',
            'buttonHoverBg' => 'hover:bg-amber-300', ];

    }
}
