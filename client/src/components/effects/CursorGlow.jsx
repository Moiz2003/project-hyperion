/**
 * CursorGlow — Mouse-following glow effect.
 * Creates a subtle radial gradient that follows the cursor.
 */
import { useMousePosition } from '../../hooks/useMousePosition'
import { useReducedMotion } from '../../hooks/useMediaQuery'

export default function CursorGlow({
    size = 300,
    color = 'rgba(34, 211, 238, 0.04)',
    className = ''
}) {
    const { position } = useMousePosition()
    const reducedMotion = useReducedMotion()

    if (reducedMotion) return null

    return (
        <div
            className={`fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300 ${className}`}
            style={{
                background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent 70%)`,
            }}
            aria-hidden="true"
        />
    )
}
