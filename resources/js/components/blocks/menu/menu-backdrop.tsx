interface PageHeroProps {
    image: string;
    title: string;
    subtitle: string;
}

export default function MenuBackdrop({ image, title, subtitle }: PageHeroProps) {
    return (
        <section className="relative px-4 h-56 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
            >
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/60 to-black/50" />
            </div>

            {/* Content */}
            <div className="w-full relative z-10 flex h-full justify-center items-center">
                <div className="space-y-6 text-white">
                    <div className="text-2xl text-center font-bold tracking-widest">
                        {title}
                    </div>
                    <p className="text-xl text-center opacity-90">
                        {subtitle}
                    </p>
                </div>
            </div>
        </section>
    );
}
