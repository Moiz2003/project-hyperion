import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HyperionLogo } from '../Logo'
import HUDIcons from '../components/Dashboard/HUDIcons'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col gap-3 animate-pulse">
      <div className="h-2.5 w-24 rounded bg-slate-800" />
      <div className="h-8 w-16 rounded bg-slate-800" />
      <div className="h-2 w-32 rounded bg-slate-800/60" />
    </div>
  )
}

function SkeletonSection({ rows = 1, height = 'h-16' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 animate-pulse space-y-4">
      <div className="h-2.5 w-40 rounded bg-slate-800" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} w-full rounded bg-slate-800/60`} />
      ))}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonSection rows={3} height="h-2" />
      <SkeletonSection rows={1} height="h-16" />
    </div>
  )
}

function StatCard({ label, value, sub, color = 'cyan' }) {
  const colors = {
    cyan:   'text-cyan-400   border-cyan-500/30   bg-cyan-950/20',
    emerald:'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    amber:  'text-amber-400  border-amber-500/30  bg-amber-950/20',
    red:    'text-red-400    border-red-500/30    bg-red-950/20',
    violet: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 flex flex-col gap-1 ${colors[color]}`}
    >
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <span className={`text-3xl font-bold font-inter ${colors[color].split(' ')[0]}`}>{value}</span>
      {sub && <span className="text-xs text-slate-600 font-mono">{sub}</span>}
    </motion.div>
  )
}

function UrgencyBar({ label, count, total, color }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  const barColors = { High: 'bg-red-500', Moderate: 'bg-amber-500', Low: 'bg-emerald-500' }
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColors[label]}`}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-12 text-right">{count} ({pct}%)</span>
    </div>
  )
}

function Sparkline({ timeline }) {
  if (!timeline || timeline.length === 0) return null
  const max = Math.max(...timeline.map(t => t.interventions), 1)
  const w = 400
  const h = 60
  const pad = 8
  const pts = timeline.map((t, i) => {
    const x = pad + (i / Math.max(timeline.length - 1, 1)) * (w - pad * 2)
    const y = h - pad - ((t.interventions / max) * (h - pad * 2))
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="rgba(34,211,238,0.7)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {timeline.map((t, i) => {
        const [x, y] = pts[i].split(',').map(Number)
        return (
          <circle
            key={i}
            cx={x} cy={y} r="3"
            fill={t.urgency === 'High' ? '#ef4444' : t.urgency === 'Low' ? '#10b981' : '#f59e0b'}
          />
        )
      })}
    </svg>
  )
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/analytics`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setData(d.data)
        else setError(d.message || 'Failed to load analytics')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const urgencyTotal = data
    ? (data.urgency_distribution.High + data.urgency_distribution.Moderate + data.urgency_distribution.Low)
    : 0

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-inter p-6 selection:bg-cyan-500/30">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="flex items-center justify-between pb-6 border-b border-slate-800/60">
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <HyperionLogo horizontal className="h-14 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold tracking-widest uppercase text-slate-500 hover:text-cyan-400 transition-colors border border-slate-800 px-4 py-2 rounded-full hover:border-cyan-500/40"
            >
              ← Dashboard
            </button>
          </div>
        </header>

        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <h1 className="text-sm font-bold tracking-widest uppercase text-slate-300">Swarm Performance Analytics</h1>
        </div>

        {loading && <AnalyticsSkeleton />}

        {error && (
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm font-mono">
            {error === 'Persistence unavailable'
              ? 'MongoDB is not connected. Analytics require database access.'
              : error}
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Scans" value={data.total_scans} color="cyan" />
              <StatCard label="Success Rate" value={`${data.success_rate}%`} sub={`${data.partial_count} partial responses`} color="emerald" />
              <StatCard label="First-Pass Consensus" value={`${data.consensus_first_pass_rate}%`} sub="No critic revision needed" color="violet" />
              <StatCard label="Avg Critic Interventions" value={data.avg_critic_interventions} sub="per scan" color="amber" />
              <StatCard label="High Urgency" value={data.urgency_distribution.High} sub={`of ${urgencyTotal} total`} color="red" />
              <StatCard label="Partial Responses" value={data.partial_count} sub="degraded pipeline runs" color="amber" />
            </div>

            {/* Urgency distribution */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30"
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Urgency Distribution</h2>
              <div className="space-y-4">
                <UrgencyBar label="High" count={data.urgency_distribution.High} total={urgencyTotal} />
                <UrgencyBar label="Moderate" count={data.urgency_distribution.Moderate} total={urgencyTotal} />
                <UrgencyBar label="Low" count={data.urgency_distribution.Low} total={urgencyTotal} />
              </div>
            </motion.div>

            {/* Top departments */}
            {data.top_departments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30"
              >
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Top Recommended Departments</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {data.top_departments.map((d, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50">
                      <span className="text-xs text-slate-400 font-medium">{d.dept}</span>
                      <span className="text-sm font-bold text-cyan-400 font-inter">{d.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Critic interventions sparkline */}
            {data.timeline.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30"
              >
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Critic Interventions — Last {data.timeline.length} Scans
                </h2>
                <p className="text-[10px] font-mono text-slate-700 mb-4">
                  Dots: <span className="text-red-500">High</span> / <span className="text-amber-500">Moderate</span> / <span className="text-emerald-500">Low</span> urgency
                </p>
                <Sparkline timeline={data.timeline} />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
