import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { slides } from './slider.data';

export default function SliderControls({
    current,
    setCurrent,
    isPlaying,
    setIsPlaying,
}: any) {
    return (
        <>
            <button
                onClick={() =>
                    setCurrent((current - 1 + slides.length) % slides.length)
                }
                className="absolute top-1/2 left-6 -translate-y-1/2 text-white opacity-70 transition hover:opacity-100"
            >
                <ChevronLeft size={32} />
            </button>

            <button
                onClick={() => setCurrent((current + 1) % slides.length)}
                className="absolute top-1/2 right-6 -translate-y-1/2 text-white opacity-70 transition hover:opacity-100"
            >
                <ChevronRight size={32} />
            </button>

            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white"
            >
                {isPlaying ? <Pause /> : <Play />}
            </button>
        </>
    );
}
