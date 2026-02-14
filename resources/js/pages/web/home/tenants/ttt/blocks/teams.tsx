
'use client';

import TeamCard from '@/components/blocks/teams/TeamCard';


const experts = [
    {
        id: 1,
        name: 'David Thompson',
        role: 'Chief Executive Officer',
        image: '/assets/team.jpg',
        bio: 'With 20+ years in the textile industry, David leads our vision for innovation and excellence.',
    },
    {
        id: 2,
        name: 'Jennifer Martinez',
        role: 'Head of Operations',
        image: '/assets/team.jpg',
        bio: 'Jennifer ensures seamless operations and maintains our commitment to quality standards.',
    },
    {
        id: 3,
        name: 'Robert Anderson',
        role: 'Technical Director',
        image: '/assets/team.jpg',
        bio: 'Robert drives our technical innovation and oversees product development initiatives.',
    },
    {
        id: 4,
        name: 'Lisa Wang',
        role: 'Customer Success Manager',
        image: '/assets/team.jpg',
        bio: 'Lisa ensures every client receives exceptional service and support throughout their journey.',
    },
];

export default function CtaSection() {
    return (
        <TeamCard
            TeamMember={experts}
            title={'Meet Our Experts'}
            description={
                ' The talented professionals driving innovation and excellence at Texties Company.'
            }
        />
    );
}
