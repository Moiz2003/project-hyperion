import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HyperionLogo } from '../Logo'
import ScanHistorySidebar from '../ScanHistorySidebar'
import { generateClinicalPDF } from '../pdfReport'
import HUDIcons from '../components/Dashboard/HUDIcons'
import UploadZone from '../components/Dashboard/UploadZone'
import ResultsPanel from '../components/Dashboard/ResultsPanel'
import SwarmVisualizer from '../components/Dashboard/SwarmVisualizer'
import SwarmStatus from '../components/Dashboard/SwarmStatus'
import BatchPanel from '../components/Dashboard/BatchPanel'
import ErrorBoundary from '../components/ErrorBoundary'
import { DEMO_SCAN } from '../data/demoScan'
import { API_BASE, MAX_SSE_BUFFER_BYTES } from '../utils/constants'

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const abortRef = useRef(null)

  const [engineMode, setEngineMode] = useState('clinical')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [fileSizeError, setFileSizeError] = useState(false)

  // SSE event log for the swarm visualizer
  const [swarmEvents, setSwarmEvents] = useState([])
  const [streamLatency, setStreamLatency] = useState(null)
  const [streamMode, setStreamMode] = useState('demo')

  // Education mode state
  const [isRevealed, setIsRevealed] = useState(false)
  const [residentInput, setResidentInput] = useState('')
  const [hint, setHint] = useState(null)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [diagnosisMatch, setDiagnosisMatch] = useState(null)
  const [socraticHintCache, setSocraticHintCache] = useState(null)   // extracted from SSE pipeline_complete
  const [imageHashCache, setImageHashCache] = useState(null)          // extracted from SSE pipeline_complete
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealError, setRevealError] = useState(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (.jpg, .png)')
      setFileSizeError(false)
      return
    }
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setResults(null)
    setIsRevealed(false)
    setResidentInput('')
    setHint(null)
    setDiagnosisMatch(null)
    setSwarmEvents([])
    setStreamLatency(null)
    setRevealError(null)
    setIsRevealing(false)
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('Large file (>15 MB) — the network may drop this payload. Compress or resize before uploading.')
      setFileSizeError(true)
    } else {
      setError(null)
      setFileSizeError(false)
    }
  }

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const clearSelection = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setFile(null)
    setPreviewUrl(null)
    setResults(null)
    setError(null)
    setFileSizeError(false)
    setIsRevealed(false)
    setResidentInput('')
    setHint(null)
    setDiagnosisMatch(null)
    setSwarmEvents([])
    setStreamLatency(null)
    setRevealError(null)
    setIsRevealing(false)
  }

  const handleSelectScan = useCallback((scan) => {
    setResults({
      raw_findings: scan.rawFindings,
      initial_draft: scan.initialDraft || scan.verifiedReport,
      verified_report: scan.verifiedReport,
      critic_interventions: scan.criticInterventions || 0,
      urgency_flag: scan.urgencyFlag,
      recommended_dept: scan.recommendedDept,
      processing_latency: scan.processingLatency,
      _imageBase64: scan.imageBase64,
      _imageHash: scan.imageHash,
      partial: false,
    })
    setSwarmEvents([])
    setSidebarOpen(false)
    setError(null)
    setFileSizeError(false)
    setIsRevealed(false)
    setDiagnosisMatch(null)
  }, [])

  const handleDownloadPDF = useCallback(() => {
    if (!results) return
    generateClinicalPDF({
      rawFindings: results.raw_findings,
      verifiedReport: results.verified_report,
      urgencyFlag: results.urgency_flag,
      recommendedDept: results.recommended_dept,
      processingLatency: results.processing_latency,
      criticInterventions: results.critic_interventions,
      imageBase64: results._imageBase64,
    })
  }, [results])

  const handleLoadDemo = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setFile(DEMO_SCAN.file)
    setPreviewUrl(DEMO_SCAN.previewUrl)
    setResults(null)
    setSwarmEvents([])
    setStreamLatency(null)
    setStreamMode(DEMO_SCAN.streamMode)
    setError(null)
    setFileSizeError(false)
    setIsRevealed(false)
    setHint(null)
    setDiagnosisMatch(null)
    setIsLoading(true)

    let eventIndex = 0;
    const events = DEMO_SCAN.events;
    const controller = new AbortController();
    abortRef.current = controller;

    const simulateStream = () => {
      if (controller.signal.aborted) return;
      if (eventIndex < events.length) {
        const ev = events[eventIndex];
        setSwarmEvents(prev => [...prev, ev]);

        if (ev.type === 'pipeline_complete') {
          setResults(DEMO_SCAN.result);
          setStreamLatency(DEMO_SCAN.result.processing_latency);
          setIsLoading(false);
          return;
        }

        eventIndex++;
        setTimeout(simulateStream, 800);
      }
    };

    setTimeout(simulateStream, 500);
  }, [])

  // Auto-play demo if requested via URL
  useEffect(() => {
    if (location.search.includes('autoplay=true')) {
      handleLoadDemo()
    }
  }, [location.search, handleLoadDemo])

  const analyzeScan = useCallback(async () => {
    if (!file) return

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)
    setResults(null)
    setFileSizeError(false)
    setIsRevealed(false)
    setHint(null)
    setDiagnosisMatch(null)
    setSocraticHintCache(null)
    setImageHashCache(null)
    setSwarmEvents([])
    setStreamLatency(null)

    const isDemoMode = engineMode === 'demo'
    const isEduMode = engineMode === 'edu'
    setStreamMode(isDemoMode ? 'demo' : 'production')

    const formData = new FormData()
    formData.append('xray_image', file)

    try {
      const modeParam = isEduMode ? '&mode=edu' : ''
      const response = await fetch(
        `${API_BASE}/api/analyze-scan/stream?demo=${isDemoMode}${modeParam}`,
        { method: 'POST', body: formData, signal: controller.signal }
      )

      if (!response.ok) {
        let msg = `Server returned ${response.status} ${response.statusText}`
        try { const d = await response.json(); if (d.message) msg = d.message } catch (_) { }
        throw new Error(msg)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let bufferBytes = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        bufferBytes += chunk.length

        if (bufferBytes > MAX_SSE_BUFFER_BYTES) {
          const frames = buffer.split('\n\n')
          buffer = frames.pop() || ''
          bufferBytes = buffer.length

          for (const frame of frames) {
            const eventLine = frame.match(/^event: (.+)$/m)
            const dataLine = frame.match(/^data: (.+)$/m)
            if (!eventLine || !dataLine) continue

            const eventType = eventLine[1].trim()
            let payload
            try { payload = JSON.parse(dataLine[1]) } catch (_) { continue }

            setSwarmEvents(prev => [...prev, { type: eventType, ...payload }])

            if (eventType === 'pipeline_complete') {
              const resultData = { ...payload.data, processing_latency: payload.processing_latency }
              setResults(resultData)
              setStreamLatency(payload.processing_latency)
              // Extract edu-mode fields from SSE payload for zero-latency hint access
              if (payload.data?.socratic_hint) {
                setSocraticHintCache(payload.data.socratic_hint)
              }
              if (payload.data?.image_hash) {
                setImageHashCache(payload.data.image_hash)
              }
              if (resultData.partial) {
                setError('One or more agents returned a degraded response. Partial analysis shown.')
              }
              if (typeof window.__hyperionSaveScan === 'function') {
                window.__hyperionSaveScan(resultData)
              }
            }

            if (eventType === 'pipeline_error') {
              setError(payload.error || 'Pipeline failed. Please retry.')
            }
          }
          continue
        }

        const frames = buffer.split('\n\n')
        buffer = frames.pop()
        bufferBytes = buffer.length

        for (const frame of frames) {
          const eventLine = frame.match(/^event: (.+)$/m)
          const dataLine = frame.match(/^data: (.+)$/m)
          if (!eventLine || !dataLine) continue

          const eventType = eventLine[1].trim()
          let payload
          try { payload = JSON.parse(dataLine[1]) } catch (_) { continue }

          setSwarmEvents(prev => [...prev, { type: eventType, ...payload }])

          if (eventType === 'pipeline_complete') {
            const resultData = { ...payload.data, processing_latency: payload.processing_latency }
            setResults(resultData)
            setStreamLatency(payload.processing_latency)
            // Extract edu-mode fields from SSE payload for zero-latency hint access
            if (payload.data?.socratic_hint) {
              setSocraticHintCache(payload.data.socratic_hint)
            }
            if (payload.data?.image_hash) {
              setImageHashCache(payload.data.image_hash)
            }
            if (resultData.partial) {
              setError('One or more agents returned a degraded response. Partial analysis shown.')
            }
            if (typeof window.__hyperionSaveScan === 'function') {
              window.__hyperionSaveScan(resultData)
            }
          }

          if (eventType === 'pipeline_error') {
            setError(payload.error || 'Pipeline failed. Please retry.')
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Failed to connect to AI swarm endpoint.')
    } finally {
      setIsLoading(false)
      if (abortRef.current === controller) abortRef.current = null
    }
  }, [file, engineMode])

  // Abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
    }
  }, [])

  // ─── Education Mode: Request Hint (zero-latency, from SSE cache) ───
  const requestHint = useCallback(() => {
    setIsHintLoading(true)
    // Small delay so the UI shows "Computing..." briefly for UX
    setTimeout(() => {
      if (socraticHintCache && typeof socraticHintCache === 'object') {
        // socraticHintCache is an object: { hintQuestion, clinicalContext, focusAnatomy, difficulty, keyFinding }
        setHint(socraticHintCache.hintQuestion || 'Critic Node Nudge: Focus your attention on structural asymmetries in the medial zones.')
      } else if (typeof socraticHintCache === 'string') {
        setHint(socraticHintCache)
      } else {
        setHint('Critic Node Nudge: Focus your attention on structural asymmetries in the medial zones.')
      }
      setIsHintLoading(false)
    }, 600)
  }, [socraticHintCache])

  // ─── Education Mode: Reveal Analysis from API ───
  const handleReveal = useCallback(async () => {
    const hash = results?._imageHash || imageHashCache
    if (!residentInput.trim()) return
    if (!file && !hash) {
      setRevealError('No image available — please re-upload the scan in Education mode.')
      return
    }
    setIsRevealing(true)
    setRevealError(null)
    // Reset the swarm visualizer so it shows live reveal-pipeline activity
    // (vision/drafter/critic events) instead of stale events from the
    // initial edu pass.
    setSwarmEvents([])

    // 5 min ceiling — sized for cold Render dyno + slow vLLM agents.
    // Heartbeat events from the SSE stream keep the connection alive so the
    // browser shouldn't actually hit this; it's a safety net for catastrophic
    // backend stalls.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300_000)

    try {
      // Prefer multipart with the original file so the backend doesn't depend
      // on its in-memory edu cache (survives Render dyno restarts and
      // cross-instance cache misses). Fall back to JSON+image_hash if the file
      // is gone (e.g. scan loaded from history).
      let resp
      if (file) {
        const fd = new FormData()
        fd.append('xray_image', file)
        fd.append('resident_assessment', residentInput)
        if (hash) fd.append('image_hash', hash)
        resp = await fetch(`${API_BASE}/api/analyze-scan/reveal/stream`, {
          method: 'POST',
          body: fd,
          signal: controller.signal,
        })
      } else {
        resp = await fetch(`${API_BASE}/api/analyze-scan/reveal/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_hash: hash,
            resident_assessment: residentInput,
          }),
          signal: controller.signal,
        })
      }

      if (!resp.ok) {
        let msg = `Reveal failed (HTTP ${resp.status})`
        try { const d = await resp.json(); if (d?.message) msg = d.message } catch (_) { /* non-JSON */ }
        setRevealError(msg)
        return
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let completed = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const frames = buffer.split('\n\n')
        buffer = frames.pop() || ''

        for (const frame of frames) {
          const eventLine = frame.match(/^event: (.+)$/m)
          const dataLine = frame.match(/^data: (.+)$/m)
          if (!eventLine || !dataLine) continue

          const eventType = eventLine[1].trim()
          let payload
          try { payload = JSON.parse(dataLine[1]) } catch (_) { continue }

          // Mirror the analyze-stream behavior: feed the visualizer.
          setSwarmEvents(prev => [...prev, { type: eventType, ...payload }])

          if (eventType === 'pipeline_complete' && payload.data) {
            setResults(prev => ({
              ...prev,
              verified_report: payload.data.verified_report,
              initial_draft: payload.data.initial_draft || prev?.initial_draft,
              urgency_flag: payload.data.urgency_flag,
              recommended_dept: payload.data.recommended_dept,
              critic_interventions: payload.data.critic_interventions,
              diagnosis_match: payload.data.diagnosis_match,
            }))
            setDiagnosisMatch(payload.data.diagnosis_match)
            setIsRevealed(true)
            completed = true
          }

          if (eventType === 'pipeline_error') {
            setRevealError(payload.error || 'Reveal failed.')
          }
        }
      }

      if (!completed && !revealError) {
        setRevealError('Stream ended before reveal completed. Please retry.')
      }
    } catch (err) {
      console.error('Reveal failed:', err)
      if (err.name === 'AbortError') {
        setRevealError('Verification timed out after 5 minutes. The AI swarm is overloaded — please try again in a moment.')
      } else {
        setRevealError(err.message || 'Network error during reveal.')
      }
    } finally {
      clearTimeout(timeoutId)
      setIsRevealing(false)
    }
  }, [results, residentInput, imageHashCache, file, revealError])

  // Keyboard shortcuts (defined after handleReveal so it can be referenced)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        // In edu mode after analysis, Ctrl+Enter reveals instead of re-analyzing
        if (engineMode === 'edu' && results && !isRevealed && residentInput.trim() && !isRevealing) {
          handleReveal()
          return
        }
        if (file && !isLoading && !fileSizeError && engineMode !== 'batch') analyzeScan()
      }
      if (e.key === 'Escape' && (file || results)) clearSelection()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [file, isLoading, results, engineMode, fileSizeError, analyzeScan, isRevealed, residentInput, isRevealing, handleReveal])

  // Derive a loading text from the latest swarm event
  const loadingText = (() => {
    if (!isLoading || swarmEvents.length === 0) return 'Initializing AI swarm...'
    const last = swarmEvents[swarmEvents.length - 1]
    if (last.type === 'agent_start') return `${last.label}: ${last.detail || 'running...'}`
    if (last.type === 'agent_retry') return `Drafter retrying with simplified prompt...`
    if (last.type === 'critic_rejected') return `Critic rejected draft — revising (${last.interventions} interventions)...`
    if (last.type === 'critic_accepted') return 'Consensus accepted — finalizing report...'
    return 'Processing...'
  })()

  const showVisualizer = isLoading || swarmEvents.length > 0

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-200 font-inter p-6 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-blue-500/20 gap-4">
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <HyperionLogo horizontal={true} className="h-16 w-auto" />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            <SwarmStatus />

            <button
              onClick={() => navigate('/analytics')}
              className="text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-cyan-400 transition-colors bg-[#000]/30 border border-slate-800 px-4 py-2 rounded-md hover:border-cyan-400/50"
            >
              Analytics
            </button>

            {/* Engine Mode Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-[#000]/50 border border-slate-800 rounded-md">
              <button
                onClick={() => setEngineMode('clinical')}
                title="Full adversarial consensus loop — up to 3 agent iterations"
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'clinical'
                  ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30 shadow-[0_0_15px_rgba(0,217,255,0.1)]'
                  : 'text-slate-500 hover:text-white border border-transparent'
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${engineMode === 'clinical' ? 'bg-[#00D9FF] shadow-[0_0_8px_rgba(0,217,255,1)]' : 'bg-slate-700'}`} />
                Deep Clinical
              </button>
              <button
                onClick={() => setEngineMode('demo')}
                title="Single-pass analysis — fast for stage demonstrations"
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'demo'
                  ? 'bg-indigo-900/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-white border border-transparent'
                  }`}
              >
                <HUDIcons.GraduationCap /> Fast Demo
              </button>
              <button
                onClick={() => setEngineMode('edu')}
                title="Socratic learning mode — hint-based discovery for residents"
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'edu'
                  ? 'bg-indigo-900/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'text-slate-500 hover:text-white border border-transparent'
                  }`}
              >
                <HUDIcons.GraduationCap /> Education
              </button>
              <button
                onClick={() => setEngineMode('batch')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'batch'
                  ? 'bg-violet-900/20 text-violet-400 border border-violet-500/30'
                  : 'text-slate-500 hover:text-white border border-transparent'
                  }`}
              >
                <HUDIcons.Activity /> Batch
              </button>
            </div>
          </div>
        </header>

        <ScanHistorySidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
          onSelectScan={handleSelectScan}
        />

        {engineMode === 'batch' && (
          <div className="rounded-3xl border border-cyan-500/20 bg-[#0f2341]/20 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <h2 className="text-sm font-bold tracking-widest uppercase text-slate-300">Batch Analysis — Parallel Swarm</h2>
            </div>
            <BatchPanel />
          </div>
        )}

        {engineMode !== 'batch' && (
          <ErrorBoundary fallback={
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-950 border border-red-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Dashboard Error</h2>
              <p className="text-slate-400 text-sm">A critical component crashed. Please reload the page.</p>
            </div>
          }>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full h-fit">
              <div className="flex flex-col gap-6">
                <UploadZone
                  file={file}
                  previewUrl={previewUrl}
                  isDragging={isDragging}
                  isLoading={isLoading}
                  error={error}
                  fileSizeError={fileSizeError}
                  engineMode={engineMode}
                  onFileSelect={handleFileSelect}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClear={clearSelection}
                  onAnalyze={analyzeScan}
                  onLoadDemo={handleLoadDemo}
                />

                {showVisualizer && (
                  <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl">
                    <ErrorBoundary fallback={
                      <div className="py-6 text-center text-red-400/60 text-xs font-mono tracking-widest uppercase">
                        Swarm visualizer unavailable
                      </div>
                    }>
                      <SwarmVisualizer
                        events={swarmEvents}
                        latency={streamLatency}
                        mode={streamMode}
                      />
                    </ErrorBoundary>
                  </div>
                )}
              </div>

              <ResultsPanel
                results={results}
                isLoading={isLoading}
                loadingText={loadingText}
                isRevealed={isRevealed}
                engineMode={engineMode}
                residentInput={residentInput}
                onResidentInput={setResidentInput}
                hint={hint}
                isHintLoading={isHintLoading}
                onRequestHint={requestHint}
                onReveal={handleReveal}
                onDownloadPDF={handleDownloadPDF}
                diagnosisMatch={diagnosisMatch}
                isRevealing={isRevealing}
                revealError={revealError}
              />
            </div>
          </ErrorBoundary>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
