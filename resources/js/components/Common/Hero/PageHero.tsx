interface PageHeroProps {
    image: string;
    title: string;
    subtitle: string;
}

export default function PageHero({ image, title, subtitle }: PageHeroProps) {
    return (
        <section className="relative h-[400px] px-4 md:px-[10%] overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />
            </div>

            {/* Content */}
            <div className="container relative z-10 flex h-full items-center">
                <div className="max-w-3xl space-y-4 text-white">
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90">
                        {subtitle}
                    </p>
                </div>
            </div>
        </section>
    );
}
