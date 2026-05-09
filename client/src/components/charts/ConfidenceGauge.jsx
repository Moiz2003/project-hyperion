/**
 * ConfidenceGauge — Animated arc gauge for confidence scores.
 * Used in AnalyticsPage and Education Mode diagnosis match.
 */
import { motion } from 'framer-motion'

export default function ConfidenceGauge({
    value = 0,
    size = 120,
    strokeWidth = 8,
    label = 'Confidence',
    color = 'cyan',
    animated = true,
}) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    const colorMap = {
        cyan: { stroke: '#22d3ee', gradient: ['#22d3ee', '#06b6d4'] },
        emerald: { stroke: '#34d399', gradient: ['#34d399', '#10b981'] },
        amber: { stroke: '#fbbf24', gradient: ['#fbbf24', '#f59e0b'] },
        red: { stroke: '#f87171', gradient: ['#f87171', '#ef4444'] },
        violet: { stroke: '#a78bfa', gradient: ['#a78bfa', '#8b5cf6'] },
        indigo: { stroke: '#818cf8', gradient: ['#818cf8', '#6366f1'] },
    }

    const colors = colorMap[color] || colorMap.cyan
    const gradientId = `gauge-${color}-${value}`

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={colors.gradient[0]} />
                            <stop offset="100%" stopColor={colors.gradient[1]} />
                        </linearGradient>
                    </defs>

                    {/* Background track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(34, 211, 238, 0.1)"
                        strokeWidth={strokeWidth}
                    />

                    {/* Value arc */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={animated ? { strokeDashoffset: circumference } : false}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>

                {/* Center value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-2xl font-bold font-inter"
                        style={{ color: colors.stroke }}
                        initial={animated ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        {Math.round(value)}%
                    </motion.span>
                </div>
            </div>

            {label && (
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                    {label}
                </span>
            )}
        </div>
    )
}
