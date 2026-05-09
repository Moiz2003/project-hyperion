/**
 * ParticleField — Canvas-based particle system.
 * Renders 80 floating particles with mouse-responsive movement.
 * Uses Canvas 2D for performance (no DOM overhead).
 */
import { useRef, useEffect, useCallback } from 'react'
import { useMousePosition } from '../../hooks/useMousePosition'
import { useReducedMotion } from '../../hooks/useMediaQuery'

const PARTICLE_COUNT = 80
const CONNECTION_DISTANCE = 120
const PARTICLE_SPEED = 0.3
const MOUSE_INFLUENCE = 0.02

export default function ParticleField({ className = '' }) {
    const canvasRef = useRef(null)
    const particlesRef = useRef([])
    const animFrameRef = useRef(null)
    const { normalized } = useMousePosition()
    const reducedMotion = useReducedMotion()

    const initParticles = useCallback((width, height) => {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * PARTICLE_SPEED,
            vy: (Math.random() - 0.5) * PARTICLE_SPEED,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
        }))
    }, [])

    useEffect(() => {
        if (reducedMotion) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio
            canvas.height = canvas.offsetHeight * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
            if (particlesRef.current.length === 0) {
                initParticles(canvas.offsetWidth, canvas.offsetHeight)
            }
        }

        resize()
        window.addEventListener('resize', resize)

        const animate = () => {
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            ctx.clearRect(0, 0, w, h)

            const particles = particlesRef.current
            const mx = normalized.x * w
            const my = normalized.y * h

            // Update particles
            for (const p of particles) {
                p.x += p.vx
                p.y += p.vy

                // Mouse influence
                const dx = mx - p.x
                const dy = my - p.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 200) {
                    const force = (200 - dist) / 200 * MOUSE_INFLUENCE
                    p.vx += dx * force * 0.01
                    p.vy += dy * force * 0.01
                }

                // Damping
                p.vx *= 0.99
                p.vy *= 0.99

                // Wrap around edges
                if (p.x < 0) p.x = w
                if (p.x > w) p.x = 0
                if (p.y < 0) p.y = h
                if (p.y > h) p.y = 0
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < CONNECTION_DISTANCE) {
                        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }

            // Draw particles
            for (const p of particles) {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`
                ctx.fill()
            }

            animFrameRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        }
    }, [normalized, reducedMotion, initParticles])

    if (reducedMotion) return null

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-0 ${className}`}
            aria-hidden="true"
        />
    )
}
