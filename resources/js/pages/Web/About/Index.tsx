'use client';

import { Head } from '@inertiajs/react';
import FooterSection from '@/components/blocks/footers/FooterSection';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import type { AboutPageProps } from '@/lib/tenant/about.types';
import TeamSection from '@/pages/Web/About/blocks/TeamSection';
import TestimonialsSection from '@/pages/Web/About/blocks/TestimonialsSection';
import AboutSection from '@/pages/Web/Home/blocks/AboutSection';
import CallToAction from '@/pages/Web/Home/blocks/CallToAction';
import FeaturesSection from '@/pages/Web/Home/blocks/Features';
import HeroSection from '@/pages/Web/Home/blocks/HeroSection';
import WhyChooseUs from '@/pages/Web/Home/blocks/WhyChooseUs';

export default function AboutPage({
    abouts,
    hero,
    footer,
    company,
    whyChooseUs,
    features,
    team,
    testimonials,
    callToAction,
}: AboutPageProps) {
    return (
        <WebLayout>
            <Head title="About Us" />
            <MenuBackdrop
                image="/assets/techmedia/images/services-hero.jpg"
                title="About"
                subtitle="Built on Trust. Driven by Technology."
            />

            <HeroSection hero={hero} />
            <AboutSection abouts={abouts} />
            <WhyChooseUs whyChooseUs={whyChooseUs} />
            <FeaturesSection features={features} />

            <TeamSection team={team} />
            <TestimonialsSection testimonials={testimonials} />
            <CallToAction CallToAction={callToAction} />

            <FooterSection footer={footer} company={company} />
        </WebLayout>
    );
}
