interface PageHeroProps {
    image: string;
    title: string;
    subtitle: string;
}

export default function MenuBackdrop({
    image,
    title,
    subtitle,
}: PageHeroProps) {
    return (
        <section className="relative h-56 overflow-hidden px-4">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
            >
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/60 to-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full w-full items-center justify-center">
                <div className="space-y-6 text-white">
                    <div className="text-center text-2xl font-bold tracking-widest">
                        {title}
                    </div>
                    <p className="text-center text-xl opacity-90">{subtitle}</p>
                </div>
            </div>
        </section>
    );
}
