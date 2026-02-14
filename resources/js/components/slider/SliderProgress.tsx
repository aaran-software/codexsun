import { motion } from 'framer-motion';

export default function SliderProgress({ progress }: { progress: number }) {
    const circumference = 2 * Math.PI * 26;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <svg width="56" height="56" className="-rotate-90">
                <circle
                    cx="28"
                    cy="28"
                    r="26"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                    fill="none"
                />
                <motion.circle
                    cx="28"
                    cy="28"
                    r="26"
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}
