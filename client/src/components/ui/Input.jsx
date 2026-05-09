/**
 * Input — Themed input with glow focus ring and label float.
 */
import { useState } from 'react'
import { cn } from '../../utils/cn'

export default function Input({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    className = '',
    error,
    textarea = false,
    rows = 4,
    ...props
}) {
    const [focused, setFocused] = useState(false)
    const hasValue = value != null && value !== ''
    const isActive = focused || hasValue

    const sharedClasses = cn(
        'w-full bg-[#000] border rounded-xl px-4 py-3 text-slate-300 font-mono text-sm',
        'focus:outline-none focus:ring-1 transition-colors resize-y',
        error
            ? 'border-red-500/50 focus:border-red-400 focus:ring-red-400/50'
            : 'border-slate-700 focus:border-cyan-400 focus:ring-cyan-400/50',
        className
    )

    const Tag = textarea ? 'textarea' : 'input'

    return (
        <div className="relative">
            {label && (
                <label
                    className={cn(
                        'absolute left-4 transition-all duration-200 pointer-events-none font-mono text-xs',
                        isActive
                            ? '-top-2.5 text-[10px] bg-[#020617] px-1'
                            : 'top-3 text-slate-600',
                        error ? 'text-red-400' : isActive ? 'text-cyan-400' : ''
                    )}
                >
                    {label}
                </label>
            )}
            <Tag
                type={textarea ? undefined : type}
                value={value}
                onChange={onChange}
                placeholder={isActive ? placeholder : ''}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={textarea ? rows : undefined}
                className={sharedClasses}
                {...props}
            />
            {error && (
                <p className="mt-1 text-[10px] font-mono text-red-400">{error}</p>
            )}
        </div>
    )
}
