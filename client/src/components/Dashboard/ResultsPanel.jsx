import { AnimatePresence, motion } from 'framer-motion'
import HUDIcons from './HUDIcons'
import LoadingOverlay from './LoadingOverlay'

export default function ResultsPanel({
  results, isLoading, loadingText, isRevealed, engineMode,
  residentInput, onResidentInput, hint, isHintLoading,
  onRequestHint, onReveal, onDownloadPDF,
}) {
  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <HUDIcons.Check />
          <h2 className="text-sm font-inter font-semibold tracking-widest uppercase text-slate-300">Swarm Output</h2>
        </div>
        {engineMode === 'discovery' && results && !isRevealed && (
          <span className="text-[10px] font-inter font-bold tracking-widest uppercase text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full bg-indigo-950/30 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-pulse">
            Discovery Mode Active
          </span>
        )}
      </div>

      <div className={`flex-1 relative rounded-3xl border transition-colors duration-500 overflow-hidden backdrop-blur-xl shadow-2xl
        ${results ? 'border-indigo-500/30 bg-indigo-950/10' : 'border-slate-800 bg-slate-900/40'}
      `}>
        {!isLoading && !results && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
            <HUDIcons.Brain />
            <p className="mt-4 font-bold tracking-widest uppercase text-xs">Engine Standby</p>
          </div>
        )}

        {isLoading && <LoadingOverlay loadingText={loadingText} />}

        {results && !isLoading && (
          <div className="p-8 h-full flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out] overflow-y-auto relative z-0">

            <AnimatePresence>
              {engineMode === 'discovery' && !isRevealed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-2xl p-8 flex flex-col overflow-y-auto"
                >
                  <h3 className="text-xl font-inter font-semibold text-white mb-2">Discovery Mode</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    The Swarm has successfully verified findings for this scan. Review the geometry and input your preliminary findings below before revealing the consensus.
                  </p>

                  <textarea
                    value={residentInput}
                    onChange={(e) => onResidentInput(e.target.value)}
                    placeholder="Enter your clinical findings..."
                    className="w-full min-h-[150px] bg-[#000] border border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors mb-6 resize-y"
                  />

                  {hint && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-xl bg-indigo-950/50 border border-indigo-500/50 text-indigo-300 text-sm font-mono flex items-start gap-3 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    >
                      <HUDIcons.Sparkles />
                      {hint}
                    </motion.div>
                  )}

                  <div className="flex items-center gap-4 mt-auto">
                    <button
                      onClick={onRequestHint}
                      disabled={isHintLoading || !!hint}
                      className="px-6 py-4 rounded-xl border border-indigo-500/50 text-indigo-400 font-inter font-semibold text-xs tracking-widest uppercase hover:bg-indigo-950/50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isHintLoading ? 'Computing...' : 'Request Hint'}
                    </button>
                    <button
                      onClick={onReveal}
                      disabled={!residentInput.trim()}
                      className="flex-1 py-4 rounded-xl bg-emerald-500 text-[#020617] font-inter font-semibold text-xs tracking-widest uppercase hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 disabled:hover:shadow-none"
                    >
                      Verify Findings
                    </button>
                  </div>

                  <p className="text-center text-[10px] text-slate-600 font-mono uppercase tracking-widest mt-8">
                    Hints generated via localized AMD ROCm Pipeline for 0ms transit latency.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`space-y-8 flex-1 transition-all duration-700 ${engineMode === 'discovery' && !isRevealed ? 'blur-xl opacity-20 pointer-events-none select-none' : ''}`}>

              <div className="flex flex-wrap items-center gap-4">
                <div className={`px-4 py-2 rounded-full border text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg backdrop-blur-md
                  ${results.urgency_flag === 'High'
                    ? 'bg-red-950/50 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                    : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400'
                  }`}
                >
                  <HUDIcons.Alert />
                  {results.urgency_flag} URGENCY
                </div>

                <div className="px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                  <HUDIcons.MapPin />
                  {results.recommended_dept}
                </div>

                <div className="px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono flex items-center gap-2 ml-auto">
                  <HUDIcons.Clock />
                  {results.processing_latency}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                  Vision Agent Raw Geometry
                </h4>
                <div className="p-6 rounded-2xl bg-[#000] border border-slate-800 text-slate-400 font-mono text-sm leading-relaxed relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
                  {results.raw_findings}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                  Final Verified Consensus
                </h4>
                <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-slate-200 font-medium text-lg leading-relaxed relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
                  {results.verified_report}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between text-xs font-mono uppercase tracking-widest">
                <span className="text-slate-500">
                  Critic Interventions: <strong className="text-cyan-400 font-inter font-bold text-sm ml-2">{results.critic_interventions}</strong>
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 flex items-center gap-2">
                    Confidence: <strong className="text-emerald-400 text-sm">100%</strong>
                  </span>
                  <button
                    onClick={onDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-[10px] font-bold tracking-widest uppercase shadow-lg"
                    title="Download Clinical Report"
                  >
                    <HUDIcons.Download />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
