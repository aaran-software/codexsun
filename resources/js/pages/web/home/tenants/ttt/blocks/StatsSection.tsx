import Counter from '@/components/animate/counter';

export default function StatsSection() {
    return (
        <section className="border-t border-b bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <Counter value={25} suffix="+" label="Trusted Brands" />
                    <Counter
                        value={600}
                        suffix="+"
                        label="Manufacturing Units"
                    />
                    <Counter
                        value={100000}
                        suffix="+"
                        label="Monthly Capacity"
                    />
                    <Counter value={15} suffix="+" label="Years of Expertise" />
                </div>
            </div>
        </section>
    );
}
