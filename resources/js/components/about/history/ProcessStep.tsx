
interface processData{
    number:string
    title:string
    description:string
}
interface ProcessStepProps{
    processSteps:processData[]
}
export default function ProcessStep({processSteps}:ProcessStepProps){
    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
                <div key={index} className="relative">
                    <div className="mb-4 flex items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
                            {step.number}
                        </div>
                        {index < processSteps.length - 1 && (
                            <div className="ml-4 hidden h-0.5 flex-1 bg-gradient-to-r from-primary to-secondary lg:block" />
                        )}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">
                        {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                        {step.description}
                    </p>
                </div>
            ))}
        </div>

    )
}
