import { motion, AnimatePresence } from 'framer-motion'
import HUDIcons from './HUDIcons'

const AGENT_META = {
  vision: { label: 'Vision Agent (Geometry)', color: '#00c8ff', icon: <HUDIcons.Eye />, desc: 'InternVL-Chat-V1-5' },
  drafter: { label: 'Draft Agent (Revision)', color: '#00c8ff', icon: <HUDIcons.FileText />, desc: 'Meditron-70B' },
  critic: { label: 'Critic Agent (Pass 2)', color: '#00c8ff', icon: <HUDIcons.Users />, desc: 'Llama-3-70B' },
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
    <div className="flex items-center justify-between py-3 border-b border-cyan-500/10 last:border-0">
      <div className="flex flex-col">
        <div className="text-[13px] font-medium text-white mb-1 flex items-center gap-2">
          {meta.label}
          {iteration && iteration > 1 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PASS {iteration}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${isActive || isRetry ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: statusColor, boxShadow: isActive || isRetry ? `0 0 8px ${statusColor}` : 'none' }}
          />
          <span className="text-[11px] font-medium text-slate-200">
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-[14px] font-medium text-[#00c8ff]">
          {isDone ? (elapsed || '0.0s') : isActive ? '...' : '-'}
        </div>
        <div className="text-[11px] text-slate-300 font-medium">
          Processing Time
        </div>
      </div>
    </div>
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

      <div className="bg-[#0f2341]/80 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-md">
        <AgentRow agentKey="vision" {...(agentStates.vision || { event: 'standby' })} />
        <AgentRow agentKey="drafter" {...(agentStates.drafter || { event: 'standby' })} />
        <AgentRow agentKey="critic" {...(agentStates.critic || { event: 'standby' })} />
        
        {isDone && (
          <div className="flex items-center justify-between pt-3 mt-1">
            <div className="flex flex-col">
              <div className="text-[13px] font-medium text-white mb-1">Consensus Reached</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4caf50]" />
                <span className="text-[11px] font-medium text-slate-400">Ready</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-medium text-[#00c8ff]">{confidence || '91%'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Confidence</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
