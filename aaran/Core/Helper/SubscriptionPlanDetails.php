<?php
namespace Aaran\Assets\Helper;
use Illuminate\Support\Collection;
class SubscriptionPlanDetails
{
    public static function all(): array
    {
        return [
            [
                'id' => 'trial',
                'title' => 'Trial',
                'price' => '0',
                'description' => 'Explore all features for free. Limited time access.',
                'btn_text' => 'Start my free trial',
                'features' => [
                    'Send 2 quotes and invoices',
                    'Connect 1 bank account',
                    'Track up to 5 expenses',
                    'Manual payroll support',
                    'Basic report access',
                ],
                'highlighted' => false,
                'customized' => false,
            ],
            [
                'id' => 'basic',
                'title' => 'Basic',
                'price' => '1',
                'description' => 'For freelancers & beginners. Simple GST billing to get you started.',
                'btn_text' => 'Subscribe Now',
                'features' => [
                    'Send 10 quotes and invoices',
                    'Connect up to 2 bank accounts',
                    'Track up to 15 expenses per month',
                    'Manual payroll support',
                    'Export up to 3 reports',
                ],
                'highlighted' => false,
                'customized' => false,
            ],
            [
                'id' => 'medium',
                'title' => 'Small Business',
                'price' => '1500',
                'description' => 'For growing businesses. More users, smart reports, and inventory tools.',
                'btn_text' => 'Subscribe Now',
                'features' => [
                    'Send 50 quotes and invoices',
                    'Connect up to 5 bank accounts',
                    'Track unlimited expenses',
                    'Automated payroll support',
                    'Export up to 10 reports',
                ],
                'highlighted' => true,
                'customized' => false,
            ],
            [
                'id' => 'enterprise',
                'title' => 'Enterprise',
                'price' => '3000',
                'description' => 'For power users. Full features, advanced insights, and payroll.',
                'btn_text' => 'Subscribe Now',
                'features' => [
                    'Unlimited quotes and invoices',
                    'Unlimited bank connections',
                    'Advanced expense tracking',
                    'Full payroll automation',
                    'Unlimited reporting & analytics',
                ],
                'highlighted' => false,
                'customized' => false,
            ],
            [
                'id' => 'elite',
                'title' => 'Elite',
                'price' => 'Custom price',
                'description' => 'For unique needs. Tailored tools, custom access, and support.',
                'btn_text' => 'Subscribe Now',
                'features' => [
                    'Full Customizable',
                    'Unlimited quotes and invoices',
                    'Unlimited bank connections',
                    'Advanced expense tracking',
                    'Full payroll automation',
                    'Unlimited reporting & analytics',
                ],
                'highlighted' => false,
                'customized' => true,
            ],
        ];
    }

    public static function getById(string $id): ?array
    {
        return collect(self::all())->firstWhere('id', $id);
    }
    public static function getWithoutTrial(): Collection
    {
        return collect(self::all())
            ->reject(fn ($plan) => $plan['id'] === 'trial')
            ->values();
    }

    public static function getWithTrial(string $selectedId): Collection
    {
        return collect(self::all())->filter(fn ($plan) => in_array($plan['id'], ['trial', $selectedId]));
    }
}
