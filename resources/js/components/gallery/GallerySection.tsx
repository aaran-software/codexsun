import { GalleryItem } from '@/pages/web/tirupur-textiles/data/GalleryData';

type Props = {
    hero: {
        title: string;
        description: string;
        background: string;
    };
    items: GalleryItem[];
};

export default function GallerySection({ hero, items }: Props) {
    return (
        <div>
            {/* HERO */}
            <div className="relative w-full h-[400px] flex items-center justify-center">
                <img
                    src={hero.background}
                    alt={hero.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/90" />

                <div className="relative z-10 text-center text-white">
                    <h1 className="text-4xl font-bold mb-3">{hero.title}</h1>
                    <p className="px-4 lg:px-[20%]">{hero.description}</p>
                </div>
            </div>

            {/* GALLERY */}
            <div className="my-12 px-4">

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className={`group relative overflow-hidden rounded-lg ${
                                item.className || ""
                            }`}
                        >
                            {/\.(mp4|webm|ogg|mov)$/i.test(item.src) ? (
                                <video
                                    src={item.src}
                                    className="w-full h-full object-cover"
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={item.src}
                                    alt={item.alt}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            )}

                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/60 transition">
                <span className="text-white text-sm sm:text-lg opacity-0 group-hover:opacity-100">
                  {item.alt}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
