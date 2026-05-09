/**
 * constants — Shared constants for the Hyperion frontend.
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
}

export const ENGINE_MODES = {
    clinical: {
        key: 'clinical',
        label: 'Deep Clinical',
        description: 'Full adversarial consensus loop — up to 3 agent iterations',
        color: 'cyan',
        icon: 'Activity',
    },
    demo: {
        key: 'demo',
        label: 'Fast Demo',
        description: 'Single-pass analysis — fast for stage demonstrations',
        color: 'indigo',
        icon: 'GraduationCap',
    },
    edu: {
        key: 'edu',
        label: 'Education',
        description: 'Socratic learning mode — hint-based discovery for residents',
        color: 'indigo',
        icon: 'GraduationCap',
    },
    batch: {
        key: 'batch',
        label: 'Batch',
        description: 'Multi-image parallel analysis — up to 5 scans at once',
        color: 'violet',
        icon: 'Activity',
    },
}

export const URGENCY_COLORS = {
    High: { text: 'text-red-400', bg: 'bg-red-950/20', border: 'border-red-500/30', bar: 'bg-red-500' },
    Moderate: { text: 'text-amber-400', bg: 'bg-amber-950/20', border: 'border-amber-500/30', bar: 'bg-amber-500' },
    Low: { text: 'text-emerald-400', bg: 'bg-emerald-950/20', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
}

export const AGENT_META = {
    vision: { label: 'Vision Agent (Geometry)', color: '#00c8ff', desc: 'InternVL-Chat-V1-5' },
    drafter: { label: 'Draft Agent (Revision)', color: '#00c8ff', desc: 'Meditron-70B' },
    critic: { label: 'Critic Agent (Pass 2)', color: '#00c8ff', desc: 'Llama-3-70B' },
}

export const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB
export const MAX_SSE_BUFFER_BYTES = 1_048_576 // 1 MB
export const STORAGE_KEY = 'hyperion_scan_history'
export const POLL_INTERVAL = 30_000 // 30s
