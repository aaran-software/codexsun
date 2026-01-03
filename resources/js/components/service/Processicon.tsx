import { LucideIcon } from 'lucide-react';

interface ProcessData{
    icon:LucideIcon
    title:string;
    description:string
}
interface Props{
    processSteps:ProcessData[]
    title:string
    description:string
}
export default function ProcessIcon({processSteps,title,description}:Props){
    return(
        <section className="bg-muted/30 py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                    {processSteps.map((step, index) => (
                        <div key={index} className="relative text-center">
                            <div className="mb-4 flex justify-center z-10">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                                    <step.icon className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.description}</p>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
