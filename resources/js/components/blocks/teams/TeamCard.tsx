import { Card,CardContent } from '@/components/ui/card';


interface TeamData{
    id:number;
    name:string;
    role:string;
    image:string;
    bio?:string
}
interface TeamProps{
    TeamMember:TeamData[];
    title:string
    description:string
}
export default function TeamCard({TeamMember,title,description}:TeamProps){
    return(
        <section className="py-16 md:py-24 px-4 md:px-[10%]">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                        {title}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        {description}
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {TeamMember.map((expert) => (
                        <Card
                            key={expert.id}
                            className="overflow-hidden border-border/50 transition-shadow hover:shadow-lg py-0"
                        >
                            <div className="aspect-square overflow-hidden">
                                <img
                                    src={expert.image}
                                    alt={expert.name}
                                    className="h-full w-full object-cover transition-transform hover:scale-105"
                                />
                            </div>
                            <CardContent className="p-3">
                                <h3 className="mb-1 text-xl font-semibold">
                                    {expert.name}
                                </h3>
                                <p className="mb-3 text-sm font-medium text-primary">
                                    {expert.role}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {expert.bio}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
