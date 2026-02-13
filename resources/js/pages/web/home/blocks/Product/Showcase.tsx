
'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function Showcase() {
    return (
        <section className="bg-muted/30 py-20 px-4 md:px-[10%]">
            <div className="container">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="flex flex-col justify-center space-y-6">
                        <h2 className="text-3xl font-bold md:text-4xl">Quality Hardware, Expert Service</h2>
                        <p className="text-lg text-muted-foreground">
                            Whether you need a new laptop for work, a custom gaming PC, or repairs for your existing computer, Techmedia has you covered. We work with leading brands and use quality components to ensure reliability and performance.
                        </p>
                        <p className="text-lg text-muted-foreground">
                            Our experienced technicians provide professional diagnostics, repairs, and upgrades. We also offer software development and IT support services to meet all your technology needs.
                        </p>
                        <div>
                            <Button asChild>
                                <a href="/portfolio">
                                    View Our Work <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <img
                            src="/assets/techmedia/repair.jpg"
                            alt="Custom PC Build"
                            className="rounded-lg shadow-lg"
                        />
                        <img
                            src="/assets/techmedia/pc.jpg"
                            alt="Laptop Repair Service"
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
