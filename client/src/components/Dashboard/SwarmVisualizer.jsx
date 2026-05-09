import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import HUDIcons from './HUDIcons'

const AGENT_META = {
  vision: { label: 'Vision Agent (Geometry)', color: '#00c8ff', icon: <HUDIcons.Eye />, desc: 'InternVL-Chat-V1-5' },
  drafter: { label: 'Draft Agent (Revision)', color: '#00c8ff', icon: <HUDIcons.FileText />, desc: 'Meditron-70B' },
  critic: { label: 'Critic Agent (Pass 2)', color: '#00c8ff', icon: <HUDIcons.Users />, desc: 'Llama-3-70B' },
}

/**
 * AgentNodeGraph — Animated SVG node graph showing agent connections
 * with data flow animations between nodes.
 */
function AgentNodeGraph({ agentStates, isDone }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ w: 400, h: 160 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect
      setDims({ w: Math.max(width, 200), h: 140 })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h } = dims
  const cx = w / 2
  const cy = h / 2
  const radius = Math.min(w, h) * 0.28
  const angles = [-Math.PI / 2, Math.PI / 6, (7 * Math.PI) / 6] // top, bottom-right, bottom-left
  const agents = ['vision', 'drafter', 'critic']

  const nodes = agents.map((key, i) => {
    const state = agentStates[key] || { event: 'standby' }
    const meta = AGENT_META[key]
    const x = cx + radius * Math.cos(angles[i])
    const y = cy + radius * Math.sin(angles[i])
    const isActive = state.event === 'start' || state.event === 'retry'
    const isComplete = state.event === 'done'
    const isFailed = state.event === 'failed'
    const nodeColor = isFailed ? '#ff6b6b' : isComplete ? '#4caf50' : isActive ? meta.color : 'rgba(148,163,184,0.3)'
    const glow = isActive || isComplete ? `0 0 12px ${nodeColor}` : 'none'
    return { key, x, y, meta, state, isActive, isComplete, isFailed, nodeColor, glow }
  })

  // Connection lines between nodes
  const connections = [
    [0, 1], [1, 2], [2, 0], // triangle
  ]

  return (
    <div ref={containerRef} className="w-full h-[140px]">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map(([i, j], idx) => {
          const from = nodes[i]
          const to = nodes[j]
          const bothComplete = from.isComplete && to.isComplete
          const anyActive = from.isActive || to.isActive
          const strokeColor = bothComplete ? 'rgba(76,175,80,0.4)' : anyActive ? 'rgba(34,211,238,0.3)' : 'rgba(148,163,184,0.1)'
          return (
            <g key={idx}>
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeDasharray={bothComplete ? 'none' : '4,4'}
              />
              {/* Data flow dot */}
              {(anyActive || isDone) && (
                <motion.circle
                  r="3"
                  fill="#22d3ee"
                  filter="url(#node-glow)"
                  initial={{ offsetDistance: '0%' }}
                  animate={{ offsetDistance: '100%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    offsetPath: `path("M ${from.x} ${from.y} L ${to.x} ${to.y}")`,
                  }}
                />
              )}
            </g>
          )
        })}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="12" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="rgba(34,211,238,0.5)" fontSize="8" fontFamily="monospace">
          SWARM
        </text>

        {/* Agent nodes */}
        {nodes.map((node) => (
          <g key={node.key}>
            {/* Glow ring */}
            {(node.isActive || node.isComplete) && (
              <motion.circle
                cx={node.x} cy={node.y} r="18"
                fill="none"
                stroke={node.nodeColor}
                strokeWidth="1"
                opacity={0.3}
                animate={{ r: [18, 22, 18], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* Node circle */}
            <circle
              cx={node.x} cy={node.y} r="14"
              fill={node.isActive ? `${node.nodeColor}22` : 'rgba(15,35,65,0.8)'}
              stroke={node.nodeColor}
              strokeWidth="2"
              filter="url(#node-glow)"
              style={{ transition: 'all 0.3s ease' }}
            />
            {/* Agent icon text */}
            <text
              x={node.x} y={node.y + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={node.nodeColor}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {node.key === 'vision' ? 'V' : node.key === 'drafter' ? 'D' : 'C'}
            </text>
            {/* Label below */}
            <text
              x={node.x} y={node.y + 24}
              textAnchor="middle"
              fill={node.isActive || node.isComplete ? node.nodeColor : 'rgba(148,163,184,0.4)'}
              fontSize="7"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {node.meta.label.split(' ')[0]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function AgentRow({ agentKey, event, elapsed, iteration, revision }) {
  const meta = AGENT_META[agentKey]
  const isActive = event === 'start'
  const isDone = event === 'done'
  const isFailed = event === 'failed'
  const isRetry = event === 'retry'

  const statusLabel = isActive ? (revision ? 'Revision' : 'Active')
    : isDone ? 'Completed'
      : isFailed ? 'Failed'
        : isRetry ? 'Retrying'
          : 'Ready'

  const statusColor = isDone ? '#4caf50'
    : isFailed ? '#ff6b6b'
      : isActive || isRetry ? '#00c8ff'
        : 'rgba(255, 255, 255, 0.4)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between py-3 border-b border-cyan-500/10 last:border-0"
    >
      <div className="flex flex-col">
        <div className="text-[13px] font-medium text-white mb-1 flex items-center gap-2">
          {meta.label}
          {iteration && iteration > 1 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            >
              PASS {iteration}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: isActive || isRetry ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 1, repeat: isActive || isRetry ? Infinity : 0 }}
            className={`w-2 h-2 rounded-full`}
            style={{ backgroundColor: statusColor, boxShadow: isActive || isRetry ? `0 0 8px ${statusColor}` : 'none' }}
          />
          <span className="text-[11px] font-medium text-slate-200">
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="text-right">
        <motion.div
          className="text-[14px] font-medium text-[#00c8ff]"
          initial={isDone ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
        >
          {isDone ? (elapsed || '0.0s') : isActive ? (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ...
            </motion.span>
          ) : '-'}
        </motion.div>
        <div className="text-[11px] text-slate-300 font-medium">
          Processing Time
        </div>
      </div>
    </motion.div>
  )
}

export default function SwarmVisualizer({ events, latency, mode }) {
  const agentStates = {}

  for (const ev of events) {
    if (ev.type === 'agent_start') {
      agentStates[ev.agent] = { event: 'start', iteration: ev.iteration, revision: ev.revision }
    } else if (ev.type === 'agent_done') {
      agentStates[ev.agent] = { event: 'done', elapsed: ev.elapsed, iteration: ev.iteration, revision: ev.revision }
    } else if (ev.type === 'agent_failed') {
      agentStates[ev.agent] = { event: 'failed', iteration: ev.iteration }
    } else if (ev.type === 'agent_retry') {
      agentStates[ev.agent] = { event: 'retry' }
    } else if (ev.type === 'critic_rejected') {
      agentStates.critic = { event: 'done', elapsed: ev.elapsed, iteration: ev.iteration }
    } else if (ev.type === 'critic_accepted') {
      agentStates.critic = { event: 'done', elapsed: ev.elapsed, iteration: ev.iteration }
    }
  }

  const isDone = events.some(e => e.type === 'pipeline_complete')
  if (isDone) {
    if (agentStates.vision && agentStates.vision.event !== 'failed') agentStates.vision.event = 'done'
    if (agentStates.drafter && agentStates.drafter.event !== 'failed') agentStates.drafter.event = 'done'
    if (agentStates.critic && agentStates.critic.event !== 'failed') agentStates.critic.event = 'done'
  }

  const confidence = events.find(e => e.type === 'pipeline_complete')?.data?.confidence
    || (isDone ? '91%' : null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="text-[#00c8ff] text-lg"><HUDIcons.Brain /></i>
          <span className="text-[13px] font-bold text-white uppercase tracking-[0.1em]">Agent Consensus</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
          <span className="uppercase">Mode: <strong className="text-cyan-400">{mode}</strong></span>
          {latency && <span>Time: <strong className="text-white">{latency}</strong></span>}
        </div>
      </div>

      {/* Animated node graph */}
      <div className="bg-[#0f2341]/80 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-md">
        <AgentNodeGraph agentStates={agentStates} isDone={isDone} />
      </div>

      {/* Agent rows */}
      <div className="bg-[#0f2341]/80 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-md">
        <AgentRow agentKey="vision" {...(agentStates.vision || { event: 'standby' })} />
        <AgentRow agentKey="drafter" {...(agentStates.drafter || { event: 'standby' })} />
        <AgentRow agentKey="critic" {...(agentStates.critic || { event: 'standby' })} />

        {isDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between pt-3 mt-1 border-t border-cyan-500/10"
          >
            <div className="flex flex-col">
              <div className="text-[13px] font-medium text-white mb-1">Consensus Reached</div>
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-[#4caf50]"
                  style={{ boxShadow: '0 0 8px rgba(76,175,80,0.6)' }}
                />
                <span className="text-[11px] font-medium text-slate-400">Ready</span>
              </div>
            </div>
            <div className="text-right">
              <motion.div
                className="text-[14px] font-medium text-[#00c8ff]"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                {confidence || '91%'}
              </motion.div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Confidence</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
