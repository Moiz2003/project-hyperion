/**
 * ProgressBar — Animated progress bar with glow.
 */
import { motion } from 'framer-motion'

export default function ProgressBar({
    value = 0,
    max = 100,
    color = 'cyan',
    height = 'h-1.5',
    showLabel = false,
    className = '',
}) {
    const pct = max === 0 ? 0 : Math.min(Math.round((value / max) * 100), 100)

    const colorClasses = {
        cyan: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
        emerald: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        amber: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
        red: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        violet: 'bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]',
    }

    return (
        <div
            className={`flex items-center gap-3 ${className}`}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`Progress: ${pct}%`}
        >
            <div className={`flex-1 ${height} bg-slate-800 rounded-full overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colorClasses[color] || colorClasses.cyan}`}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-inter text-slate-400 w-10 text-right">{pct}%</span>
            )}
        </div>
    )
}
