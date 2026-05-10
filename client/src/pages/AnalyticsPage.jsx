import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HyperionLogo } from '../Logo'
import HUDIcons from '../components/Dashboard/HUDIcons'
import ConfidenceGauge from '../components/charts/ConfidenceGauge'
import DepartmentChart from '../components/charts/DepartmentChart'
import PageTransition from '../components/layout/PageTransition'
import Container from '../components/layout/Container'
import ParticleField from '../components/effects/ParticleField'
import GridOverlay from '../components/effects/GridOverlay'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/* ── Skeleton Loading ── */
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

/* ── Stat Card ── */
function StatCard({ label, value, sub, color = 'cyan', icon, delay = 0 }) {
  const colors = {
    cyan: 'text-cyan-400   border-cyan-500/30   bg-cyan-950/20',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    amber: 'text-amber-400  border-amber-500/30  bg-amber-950/20',
    red: 'text-red-400    border-red-500/30    bg-red-950/20',
    violet: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`rounded-2xl border p-5 flex flex-col gap-1 relative overflow-hidden group ${colors[color]}`}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(34,211,238,0.06), transparent 40%)`,
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
        {icon && <span className="text-slate-600">{icon}</span>}
      </div>
      <motion.span
        className="text-3xl font-bold font-inter"
        style={{ color: colors[color].split(' ')[0] }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring', stiffness: 150 }}
      >
        {value}
      </motion.span>
      {sub && <span className="text-xs text-slate-600 font-inter">{sub}</span>}
    </motion.div>
  )
}

/* ── Urgency Bar ── */
function UrgencyBar({ label, count, total, color }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  const barColors = { High: 'bg-red-500', Moderate: 'bg-amber-500', Low: 'bg-emerald-500' }
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-inter text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColors[label]}`}
        />
      </div>
      <span className="text-xs font-inter text-slate-400 w-12 text-right">{count} ({pct}%)</span>
    </div>
  )
}

/* ── Sparkline ── */
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
      {/* Gradient fill under line */}
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0.2)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </linearGradient>
      </defs>
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        points={`${pts[0].split(',')[0]},${h - pad} ${pts.join(' ')} ${pts[pts.length - 1].split(',')[0]},${h - pad}`}
        fill="url(#spark-fill)"
      />
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
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
          <motion.circle
            key={i}
            cx={x} cy={y} r="3"
            fill={t.urgency === 'High' ? '#ef4444' : t.urgency === 'Low' ? '#10b981' : '#f59e0b'}
            initial={{ r: 0 }}
            animate={{ r: 3 }}
            transition={{ delay: 1 + i * 0.05 }}
          />
        )
      })}
    </svg>
  )
}

/* ── Section Wrapper ── */
function Section({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        {icon && <span className="text-slate-500">{icon}</span>}
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

/* ── Main Page ── */
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
    <PageTransition>
      <div className="min-h-screen bg-[#020617] text-slate-200 font-inter relative">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <ParticleField particleCount={40} />
          <GridOverlay />
        </div>

        <Container className="relative z-10 py-6">
          <div className="space-y-8">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between pb-6 border-b border-blue-500/20"
            >
              <div className="cursor-pointer" onClick={() => navigate('/')}>
                <HyperionLogo horizontal className="h-14 w-auto" />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-cyan-400 transition-colors border border-slate-700 px-4 py-2 rounded-full hover:border-cyan-400/50"
                >
                  ← Dashboard
                </button>
              </div>
            </motion.header>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              />
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-300">
                Swarm Performance Analytics
              </h1>
            </motion.div>

            {/* Loading */}
            {loading && <AnalyticsSkeleton />}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm font-inter"
              >
                {error === 'Persistence unavailable'
                  ? 'MongoDB is not connected. Analytics require database access.'
                  : error}
              </motion.div>
            )}

            {/* Data */}
            {data && (
              <div className="space-y-8">
                {/* KPI grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard label="Total Scans" value={data.total_scans} color="cyan" icon={<HUDIcons.Activity />} delay={0} />
                  <StatCard label="Success Rate" value={`${data.success_rate}%`} sub={`${data.partial_count} partial responses`} color="emerald" delay={0.05} />
                  <StatCard label="First-Pass Consensus" value={`${data.consensus_first_pass_rate}%`} sub="No critic revision needed" color="violet" delay={0.1} />
                  <StatCard label="Avg Critic Interventions" value={data.avg_critic_interventions} sub="per scan" color="amber" delay={0.15} />
                  <StatCard label="High Urgency" value={data.urgency_distribution.High} sub={`of ${urgencyTotal} total`} color="red" delay={0.2} />
                  <StatCard label="Partial Responses" value={data.partial_count} sub="degraded pipeline runs" color="amber" delay={0.25} />
                </div>

                {/* Two-column layout for gauges + urgency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Confidence gauge */}
                  <Section
                    title="Overall Confidence"
                    icon={<HUDIcons.Brain />}
                    delay={0.3}
                  >
                    <div className="flex justify-center py-4">
                      <ConfidenceGauge
                        value={data.success_rate || 0}
                        size={160}
                        strokeWidth={10}
                        label="Success Rate"
                        color={data.success_rate >= 80 ? 'emerald' : data.success_rate >= 60 ? 'amber' : 'red'}
                      />
                    </div>
                  </Section>

                  {/* Urgency distribution */}
                  <Section
                    title="Urgency Distribution"
                    icon={<HUDIcons.Activity />}
                    delay={0.35}
                  >
                    <div className="space-y-4 pt-2">
                      <UrgencyBar label="High" count={data.urgency_distribution.High} total={urgencyTotal} />
                      <UrgencyBar label="Moderate" count={data.urgency_distribution.Moderate} total={urgencyTotal} />
                      <UrgencyBar label="Low" count={data.urgency_distribution.Low} total={urgencyTotal} />
                    </div>
                  </Section>
                </div>

                {/* Top departments with chart */}
                {data.top_departments.length > 0 && (
                  <Section
                    title="Top Recommended Departments"
                    icon={<HUDIcons.FileText />}
                    delay={0.4}
                  >
                    <DepartmentChart
                      departments={data.top_departments}
                      maxCount={Math.max(...data.top_departments.map(d => d.count), 1)}
                    />
                  </Section>
                )}

                {/* Critic interventions sparkline */}
                {data.timeline.length > 1 && (
                  <Section
                    title={`Critic Interventions — Last ${data.timeline.length} Scans`}
                    icon={<HUDIcons.Users />}
                    delay={0.45}
                  >
                    <p className="text-[10px] font-inter text-slate-700 mb-4">
                      Dots: <span className="text-red-500">High</span> /{' '}
                      <span className="text-amber-500">Moderate</span> /{' '}
                      <span className="text-emerald-500">Low</span> urgency
                    </p>
                    <Sparkline timeline={data.timeline} />
                  </Section>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>
    </PageTransition>
  )
}
