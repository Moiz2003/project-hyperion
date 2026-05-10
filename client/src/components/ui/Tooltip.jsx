/**
 * Tooltip — Hover tooltip with delay and positioning.
 */
import { useState, useRef } from 'react'

export default function Tooltip({
    children,
    content,
    position = 'top',
    delay = 300,
    className = '',
}) {
    const [visible, setVisible] = useState(false)
    const timeoutRef = useRef(null)

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    }

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setVisible(true), delay)
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setVisible(false)
    }

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {visible && content && (
                <div
                    className={`
            absolute z-50 pointer-events-none
            px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl
            text-[10px] font-inter text-slate-400 whitespace-nowrap
            animate-[fadeIn_0.15s_ease-out]
            ${positionClasses[position] || positionClasses.top}
            ${className}
          `}
                >
                    {content}
                </div>
            )}
        </div>
    )
}
