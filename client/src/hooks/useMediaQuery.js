/**
 * useMediaQuery — Hook for responsive breakpoint detection.
 */
import { useState, useEffect } from 'react'

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches
        }
        return false
    })

    useEffect(() => {
        const mql = window.matchMedia(query)
        const handler = (e) => setMatches(e.matches)
        mql.addEventListener('change', handler)
        return () => mql.removeEventListener('change', handler)
    }, [query])

    return matches
}

/**
 * Predefined breakpoint hooks.
 */
export function useIsMobile() {
    return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet() {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop() {
    return useMediaQuery('(min-width: 1024px)')
}

export function useReducedMotion() {
    return useMediaQuery('(prefers-reduced-motion: reduce)')
}
