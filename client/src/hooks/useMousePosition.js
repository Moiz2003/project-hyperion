/**
 * useMousePosition — Hook for tracking mouse position.
 * Used for cursor glow effects and parallax interactions.
 */
import { useState, useEffect, useCallback } from 'react'

export function useMousePosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [normalized, setNormalized] = useState({ x: 0.5, y: 0.5 })

    const handleMouseMove = useCallback((e) => {
        const x = e.clientX
        const y = e.clientY
        setPosition({ x, y })
        setNormalized({
            x: x / (typeof window !== 'undefined' ? window.innerWidth : 1),
            y: y / (typeof window !== 'undefined' ? window.innerHeight : 1),
        })
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [handleMouseMove])

    return { position, normalized }
}
