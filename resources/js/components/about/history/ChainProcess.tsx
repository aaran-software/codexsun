import { Card, CardContent } from '@/components/ui/card';

interface MilestonesData{
    year:string;
    title:string
    description:string
}
interface ChainProcessProps{
    milestones:MilestonesData[]
    title:string;
    description:string
}
export default function ChainProcess({milestones,title,description}:ChainProcessProps){
    return(
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
                <div className="relative mx-auto max-w-4xl">
                    <div className="absolute top-0 left-8 h-full w-0.5 bg-gradient-to-b from-primary via-secondary to-primary md:left-1/2" />
                    <div className="space-y-12">
                        {milestones.map((milestone, index) => (
                            <div
                                key={index}
                                className={`relative flex items-center ${
                                    index % 2 === 0
                                        ? 'md:flex-row'
                                        : 'md:flex-row-reverse'
                                }`}
                            >
                                <div
                                    className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}
                                >
                                    <Card className="border-border/50">
                                        <CardContent className="p-6">
                                            <div className="mb-2 text-2xl font-bold text-primary">
                                                {milestone.year}
                                            </div>
                                            <h3 className="mb-2 text-xl font-semibold">
                                                {milestone.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {milestone.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="absolute top-0 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary md:left-1/2 md:-translate-x-1/2">
                                    <div className="h-3 w-3 rounded-full bg-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
