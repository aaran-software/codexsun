'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function CtaSection() {
    return (
        <section className="bg-primary/5 py-20">
            <div className="container">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        Need Computer Sales or Repair Services?
                    </h2>
                    <p className="mb-8 text-lg text-muted-foreground">
                        Contact us today for expert advice, competitive pricing, and reliable service
                    </p>
                    <Button asChild size="lg">
                        <a href="/web-contacts">
                            Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}
