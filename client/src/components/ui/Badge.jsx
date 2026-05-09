/**
 * Badge — Status badge with optional pulse animation.
 */
import { cn } from '../../utils/cn'

const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    red: 'text-red-400 border-red-500/30 bg-red-950/20',
    violet: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
    indigo: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30',
    slate: 'text-slate-400 border-slate-700 bg-slate-900/40',
}

export default function Badge({
    children,
    color = 'slate',
    pulse = false,
    className = '',
    dot = false,
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase',
                colorMap[color] || colorMap.slate,
                pulse && 'animate-pulse',
                className
            )}
        >
            {dot && (
                <span
                    className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        color === 'red' && 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]',
                        color === 'emerald' && 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
                        color === 'amber' && 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]',
                        color === 'cyan' && 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]',
                    )}
                />
            )}
            {children}
        </span>
    )
}
