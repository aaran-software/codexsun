import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { Highlighter } from '@/components/ui/highlighter';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { WordRotate } from '@/components/ui/word-rotate';
import Layout from '@/layouts/app-layout';

export default function Index() {
    return (
        <Layout>
            <Head title="Index" />

            <a
                href="https://magicui.design/docs/components"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
                Magic UI
                <ExternalLink className="h-4 w-4" />
            </a>

            <div className="p-10">
                <WordRotate
                    words={['Sundar', 'Admin', 'Tenant', 'Dashboard']}
                    duration={1800}
                    className="text-5xl font-bold text-primary"
                />
            </div>

            <div className={'p-20 pt-10'}>
                The{' '}
                <Highlighter action="underline" color="#FF9800">
                    Magic UI Highlighter
                </Highlighter>{' '}
                makes important{' '}
                <Highlighter action="highlight" color="#87CEFA">
                    text stand out
                </Highlighter>{' '}
                effortlessly.
            </div>

            <div className={'justify-left flex gap-1.5 p-5'}>
                <ShimmerButton className="shadow-2xl" shimmerSize={'0.2rem'}>
                    <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-lg dark:from-white dark:to-slate-900/10">
                        Shimmer Button
                    </span>
                </ShimmerButton>
            </div>
        </Layout>
    );
}
