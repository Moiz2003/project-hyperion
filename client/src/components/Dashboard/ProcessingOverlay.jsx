import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = {
  clinical: [
    'Ingesting imaging data...',
    'Extracting radiological features...',
    'Formulating preliminary findings...',
    'Performing adversarial verification...',
    'Finalizing medical-grade report...',
  ],
  edu: [
    'Analyzing pathology...',
    'Identifying anatomical markers...',
    'Formulating Socratic questions...',
    'Structuring learning objectives...',
    'Finalizing educational reveal...',
  ],
  batch: [
    'Initializing batch queue...',
    'Distributing scans to Vision Swarm...',
    'Aggregating features...',
    'Performing severity scoring...',
    'Compiling triage distribution...',
  ],
}

// Seconds
const TIME_BUDGETS = {
  clinical: { demo: 28, pro: 290 },
  edu: { demo: 15, pro: 150 },
  batch: { demo: 15, pro: 240 },
}

function formatETA(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function ProcessingOverlay({ isVisible, pipeline = 'clinical', mode = 'demo', batchCount = 1 }) {
  const perItemBudget = TIME_BUDGETS[pipeline]?.[mode] ?? 28
  const budget = perItemBudget * (pipeline === 'batch' ? Math.max(1, batchCount) : 1)
  const messages = MESSAGES[pipeline] ?? MESSAGES.clinical

  const [elapsed, setElapsed] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (!isVisible) {
      setElapsed(0)
      setMsgIndex(0)
      startRef.current = null
      return
    }

    startRef.current = Date.now()

    const tickId = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000)
    }, 250)

    const msgId = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length)
    }, 12000)

    return () => {
      clearInterval(tickId)
      clearInterval(msgId)
    }
  }, [isVisible, messages.length])

  // Cap progress at 99% — let the real completion event close the overlay
  const progress = Math.min((elapsed / budget) * 100, 99)
  const eta = Math.max(0, budget - elapsed)

  const titleMap = {
    clinical: 'Neural Consensus Active',
    edu: 'Pathology Analysis Active',
    batch: 'Batch Swarm Active',
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm mx-4 rounded-3xl border border-slate-700/50 bg-slate-950/80 backdrop-blur-xl p-8 flex flex-col items-center gap-7 shadow-2xl shadow-black/60"
          >
            {/* Concentric spinner */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-2 border border-indigo-500/30 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
              <div className="absolute inset-5 border-2 border-t-cyan-400 border-r-transparent border-b-indigo-400 border-l-transparent rounded-full animate-[spin_1s_linear_infinite]" />
              <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_18px_rgba(0,217,255,0.95)] animate-pulse" />
            </div>

            {/* Title + rotating message */}
            <div className="text-center space-y-2 w-full">
              <p className="text-xs font-bold tracking-widest uppercase text-white">
                {titleMap[pipeline] ?? titleMap.clinical}
              </p>
              <div className="h-5 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-cyan-400 text-xs tracking-wider font-inter absolute inset-0 text-center"
                  >
                    {'>'} {messages[msgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Progress</span>
                <span className="text-[10px] font-bold text-slate-400 font-inter tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'linear' }}
                />
              </div>
            </div>

            {/* ETA + tier info */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xl font-bold font-inter text-white tabular-nums leading-none mb-1">
                  {formatETA(eta)}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-slate-600">Est. remaining</div>
              </div>

              <div className="w-px h-10 bg-slate-800" />

              <div className="text-center">
                <div className={`text-xs font-bold tracking-widest uppercase leading-none mb-1 ${mode === 'demo' ? 'text-emerald-400' : 'text-violet-400'}`}>
                  {mode === 'demo' ? 'Demo (Fast)' : 'Pro (Accurate)'}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
                  {pipeline === 'batch'
                    ? `${batchCount} scan${batchCount !== 1 ? 's' : ''}`
                    : pipeline}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
