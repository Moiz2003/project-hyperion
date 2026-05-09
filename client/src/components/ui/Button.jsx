/**
 * Button — Primary UI button with ripple effect, glow, and variants.
 */
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const variants = {
    primary:
        'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:shadow-[0_0_30px_rgba(0,217,255,0.3)]',
    secondary:
        'bg-slate-900/40 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-cyan-400/50',
    ghost:
        'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50',
    danger:
        'bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/40 hover:border-red-500/50',
}

const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm',
    xl: 'px-8 py-4 text-sm',
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    ...props
}) {
    const [ripples, setRipples] = useState([])

    const handleClick = useCallback(
        (e) => {
            if (disabled || loading) return
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const id = Date.now()
            setRipples((prev) => [...prev, { x, y, id }])
            setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
            if (onClick) onClick(e)
        },
        [disabled, loading, onClick]
    )

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={handleClick}
            className={`
        relative overflow-hidden rounded-lg font-inter font-bold tracking-widest uppercase
        transition-all duration-300 select-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {children}
                </span>
            ) : (
                children
            )}

            {/* Ripple effect */}
            {ripples.map((r) => (
                <span
                    key={r.id}
                    className="absolute rounded-full bg-white/20 pointer-events-none"
                    style={{
                        left: r.x,
                        top: r.y,
                        width: 5,
                        height: 5,
                        animation: 'ripple 0.6s ease-out forwards',
                    }}
                />
            ))}

            <style>{`
        @keyframes ripple {
          to {
            transform: scale(40);
            opacity: 0;
          }
        }
      `}</style>
        </button>
    )
}
