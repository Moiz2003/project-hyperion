import { motion, AnimatePresence } from 'framer-motion'

const AGENT_META = {
  vision:   { label: 'Vision Agent',   color: 'cyan',    icon: '👁',  desc: 'InternVL-Chat-V1-5' },
  drafter:  { label: 'Drafter Agent',  color: 'violet',  icon: '✍',  desc: 'Meditron-70B' },
  critic:   { label: 'Critic Agent',   color: 'amber',   icon: '⚖',  desc: 'Llama-3-70B' },
}

const COLOR = {
  cyan:   { ring: 'ring-cyan-500',   bg: 'bg-cyan-950/40',   text: 'text-cyan-400',   glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]',  dot: 'bg-cyan-400',   pulse: 'shadow-[0_0_10px_rgba(34,211,238,0.8)]' },
  violet: { ring: 'ring-violet-500', bg: 'bg-violet-950/40', text: 'text-violet-400', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.5)]',  dot: 'bg-violet-400', pulse: 'shadow-[0_0_10px_rgba(139,92,246,0.8)]' },
  amber:  { ring: 'ring-amber-500',  bg: 'bg-amber-950/40',  text: 'text-amber-400',  glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',  dot: 'bg-amber-400',  pulse: 'shadow-[0_0_10px_rgba(245,158,11,0.8)]' },
}

function AgentNode({ agentKey, event, elapsed, iteration, revision }) {
  const meta = AGENT_META[agentKey]
  const c = COLOR[meta.color]
  const isActive = event === 'start'
  const isDone = event === 'done'
  const isFailed = event === 'failed'
  const isRetry = event === 'retry'

  const stateLabel = isActive ? (revision ? 'Revising...' : 'Processing...')
    : isDone ? (elapsed || 'Done')
    : isFailed ? 'Failed'
    : isRetry ? 'Retrying...'
    : 'Standby'

  const stateColor = isDone ? 'text-emerald-400'
    : isFailed ? 'text-red-400'
    : isActive || isRetry ? c.text
    : 'text-slate-600'

  const ringClass = isActive || isRetry ? `ring-2 ${c.ring} ${c.glow}`
    : isDone ? 'ring-1 ring-emerald-500/50'
    : isFailed ? 'ring-1 ring-red-500/50'
    : 'ring-1 ring-slate-800'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex flex-col gap-2 p-4 rounded-2xl bg-slate-900/60 backdrop-blur ${ringClass} transition-shadow duration-300`}
    >
      {(isActive || isRetry) && (
        <motion.div
          className={`absolute inset-0 rounded-2xl ${c.bg} opacity-30`}
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <div className="flex items-center gap-3 relative z-10">
        <span className="text-xl">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold tracking-widest uppercase ${c.text}`}>
              {meta.label}{revision ? ' (revision)' : ''}{iteration && iteration > 1 ? ` ·pass ${iteration}` : ''}
            </span>
            {isActive && (
              <motion.span
                className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot} ${c.pulse}`}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-[10px] text-slate-600 font-mono">{meta.desc}</span>
        </div>
        <span className={`text-[10px] font-mono font-bold ${stateColor} whitespace-nowrap`}>{stateLabel}</span>
      </div>
    </motion.div>
  )
}

function Arrow({ rejected }) {
  return (
    <div className="flex items-center justify-center my-1">
      <div className={`flex flex-col items-center gap-0.5 ${rejected ? 'text-red-500' : 'text-slate-700'}`}>
        {rejected && <span className="text-[9px] font-bold tracking-widest uppercase text-red-500">Rejected</span>}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 12L2 5h12L8 12z" />
        </svg>
      </div>
    </div>
  )
}

export default function SwarmVisualizer({ events, latency, mode }) {
  // Reconstruct display state from event log
  const agentStates = {}
  let lastRejected = false

  for (const ev of events) {
    if (ev.type === 'agent_start') {
      agentStates[ev.agent] = { event: 'start', iteration: ev.iteration, revision: ev.revision }
      lastRejected = false
    } else if (ev.type === 'agent_done') {
      agentStates[ev.agent] = { event: 'done', elapsed: ev.elapsed, iteration: ev.iteration, revision: ev.revision }
    } else if (ev.type === 'agent_failed') {
      agentStates[ev.agent] = { event: 'failed', iteration: ev.iteration }
    } else if (ev.type === 'agent_retry') {
      agentStates[ev.agent] = { event: 'retry' }
    } else if (ev.type === 'critic_rejected') {
      agentStates.critic = { event: 'done', elapsed: ev.elapsed, iteration: ev.iteration }
      lastRejected = true
    } else if (ev.type === 'critic_accepted') {
      agentStates.critic = { event: 'done', elapsed: ev.elapsed, iteration: ev.iteration }
      lastRejected = false
    }
  }

  const interventions = events.find(e => e.type === 'critic_accepted')?.interventions
    ?? [...events].reverse().find(e => e.type === 'critic_rejected')?.interventions
    ?? 0

  const isDone = events.some(e => e.type === 'pipeline_complete')
  const urgency = events.find(e => e.type === 'pipeline_complete')?.data?.urgency_flag
    ?? events.find(e => e.type === 'critic_accepted')?.urgency_flag

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Swarm Activity</span>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600">
          <span className="uppercase">Mode: <strong className={mode === 'demo' ? 'text-amber-400' : 'text-cyan-400'}>{mode}</strong></span>
          {latency && <span>Total: <strong className="text-slate-400">{latency}</strong></span>}
        </div>
      </div>

      <AnimatePresence mode="sync">
        {(agentStates.vision) && (
          <motion.div key="vision-node" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <AgentNode agentKey="vision" {...agentStates.vision} />
          </motion.div>
        )}
        {(agentStates.vision) && (agentStates.drafter) && (
          <motion.div key="arrow-v-d" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Arrow />
          </motion.div>
        )}
        {(agentStates.drafter) && (
          <motion.div key="drafter-node" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <AgentNode agentKey="drafter" {...agentStates.drafter} />
          </motion.div>
        )}
        {(agentStates.drafter) && (agentStates.critic) && (
          <motion.div key="arrow-d-c" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Arrow rejected={lastRejected} />
          </motion.div>
        )}
        {(agentStates.critic) && (
          <motion.div key="critic-node" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <AgentNode agentKey="critic" {...agentStates.critic} />
          </motion.div>
        )}
      </AnimatePresence>

      {isDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 text-lg">✅</span>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Consensus Reached</p>
              <p className="text-[10px] text-slate-500 font-mono">{interventions} critic intervention{interventions !== 1 ? 's' : ''} · {latency}</p>
            </div>
          </div>
          {urgency && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-widest
              ${urgency === 'High' ? 'text-red-400 border-red-500/50 bg-red-950/40' : 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40'}`}>
              {urgency}
            </span>
          )}
        </motion.div>
      )}
    </div>
  )
}
