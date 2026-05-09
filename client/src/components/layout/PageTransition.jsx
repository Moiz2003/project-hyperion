/**
 * PageTransition — Unified page transition wrapper for all routes.
 * Provides consistent enter/exit animations with blur, scale, and opacity.
 */
import { motion } from 'framer-motion'

const TRANSITION = {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1], // ease-out-expo
}

const variants = {
    initial: {
        opacity: 0,
        y: 60,
        scale: 0.98,
        filter: 'blur(20px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
    },
    exit: {
        opacity: 0,
        y: -60,
        scale: 1.02,
        filter: 'blur(20px)',
    },
}

export default function PageTransition({ children, keyProp }) {
    return (
        <motion.div
            key={keyProp}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITION}
            className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
            {children}
        </motion.div>
    )
}
