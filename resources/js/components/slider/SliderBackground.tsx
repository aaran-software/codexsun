import { motion } from 'framer-motion';
import { Slide } from './slider.types';

export default function SliderBackground({
    slide,
    videoRef,
}: {
    slide: Slide;
    videoRef: any;
}) {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {slide.media.type === 'image' && (
                <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.media.src})` }}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 8 }}
                />
            )}

            {slide.media.type === 'video' && (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                >
                    <source src={slide.media.mp4} />
                </video>
            )}

            {slide.media.type === 'youtube' && (
                <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${slide.media.videoId}?autoplay=1&mute=1&loop=1&playlist=${slide.media.videoId}&controls=0`}
                    allow="autoplay; fullscreen"
                />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
    );
}
