import FadeUp from '@/components/animate/fade-up';

export default function TimelineTeamSection() {
    const timeline = [
        {
            year: '5 Jan 2026',
            title: 'Establishment of The Tirupur Textiles',
            description:
                'The Tirupur Textiles was established in Puducherry as a factory outlet showroom connecting Tirupur manufacturers with B2B buyers.',
        },
        {
            year: '2026',
            title: 'Association with TEAMA',
            description:
                'Operations aligned with TEAMA to ensure verified manufacturing, scale, and structured sourcing.',
        },
        {
            year: '2026',
            title: 'Wholesale & Corporate Focus',
            description:
                'Built to serve wholesalers, retailers, institutions, and corporate buyers with bulk and repeat sourcing needs.',
        },
    ];

    const team = [
        {
            name: 'Mr. A. Kumar',
            designation: 'Managing Director',
            company: 'The Tirupur Textiles',
        },
        {
            name: 'Mr. S. Ramesh',
            designation: 'Operations Head',
            company: 'The Tirupur Textiles',
        },
        {
            name: 'Ms. P. Lakshmi',
            designation: 'Sourcing & Production Manager',
            company: 'The Tirupur Textiles',
        },
        {
            name: 'Mr. K. Venkatesh',
            designation: 'Sales & Business Development',
            company: 'The Tirupur Textiles',
        },
    ];

    return (
        <section className="bg-gray-50 py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-20 max-w-3xl">
                    <FadeUp>
                        <h2 className="text-3xl font-semibold text-gray-900">
                            Our Journey & Leadership
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.1}>
                        <div className="mt-4 h-px w-24 bg-gray-300" />
                    </FadeUp>
                </div>

                <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
                    {/* TIMELINE */}
                    <div>
                        <FadeUp>
                            <h3 className="mb-10 text-xl font-semibold text-gray-900">
                                Our Journey
                            </h3>
                        </FadeUp>

                        <div className="space-y-10 border-l border-gray-300 pl-8">
                            {timeline.map((item, index) => (
                                <FadeUp key={index} delay={0.1 * index}>
                                    <div className="relative">
                                        <span className="absolute top-1.5 -left-9.5 h-3 w-3 rounded-full bg-gray-900" />

                                        <p className="text-sm font-medium text-gray-500">
                                            {item.year}
                                        </p>

                                        <h4 className="mt-1 text-lg font-semibold text-gray-900">
                                            {item.title}
                                        </h4>

                                        <p className="mt-2 text-gray-600">
                                            {item.description}
                                        </p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>

                    {/* TEAM */}
                    <div>
                        <FadeUp>
                            <h3 className="mb-10 text-xl font-semibold text-gray-900">
                                Leadership Team
                            </h3>
                        </FadeUp>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            {team.map((member, index) => (
                                <FadeUp key={index} delay={0.1 * index}>
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-600">
                                            {member.name.charAt(0)}
                                        </div>

                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {member.name}
                                        </h4>

                                        <p className="text-sm text-gray-600">
                                            {member.designation}
                                        </p>

                                        <p className="mt-1 text-xs tracking-wide text-gray-500 uppercase">
                                            {member.company}
                                        </p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
