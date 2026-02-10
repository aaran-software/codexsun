import {
    BadgeCheck,
    Factory,
    IndianRupee,
    ShieldCheck,
    Truck,
    Users,
} from 'lucide-react';

const features = [
    {
        title: 'Direct Factory Sourcing',
        description:
            'Garments supplied directly from Tirupur manufacturing units, removing intermediaries and providing better control over quality, timelines, and supply.',
        icon: Factory,
    },
    {
        title: 'Factory-Level Pricing',
        description:
            'Cost-efficient pricing structured for wholesalers, retailers, and bulk buyers, supporting competitive margins and long-term business sustainability.',
        icon: IndianRupee,
    },
    {
        title: '600+ Manufacturing Units',
        description:
            'Backed by TEAMA and its network of verified Tirupur manufacturers, offering production scale, reliability, and diversified capabilities.',
        icon: BadgeCheck,
    },
    {
        title: 'Bulk & Custom Requirements',
        description:
            'Production systems designed to handle bulk volumes, custom specifications, and time-bound requirements across different business segments.',
        icon: Truck,
    },
    {
        title: 'Consistent Quality',
        description:
            'Standardized manufacturing processes and quality checks ensure uniform output, consistency, and dependable performance for repeat orders.',
        icon: ShieldCheck,
    },
    {
        title: 'Wholesale, Corporate & Institutional Supply',
        description:
            'A B2B-focused sourcing model serving wholesale distribution, corporate programs, institutional buyers, and large-volume garment orders.',
        icon: Users,
    },
];


export default function WhyChooseUs() {
    return (
        <section className="bg-gray-50 py-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-16 max-w-3xl">
                    <h2 className="mb-4 text-3xl font-semibold text-gray-900">
                        Why Choose The Tirupur Textiles
                    </h2>
                    <p className="text-gray-600">
                        A factory outlet model powered by Tirupur’s
                        manufacturing strength — built to serve wholesalers,
                        retailers, and corporate buyers.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={index}
                                className="rounded-xl bg-white p-8 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Icon */}
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-black text-white">
                                    <Icon size={22} />
                                </div>

                                {/* Text */}
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                    {feature.title}
                                </h3>

                                <p className="text-sm leading-relaxed text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
