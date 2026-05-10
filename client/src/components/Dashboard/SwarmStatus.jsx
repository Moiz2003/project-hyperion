import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const POLL_INTERVAL = 30_000

const AGENT_LABELS = { vision: 'Vision', drafter: 'Drafter', critic: 'Critic' }

export default function SwarmStatus() {
  const [agents, setAgents] = useState(null)
  const [mongo, setMongo] = useState(null)

  const poll = () => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(d => {
        // Map monolithic backend response: "ok" → "up", "unreachable" → "unreachable"
        const mapped = {}
        if (d.agents) {
          for (const [name, status] of Object.entries(d.agents)) {
            mapped[name] = status === 'ok' ? 'up' : status
          }
        }
        setAgents(mapped)
        setMongo(d.mongo || null)
      })
      .catch(() => {
        setAgents(null)
        setMongo(null)
      })
  }

  useEffect(() => {
    poll()
    const id = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [])

  if (!agents) return null

  const allUp = Object.values(agents).every(s => s === 'up')
  const anyDown = Object.values(agents).some(s => s !== 'up')
  const overallColor = allUp ? 'bg-emerald-500' : anyDown ? 'bg-red-500' : 'bg-amber-500'
  const overallGlow = allUp
    ? 'shadow-[0_0_8px_rgba(52,211,153,0.8)]'
    : anyDown ? 'shadow-[0_0_8px_rgba(239,68,68,0.8)]'
      : 'shadow-[0_0_8px_rgba(245,158,11,0.8)]'

  return (
    <div className="group relative flex items-center gap-2 cursor-default select-none">
      <div className={`w-2 h-2 rounded-full ${overallColor} ${overallGlow}`} />
      <span className={`text-[9px] font-bold uppercase tracking-widest hidden md:block ${allUp ? 'text-emerald-400/90' : anyDown ? 'text-red-400/90' : 'text-slate-400'}`}>
        {allUp ? 'All agents online' : anyDown ? 'Agent degraded' : 'Checking...'}
      </span>

      {/* Tooltip */}
      <div className="absolute top-full left-0 mt-2 z-50 hidden group-hover:flex flex-col gap-1 p-3 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl min-w-[180px]">
        {Object.entries(agents).map(([name, status]) => {
          const up = status === 'up'
          return (
            <div key={name} className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-inter text-slate-400">{AGENT_LABELS[name] || name}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${up ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={`text-[9px] font-bold uppercase ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {up ? 'Up' : status}
                </span>
              </div>
            </div>
          )
        })}
        {mongo && (
          <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-slate-800">
            <span className="text-[10px] font-inter text-slate-500">MongoDB</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${mongo === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`text-[9px] font-bold uppercase ${mongo === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {mongo}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
