'use client';

import { HelpCircle, Laptop, Monitor, Wrench } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section className="px-4 py-20 md:px-[10%]">
            <div className="container">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        What We Offer
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Professional hardware solutions and expert technical
                        services
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Laptop className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Laptop Sales</h3>
                        <p className="text-muted-foreground">
                            New and refurbished laptops from top brands at
                            competitive prices
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Monitor className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">
                            Custom PC Builds
                        </h3>
                        <p className="text-muted-foreground">
                            Desktop PC assembly and customization tailored to
                            your needs
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Wrench className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">
                            Computer Repairs
                        </h3>
                        <p className="text-muted-foreground">
                            Fast and reliable repair services for all computer
                            issues
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">
                            Hardware Consultation
                        </h3>
                        <p className="text-muted-foreground">
                            Expert advice to help you choose the right hardware
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
