import { motion } from 'framer-motion';

type Props = {
    src: string;
    alt: string;
    className?: string;
};

export default function MotionImage({ src, alt, className }: Props) {
    return (
        <motion.img
            src={src}
            alt={alt}
            loading="lazy"
            className={className}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        />
    );
}
