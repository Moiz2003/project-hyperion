/**
 * formatters — Reusable formatting utilities for the Hyperion frontend.
 */

/**
 * Format a latency string (e.g., "3.2s") from seconds or milliseconds.
 */
export function formatLatency(seconds) {
    if (seconds == null) return '—'
    const num = typeof seconds === 'string' ? parseFloat(seconds) : seconds
    if (isNaN(num)) return '—'
    if (num < 1) return `${Math.round(num * 1000)}ms`
    return `${num.toFixed(1)}s`
}

/**
 * Format a percentage value.
 */
export function formatPct(value, decimals = 0) {
    if (value == null || isNaN(value)) return '—'
    return `${Number(value).toFixed(decimals)}%`
}

/**
 * Format a number with commas.
 */
export function formatNumber(num) {
    if (num == null || isNaN(num)) return '—'
    return Number(num).toLocaleString('en-US')
}

/**
 * Format a date for display in scan history.
 */
export function formatScanDate(dateStr) {
    if (!dateStr) return 'Unknown'
    try {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return 'Unknown'
    }
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str, len = 60) {
    if (!str) return ''
    return str.length > len ? str.slice(0, len) + '…' : str
}

/**
 * Format a confidence score from critic interventions.
 */
export function confidenceScore(results) {
    if (!results) return '—'
    if (results.partial) return '62%'
    if (results.critic_interventions === 0) return '98%'
    return `${Math.max(70, 100 - results.critic_interventions * 9)}%`
}

/**
 * Get a confidence tooltip explaining the score.
 */
export function confidenceTooltip(results) {
    if (!results) return ''
    if (results.partial) return 'Partial pipeline — one or more agents degraded'
    if (results.critic_interventions === 0) return 'Zero critic interventions — consensus on first pass'
    return `${results.critic_interventions} critic intervention${results.critic_interventions !== 1 ? 's' : ''} · formula: max(70, 100 − n×9)`
}
