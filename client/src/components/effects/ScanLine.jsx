/**
 * ScanLine — CRT scanline overlay effect.
 * Adds a subtle horizontal line animation for a HUD feel.
 * Toggleable via the `active` prop.
 */
import { useReducedMotion } from '../../hooks/useMediaQuery'

export default function ScanLine({ active = false, className = '' }) {
    const reducedMotion = useReducedMotion()

    if (!active || reducedMotion) return null

    return (
        <div
            className={`fixed inset-0 pointer-events-none z-[2] overflow-hidden ${className}`}
            aria-hidden="true"
        >
            {/* Scanline moving down */}
            <div
                className="absolute left-0 right-0 h-[2px] opacity-30"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.4), transparent)',
                    animation: 'scanline 4s linear infinite',
                }}
            />

            {/* Subtle horizontal lines overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
            />

            <style>{`
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
        </div>
    )
}
