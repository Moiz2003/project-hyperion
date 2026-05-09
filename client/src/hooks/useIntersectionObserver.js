/**
 * useIntersectionObserver — Hook for lazy loading and viewport detection.
 */
import { useState, useEffect, useRef } from 'react'

export function useIntersectionObserver(options = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const [hasIntersected, setHasIntersected] = useState(false)
    const ref = useRef(null)

    const {
        threshold = 0,
        root = null,
        rootMargin = '0px',
        triggerOnce = true,
    } = options

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                const intersecting = entry.isIntersecting
                setIsIntersecting(intersecting)
                if (intersecting) {
                    setHasIntersected(true)
                    if (triggerOnce) {
                        observer.unobserve(element)
                    }
                }
            },
            { threshold, root, rootMargin }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [threshold, root, rootMargin, triggerOnce])

    return { ref, isIntersecting, hasIntersected }
}
