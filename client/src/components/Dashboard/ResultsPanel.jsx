import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HUDIcons from './HUDIcons'
import LoadingOverlay from './LoadingOverlay'
import { confidenceScore, confidenceTooltip } from '../../utils/formatters'

export default function ResultsPanel({
  results, isLoading, loadingText, isRevealed, engineMode,
  residentInput, onResidentInput, hint, isHintLoading,
  onRequestHint, onReveal, onDownloadPDF, diagnosisMatch,
  isRevealing, revealError,
}) {
  const [showComparison, setShowComparison] = useState(false)

  const hasDiff = results && results.initial_draft &&
    results.initial_draft !== results.verified_report

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <HUDIcons.Clipboard />
          <h2 className="text-sm font-inter font-semibold tracking-widest uppercase text-slate-300">Verified Report</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasDiff && !isLoading && (
            <button
              onClick={() => setShowComparison(v => !v)}
              className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg border transition-all ${showComparison
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
            >
              {showComparison ? 'Hide Diff' : 'Before / After'}
            </button>
          )}
          {engineMode === 'edu' && results && !isRevealed && (
            <span className="text-[10px] font-inter font-bold tracking-widest uppercase text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full bg-indigo-950/30 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-pulse">
              Discovery Mode Active
            </span>
          )}
        </div>
      </div>

      <div className={`flex-1 relative rounded-lg border transition-colors duration-500 overflow-hidden backdrop-blur-xl shadow-2xl
        ${results ? 'border-cyan-500/20 bg-[#0f2341]/40' : 'border-slate-800 bg-[#000]/20'}
      `}>
        {!isLoading && !results && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
            <HUDIcons.Brain />
            <p className="mt-4 font-bold tracking-widest uppercase text-xs">Engine Standby</p>
          </div>
        )}

        {isLoading && (
          <>
            <LoadingOverlay loadingText={loadingText} />
            <div className="absolute inset-0 p-8 flex flex-col gap-8 opacity-20 pointer-events-none z-0">
              <div className="flex gap-4">
                <div className="h-8 w-32 bg-slate-700 rounded-full animate-pulse" />
                <div className="h-8 w-40 bg-slate-700 rounded-full animate-pulse" />
                <div className="h-8 w-24 bg-slate-700 rounded-full animate-pulse ml-auto" />
              </div>
              <div className="h-32 w-full bg-slate-700 rounded-xl animate-pulse" />
              <div className="flex-1 w-full bg-slate-700 rounded-lg animate-pulse" />
            </div>
          </>
        )}

        {results && !isLoading && (
          <div className="p-8 h-full flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out] overflow-y-auto relative z-0">

            {/* ─── Education Mode: Discovery Overlay ─── */}
            <AnimatePresence>
              {engineMode === 'edu' && !isRevealed && (
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
                    className="w-full min-h-[150px] bg-[#000] border border-slate-700 rounded-xl p-4 text-slate-300 font-inter text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors mb-6 resize-y"
                  />

                  {hint && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-400/30 text-cyan-300 text-sm font-inter flex items-start gap-3 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                    >
                      <HUDIcons.Sparkles />
                      {hint}
                    </motion.div>
                  )}

                  {revealError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-sm font-inter">
                      {revealError}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-auto">
                    <button
                      onClick={onRequestHint}
                      disabled={isHintLoading || !!hint || isRevealing}
                      className="px-6 py-4 rounded-lg border border-slate-700 bg-slate-900/40 text-slate-300 font-inter font-bold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {isHintLoading ? 'Computing...' : 'Request Hint'}
                    </button>
                    <button
                      onClick={onReveal}
                      disabled={!residentInput.trim() || isRevealing}
                      className="flex-1 py-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-[#0a1628] font-inter font-bold text-[10px] tracking-widest uppercase hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)] transition-all disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    >
                      {isRevealing && (
                        <span className="inline-block w-3 h-3 border-2 border-[#0a1628]/40 border-t-[#0a1628] rounded-full animate-spin" />
                      )}
                      {isRevealing ? 'Verifying — Running Full Swarm…' : 'Verify Findings'}
                    </button>
                  </div>

                  <p className="text-center text-[10px] text-slate-600 font-inter uppercase tracking-widest mt-8">
                    Hints generated via localized AMD ROCm Pipeline for 0ms transit latency.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`space-y-8 flex-1 transition-all duration-700 ${engineMode === 'edu' && !isRevealed ? 'blur-xl opacity-20 pointer-events-none select-none' : ''}`}>

              {/* Top Status Badges */}
              <div className="flex flex-wrap items-center gap-4">
                <div className={`px-4 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg backdrop-blur-md
                  ${results.urgency_flag === 'High'
                    ? 'bg-red-950/20 border-red-500/30 text-red-400 py-2 px-6'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {/* <HUDIcons.Alert /> */}
                  {results.urgency_flag || 'Low'} Urgency
                </div>

                <div className="px-4 py-2 rounded-full bg-[#000]/40 border border-slate-800 text-slate-300 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                  <HUDIcons.MapPin />
                  {results.recommended_dept || 'Internal Medicine'}
                </div>

                <div className="px-4 py-2 rounded-full bg-[#000]/40 border border-slate-800 text-slate-400 text-[10px] font-inter flex items-center gap-2 ml-auto">
                  <HUDIcons.Clock />
                  {results.processing_latency || '0.0s'}
                </div>
              </div>

              {/* Vision Agent Raw Geometry */}
              <div className="space-y-4">
                <div className="p-6 rounded-lg border border-cyan-500/20 bg-[#0f2341]/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/30" />
                  <h3 className="text-sm font-bold text-white mb-4">Vision Agent Raw Geometry</h3>
                  <p className="font-light text-sm text-slate-400">{results.raw_findings}</p>
                </div>
              </div>

              {/* Final Verified Consensus */}
              <div className="space-y-4">
                <div className="p-6 rounded-lg border border-cyan-500/20 bg-[#0f2341]/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]">
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-white mb-4">Summary</h3>
                    {(() => {
                      const text = results.verified_report || "";
                      let summary = "";
                      let recommendations = [];

                      const sections = {};
                      const regex = /\((\d)\)\s*([\s\S]*?)(?=\(\d\)\s|$)/g;

                      let match;
                      while ((match = regex.exec(text)) !== null) {
                        sections[match[1]] = match[2].trim();
                      }

                      const summaryParts = [];

                      if (sections["1"]) {
                        const clean1 = sections["1"]
                          .replace(/^(Summary of Findings|Summary)\s*[:\-]?\s*/i, "")
                          .replace(/\s+/g, " ")
                          .trim();
                        summaryParts.push(clean1);
                      }

                      if (sections["2"]) {
                        const clean2 = sections["2"]
                          .replace(/^(Differential Diagnosis|Differential)\s*[:\-]?\s*/i, "")
                          .replace(/\d+\.\s*/g, "")
                          .replace(/\s+—\s+/g, " — ")
                          .replace(/\n/g, " ")
                          .replace(/\s+/g, " ")
                          .trim();
                        summaryParts.push(clean2);
                      }

                      if (summaryParts.length > 0) {
                        summary = summaryParts.join(" ");
                      } else {
                        const splitText = text.split(/(?:Recommendations|Workup|Action[s]?|Plan)\s*:/i);
                        if (splitText.length > 1) {
                          summary = splitText[0].replace(/\*\*Summary.*?\*\*/i, "").trim();
                          sections["3"] = splitText[1];
                        } else {
                          summary = text.trim();
                        }
                      }

                      const recText = [sections["3"], sections["4"]]
                        .filter(Boolean)
                        .join("\n");

                      if (recText) {
                        recommendations = recText
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(
                            (line) =>
                              line.startsWith("-") ||
                              line.startsWith("*") ||
                              /^\d+\./.test(line)
                          )
                          .map((line) =>
                            line
                              .replace(/^[-*]\s*/, "")
                              .replace(/^\d+\.\s*/, "")
                              .trim()
                          );
                      }

                      return (
                        <>
                          <p className="text-slate-300 text-sm leading-relaxed font-light mb-6">
                            {summary}
                          </p>

                          {recommendations.length > 0 && (
                            <>
                              <div className="h-px w-full bg-slate-800/50 mb-6" />
                              <h3 className="text-sm font-bold text-white mb-4">Recommendations</h3>
                              <div className="space-y-2">
                                {recommendations.map((item, i) => (
                                  <p key={i} className="text-slate-300 text-sm leading-relaxed">
                                    <span className="text-slate-400 mr-2">•</span>
                                    {item}
                                  </p>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-800/50">
                    <div className="px-4 py-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-medium">
                      Confidence: <span className="font-bold">{confidenceScore(results)}</span>
                    </div>
                    <div className="px-4 py-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-medium">
                      Interventions: <span className="font-bold">{results.critic_interventions}</span>
                    </div>
                    <div className="px-4 py-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-medium">
                      Risk Level: <span className="font-bold">{results.urgency_flag || 'Low'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Education Mode: Diagnosis Match Scorecard ─── */}
              {isRevealed && diagnosisMatch && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="p-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20"
                >
                  <h3 className="text-sm font-bold text-white mb-4">Diagnosis Match Score</h3>
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Score Gauge */}
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="eduGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="42"
                          fill="none" stroke="url(#eduGaugeGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                          animate={{
                            strokeDashoffset: 2 * Math.PI * 42 * (1 - (diagnosisMatch.score || 0) / 100),
                          }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-400 font-inter">
                          {diagnosisMatch.score || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400 font-inter shrink-0">Keywords Matched</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {Array.isArray(diagnosisMatch.matched) ? diagnosisMatch.matched.length : (diagnosisMatch.matched || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400 font-inter shrink-0">Keywords Missed</span>
                        <span className="text-sm font-bold text-red-400">
                          {Array.isArray(diagnosisMatch.missed) ? diagnosisMatch.missed.length : (diagnosisMatch.missed || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400 font-inter shrink-0">Extra Keywords</span>
                        <span className="text-sm font-bold text-amber-400">
                          {Array.isArray(diagnosisMatch.extra) ? diagnosisMatch.extra.length : (diagnosisMatch.extra || 0)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400 font-inter shrink-0">Total AI Keywords</span>
                        <span className="text-sm font-bold text-cyan-400">{diagnosisMatch.total_ai_keywords || 0}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400 font-inter shrink-0">Your Keywords</span>
                        <span className="text-sm font-bold text-cyan-400">{diagnosisMatch.total_resident_keywords || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Keyword chips — shown below counts so each list is readable */}
                  {(Array.isArray(diagnosisMatch.matched) && diagnosisMatch.matched.length > 0) ||
                    (Array.isArray(diagnosisMatch.missed) && diagnosisMatch.missed.length > 0) ||
                    (Array.isArray(diagnosisMatch.extra) && diagnosisMatch.extra.length > 0) ? (
                    <div className="mt-6 space-y-3">
                      {Array.isArray(diagnosisMatch.matched) && diagnosisMatch.matched.length > 0 && (
                        <div>
                          <div className="text-[10px] font-inter uppercase tracking-widest text-emerald-500/80 mb-2">Matched</div>
                          <div className="flex flex-wrap gap-1.5">
                            {diagnosisMatch.matched.map((k, i) => (
                              <span key={`m-${i}`} className="px-2.5 py-1 rounded-md bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-inter">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {Array.isArray(diagnosisMatch.missed) && diagnosisMatch.missed.length > 0 && (
                        <div>
                          <div className="text-[10px] font-inter uppercase tracking-widest text-red-500/80 mb-2">Missed by you</div>
                          <div className="flex flex-wrap gap-1.5">
                            {diagnosisMatch.missed.map((k, i) => (
                              <span key={`x-${i}`} className="px-2.5 py-1 rounded-md bg-red-950/30 border border-red-500/30 text-red-300 text-[11px] font-inter">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {Array.isArray(diagnosisMatch.extra) && diagnosisMatch.extra.length > 0 && (
                        <div>
                          <div className="text-[10px] font-inter uppercase tracking-widest text-amber-500/80 mb-2">Extra (not in AI report)</div>
                          <div className="flex flex-wrap gap-1.5">
                            {diagnosisMatch.extra.map((k, i) => (
                              <span key={`e-${i}`} className="px-2.5 py-1 rounded-md bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] font-inter">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </motion.div>
              )}

              {/* Before/After Comparison */}
              <AnimatePresence>
                {showComparison && hasDiff && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      Initial Draft (Pre-Critic)
                    </h4>
                    <div className="p-4 rounded-md bg-amber-950/10 border border-amber-500/20 text-slate-400 font-medium text-sm leading-relaxed relative overflow-hidden">
                      <div className="text-[9px] font-inter text-amber-600 uppercase tracking-widest mb-2">Before Critic Review</div>
                      {results.initial_draft}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => { }}
                  className="flex-1 py-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-[#0a1628] font-bold text-[10px] tracking-widest uppercase hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)] transition-all"
                >
                  Save Analysis
                </button>
                <button
                  onClick={onDownloadPDF}
                  className="flex-1 py-4 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-300 font-bold text-[10px] tracking-widest uppercase hover:bg-slate-800 transition-all"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
