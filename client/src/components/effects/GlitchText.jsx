/**
 * GlitchText — Reusable glitch text effect component.
 * Wraps text with CSS glitch animation layers.
 */
import { useReducedMotion } from '../../hooks/useMediaQuery'

export default function GlitchText({
    children,
    as = 'span',
    className = '',
    intensity = 'normal',
}) {
    const reducedMotion = useReducedMotion()

    if (reducedMotion) {
        const Tag = as
        return <Tag className={className}>{children}</Tag>
    }

    const intensityStyles = {
        subtle: {
            animationDuration: '2000ms',
            shadowSpread: '0.025em',
        },
        normal: {
            animationDuration: '500ms',
            shadowSpread: '0.05em',
        },
        intense: {
            animationDuration: '200ms',
            shadowSpread: '0.08em',
        },
    }

    const style = intensityStyles[intensity] || intensityStyles.normal
    const Tag = as

    return (
        <Tag
            className={`glitch-text relative inline-block ${className}`}
            style={{
                animation: `glitch ${style.animationDuration} infinite`,
            }}
        >
            {children}
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                    transform: `translate(-${style.shadowSpread}, -${parseFloat(style.shadowSpread) * 0.5}em)`,
                    opacity: 0.8,
                    animation: `glitch ${parseInt(style.animationDuration) * 1.3}ms infinite`,
                }}
            >
                {children}
            </span>
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    clipPath: 'polygon(0 80%, 100% 20%, 100% 100%, 0 100%)',
                    transform: `translate(${parseFloat(style.shadowSpread) * 0.25}em, ${parseFloat(style.shadowSpread) * 0.5}em)`,
                    opacity: 0.8,
                    animation: `glitch ${parseInt(style.animationDuration) * 0.75}ms infinite`,
                }}
            >
                {children}
            </span>
        </Tag>
    )
}
