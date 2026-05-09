/**
 * useScrollProgress — Hook for scroll-driven animations.
 * Wraps Framer Motion's useScroll + useTransform for common patterns.
 */
import { useScroll, useTransform } from 'framer-motion'

/**
 * Create a value that maps scroll progress to an output range.
 * @param {Array} inputRange - Scroll progress range [0, 1]
 * @param {Array} outputRange - Output values to map to
 * @param {Object} options - Additional useScroll options
 */
export function useScrollTransform(inputRange, outputRange, options = {}) {
    const { scrollYProgress } = useScroll(options)
    return useTransform(scrollYProgress, inputRange, outputRange)
}

/**
 * Create a parallax Y offset based on scroll.
 * @param {number} speed - Parallax speed factor (1 = normal, 0.5 = half speed, -0.5 = reverse)
 */
export function useParallax(speed = 0.5) {
    const { scrollY } = useScroll()
    return useTransform(scrollY, (y) => y * speed)
}

/**
 * Get opacity based on element visibility in viewport.
 * Returns 0 when below viewport, 1 when in view, 0 when above.
 */
export function useFadeOnScroll() {
    const { scrollYProgress } = useScroll()
    return useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
}

/**
 * Get a blur value based on scroll position.
 * Useful for MRI focus effect.
 */
export function useBlurOnScroll(peakPosition = 0.3) {
    const { scrollYProgress } = useScroll()
    return useTransform(
        scrollYProgress,
        [0, peakPosition - 0.1, peakPosition, peakPosition + 0.1, 1],
        ['blur(20px)', 'blur(5px)', 'blur(0px)', 'blur(5px)', 'blur(20px)']
    )
}
