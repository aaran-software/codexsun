import { motion } from 'framer-motion';

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

export default function PageStagger({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}
