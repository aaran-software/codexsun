import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, LucideIcon } from 'lucide-react';
export interface serviceData {
    icon: LucideIcon
    title: string
    description: string
    features?: string[]
}

interface  ServiceCardProps{
    services:serviceData[]
    title:string;
    description:string
    className?:string
}
export default function ServiceCard({ services,title,description,className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }:ServiceCardProps) {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                        {title}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className={`gap-8 ${className}`}>
                    {services.map((service, index) => (
                        <Card
                            key={index}
                            className="border-border/50 transition-shadow hover:shadow-lg"
                        >
                            <CardHeader>
                                <div className="mb-4 inline-flex w-max rounded-lg bg-primary/10 p-3">
                                    <service.icon className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">
                                    {service.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-muted-foreground">
                                    {service.description}
                                </p>
                                {service.features && (
                                    <ul className="space-y-2">
                                        {service.features.map(
                                            (feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start text-sm"
                                                >
                                                    <CheckCircle2 className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                                                    <span>{feature}</span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
