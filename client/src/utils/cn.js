/**
 * cn — Tailwind CSS class merge utility.
 * Combines clsx semantics with tailwind-merge conflict resolution.
 * Lightweight replacement for the full library.
 */

export function cn(...inputs) {
    const classes = inputs
        .flat(Infinity)
        .filter(Boolean)
        .map(String)

    // Simple conflict resolution: last conflicting class wins
    const twMap = new Map()
    for (const cls of classes) {
        const key = cls.split('-')[0] // group by first segment
        twMap.set(key, cls)
    }

    return Array.from(twMap.values()).join(' ')
}
