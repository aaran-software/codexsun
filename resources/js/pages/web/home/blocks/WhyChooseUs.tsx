import Features from './features';
import FadeUp from '@/components/animate/fade-up';

export default function WhyChooseUs() {
    const features = [
        {
            title: 'Direct Factory Sourcing',
            description: 'Supplied directly from Tirupur manufacturing units',
        },
        {
            title: 'Factory-Level Pricing',
            description: 'Better margins for wholesalers and retailers',
        },
        {
            title: 'Bulk & Custom Orders',
            description: 'Corporate, institutional, and promotional supply',
        },
        {
            title: 'TEAMA Backed',
            description: 'Operated by a trusted manufacturers association',
        },
        {
            title: 'Consistent Quality',
            description: 'Reliable standards and repeat supply capability',
        },
        {
            title: 'Wholesale Focused',
            description: 'Designed for B2B garment buyers',
        },
    ];

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">

                <FadeUp>
                    <h2 className="mb-8 text-2xl font-semibold">
                        Why Choose Us
                    </h2>
                </FadeUp>

                <Features features={features} />
            </div>
        </section>
    );
}
