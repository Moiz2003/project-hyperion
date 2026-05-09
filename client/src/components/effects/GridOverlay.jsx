/**
 * GridOverlay — Subtle grid background overlay.
 * Adds a tech/HUD aesthetic to the page background.
 */
export default function GridOverlay({ className = '' }) {
    return (
        <div
            className={`fixed inset-0 pointer-events-none z-[1] ${className}`}
            style={{
                backgroundImage: `
          linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
        `,
                backgroundSize: '40px 40px',
            }}
            aria-hidden="true"
        />
    )
}
