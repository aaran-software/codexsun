// resources/js/pages/web/home/blocks/TeamSection.tsx

'use client';

import FadeUp from '@/components/blocks/animate/fade-up';
import type { TeamData} from '@/lib/tenant/about.types';

interface TeamSectionProps {
    team?: TeamData | null;
}
export default function TeamSection({ team }: TeamSectionProps) {
    if (!team || !team.members?.length) return null;

    const { heading, subheading, members } = team;

    return (
        <section className="bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <FadeUp>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {heading}
                        </h2>
                    </FadeUp>

                    {team.subheading && (
                        <FadeUp delay={0.1}>
                            <p className="mt-4 text-lg leading-8 text-gray-600">
                                {subheading}
                            </p>
                        </FadeUp>
                    )}

                    <FadeUp delay={0.15}>
                        <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-primary" />
                    </FadeUp>
                </div>
                {/* Team Grid */}

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {members.map((member, index) => (
                        <FadeUp key={member.name} delay={0.08 * index}>
                            <div className="group relative overflow-hidden rounded-xl bg-gray-50 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md">
                                {/* Image - smaller aspect */}
                                <div className="aspect-square overflow-hidden">
                                    {member.image ? (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-5xl font-bold text-gray-400">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                {/* Content - more compact */}
                                <div className="relative px-5 pt-4 pb-6 text-center">
                                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary">
                                        {member.name}
                                    </h3>
                                    <p className="mt-1 text-xs font-medium text-gray-600">
                                        {member.designation}
                                    </p>

                                    {member.bio && (
                                        <p className="mt-3 line-clamp-2 text-xs text-gray-600 group-hover:line-clamp-3">
                                            {member.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}
