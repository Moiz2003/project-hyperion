import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProcessingOverlay from './ProcessingOverlay'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MAX_FILES = 5
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff'])

function UrgencyBadge({ flag }) {
  const styles = {
    High: 'bg-red-950/50 border-red-500/60 text-red-400',
    Moderate: 'bg-amber-950/50 border-amber-500/40 text-amber-400',
    Low: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400',
  }
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles[flag] || styles.Moderate}`}>
      {flag}
    </span>
  )
}

function ResultCard({ item, index }) {
  const [open, setOpen] = useState(false)
  const ok = item.status === 'success' || item.status === 'partial'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border p-4 flex flex-col gap-3 ${item.status === 'error' ? 'border-red-500/30 bg-red-950/10'
          : item.status === 'partial' ? 'border-amber-500/30 bg-amber-950/10'
            : 'border-slate-800 bg-slate-900/40'
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-inter text-slate-500">Image {item.index + 1}</span>
        {ok && <UrgencyBadge flag={item.data.urgency_flag} />}
        {item.status === 'error' && <span className="text-[9px] text-red-400 font-inter">Failed</span>}
      </div>

      {ok && (
        <>
          <div className="text-xs text-slate-400 font-inter">{item.data.recommended_dept}</div>
          <div className="text-xs text-slate-500 font-inter flex items-center justify-between">
            <span>{item.data.critic_interventions} intervention{item.data.critic_interventions !== 1 ? 's' : ''}</span>
            <span>{item.processing_latency}</span>
          </div>
          <button
            onClick={() => setOpen(v => !v)}
            className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase hover:text-cyan-300 transition-colors text-left"
          >
            {open ? 'Hide report ▲' : 'View report ▼'}
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="text-xs text-slate-400 font-inter leading-relaxed p-3 rounded-xl bg-slate-950 border border-slate-800 mt-1 whitespace-pre-wrap">
                  {item.data.verified_report}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {item.status === 'error' && (
        <div className="text-xs text-red-400 font-inter">{item.error}</div>
      )}
    </motion.div>
  )
}

export default function BatchPanel({ speedMode = 'fast' }) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const handleFiles = (selected) => {
    const valid = Array.from(selected)
      .filter(f => ALLOWED.has(f.type))
      .slice(0, MAX_FILES)
    setFiles(valid)
    setPreviews(valid.map(f => URL.createObjectURL(f)))
    setResults(null)
    setSummary(null)
    setError(null)
  }

  const removeFile = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const runBatch = async () => {
    if (files.length === 0) return
    setIsLoading(true)
    setError(null)
    setResults(null)
    setSummary(null)

    const formData = new FormData()
    files.forEach(f => formData.append('xray_images', f))

    try {
      // Pass the speed tier query param so the backend can budget the
      // batch run. Fast tier short-circuits each scan to vision-only;
      // Pro tier runs the full pipeline per scan with a 5min cap.
      const resp = await fetch(`${API_BASE}/api/analyze-scan/batch?speed=${speedMode}`, {
        method: 'POST',
        body: formData,
      })
      const data = await resp.json()
      if (data.status === 'success' || data.status === 'partial') {
        setResults(data.results)
        setSummary(data.summary)
      } else {
        // Never surface raw timeouts. Show whatever results we got.
        if (data.results) {
          setResults(data.results)
          setSummary(data.summary)
        } else {
          setError('Batch finished in degraded mode. Some scans may show fallback results.')
        }
      }
    } catch (err) {
      // Hard network failure only — backend should always respond now.
      setError('Network connection lost during batch. Please retry.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Upload zone */}
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-dashed border-slate-700 hover:border-cyan-400/50 bg-slate-900/20 hover:bg-cyan-950/10 transition-all cursor-pointer min-h-[160px]"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/tiff"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="text-4xl">🔬</div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-300">Drop up to {MAX_FILES} medical scans</p>
          <p className="text-xs text-slate-600 mt-1 font-inter">JPEG · PNG · WebP · TIFF — max {MAX_FILES} files, 20MB each</p>
        </div>
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {previews.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt={`scan-${i}`} className="w-full aspect-square object-cover rounded-xl border border-slate-800" />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-900/80 text-red-400 text-[10px] font-bold hidden group-hover:flex items-center justify-center border border-red-500/50 hover:bg-red-500 hover:text-white transition-all"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-inter">
          {error}
        </div>
      )}

      {/* Run button */}
      {files.length > 0 && !isLoading && !results && (
        <button
          onClick={runBatch}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-lg hover:shadow-cyan-400/50 text-slate-950 font-inter font-bold text-xs tracking-widest uppercase transition-all"
        >
          Analyze {files.length} Scan{files.length !== 1 ? 's' : ''} — Parallel Swarm
        </button>
      )}

      <ProcessingOverlay
        isVisible={isLoading}
        pipeline="batch"
        mode={speedMode === 'fast' ? 'demo' : 'pro'}
        batchCount={files.length}
      />

      {/* Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: 'Analyzed', value: summary.total, color: 'text-cyan-400' },
            { label: 'Success', value: summary.success, color: 'text-emerald-400' },
            { label: 'High Urgency', value: summary.urgency_distribution.High, color: 'text-red-400' },
            { label: 'Partial', value: summary.partial, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
              <div className={`text-2xl font-bold font-inter ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-inter text-slate-600 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Results grid */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, i) => (
            <ResultCard key={i} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
