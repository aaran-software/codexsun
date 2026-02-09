import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
};

export default function SectionFadeUp({
    children,
}: {
    children: React.ReactNode;
}) {
    return <motion.section variants={itemVariants}>{children}</motion.section>;
}
