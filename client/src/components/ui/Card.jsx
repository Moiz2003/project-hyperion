/**
 * Card — Glassmorphic card with hover lift and border glow.
 */
import { motion } from 'framer-motion'

export default function Card({
    children,
    className = '',
    hover = true,
    glow = true,
    padding = 'p-6',
    ...props
}) {
    return (
        <motion.div
            whileHover={hover ? { y: -4 } : undefined}
            className={`
        rounded-2xl border backdrop-blur-xl transition-all duration-300
        ${glow ? 'border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_8px_32px_rgba(34,211,238,0.1)]' : 'border-slate-800'}
        bg-slate-900/30
        ${padding}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    )
}
