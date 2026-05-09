/**
 * GradientOrb — Floating gradient orbs for background ambiance.
 * Uses CSS transforms for GPU-accelerated animation.
 */
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useMediaQuery'

export default function GradientOrb({
    color = 'from-cyan-500/20 to-blue-500/20',
    size = 'w-96 h-96',
    position = 'top-0 right-0',
    parallaxSpeed = 0.3,
    className = '',
}) {
    const reducedMotion = useReducedMotion()
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 1000], [0, 1000 * parallaxSpeed])

    if (reducedMotion) return null

    return (
        <motion.div
            style={{ y }}
            className={`
        fixed pointer-events-none z-0 rounded-full blur-[120px]
        bg-gradient-to-br ${color} ${size} ${position} ${className}
      `}
            aria-hidden="true"
        />
    )
}
