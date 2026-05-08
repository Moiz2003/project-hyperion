import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Max accumulated SSE buffer before forced flush (prevents OOM on long streams)
const MAX_SSE_BUFFER_BYTES = 1_048_576 // 1 MB

export default function Dashboard() {
  const navigate = useNavigate()
  const abortRef = useRef(null) // AbortController ref for cleanup

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

  const [isRevealed, setIsRevealed] = useState(false)
  const [residentInput, setResidentInput] = useState('')
  const [hint, setHint] = useState(null)
  const [isHintLoading, setIsHintLoading] = useState(false)

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
    setSwarmEvents([])
    setStreamLatency(null)
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
    // Abort any in-flight SSE stream
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
    setSwarmEvents([])
    setStreamLatency(null)
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
      partial: false,
    })
    setSwarmEvents([])
    setSidebarOpen(false)
    setError(null)
    setFileSizeError(false)
    setIsRevealed(false)
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
    // Abort any in-flight SSE stream
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setFile(DEMO_SCAN.file)
    setPreviewUrl(DEMO_SCAN.previewUrl)
    setResults(DEMO_SCAN.result)
    setSwarmEvents(DEMO_SCAN.events)
    setStreamLatency(DEMO_SCAN.result.processing_latency)
    setStreamMode(DEMO_SCAN.streamMode)
    setError(null)
    setFileSizeError(false)
    setIsRevealed(false)
    setHint(null)
    setIsLoading(false)
  }, [])

  const analyzeScan = useCallback(async () => {
    if (!file) return

    // Abort any previous in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)
    setResults(null)
    setFileSizeError(false)
    setIsRevealed(false)
    setHint(null)
    setSwarmEvents([])
    setStreamLatency(null)

    const isDemoMode = engineMode === 'demo'
    setStreamMode(isDemoMode ? 'demo' : 'production')

    const formData = new FormData()
    formData.append('xray_image', file)

    try {
      const response = await fetch(
        `${API_BASE}/api/analyze-scan/stream?demo=${isDemoMode}`,
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

        // Guard against unbounded buffer growth (CVE-style memory exhaustion)
        if (bufferBytes > MAX_SSE_BUFFER_BYTES) {
          // Force-flush: process what we have, then discard oldest half
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

        // Parse SSE frames
        const frames = buffer.split('\n\n')
        buffer = frames.pop() // keep incomplete last frame
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
      // Ignore aborted requests (user navigated away or cleared)
      if (err.name === 'AbortError') return
      setError(err.message || 'Failed to connect to AI swarm endpoint.')
    } finally {
      setIsLoading(false)
      if (abortRef.current === controller) abortRef.current = null
    }
  }, [file, engineMode])

  // Keyboard shortcuts: Ctrl+Enter → analyze, Escape → clear
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (file && !isLoading && !fileSizeError && engineMode !== 'batch') analyzeScan()
      }
      if (e.key === 'Escape' && (file || results)) clearSelection()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [file, isLoading, results, engineMode, fileSizeError, analyzeScan])

  // Abort any in-flight SSE stream on real unmount only.
  // (Was previously bundled with the keyboard-shortcut effect, whose
  // cleanup re-ran on every isLoading flip — aborting the fetch ~28ms
  // after it started, before the server could respond.)
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
    }
  }, [])

  const requestHint = () => {
    setIsHintLoading(true)
    setTimeout(() => {
      setHint('Critic Node Nudge: Focus your attention on structural asymmetries in the medial zones.')
      setIsHintLoading(false)
    }, 1500)
  }

  // Derive a loading text from the latest swarm event
  const loadingText = (() => {
    if (!isLoading || swarmEvents.length === 0) return 'Initializing AI swarm...'
    const last = swarmEvents[swarmEvents.length - 1]
    if (last.type === 'agent_start') return last.detail || `${last.label} running...`
    if (last.type === 'agent_retry') return `Drafter retrying with simplified prompt...`
    if (last.type === 'critic_rejected') return `Critic rejected draft — revising (${last.interventions} interventions)...`
    if (last.type === 'critic_accepted') return 'Consensus accepted — finalizing report...'
    return 'Processing...'
  })()

  const showVisualizer = isLoading || swarmEvents.length > 0

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-inter p-6 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-800/60 gap-4">
          {/* Left: logo */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <HyperionLogo horizontal={true} className="h-16 w-auto" />
          </div>

          {/* Right: status + nav + mode selector */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            <SwarmStatus />

            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-bold tracking-widest uppercase text-slate-500 hover:text-cyan-400 transition-colors border border-slate-800 px-4 py-2 rounded-full hover:border-cyan-500/40"
            >
              Analytics
            </button>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#000] border border-slate-800 rounded-full">
              <button
                onClick={() => setEngineMode('clinical')}
                title="Full adversarial consensus loop — up to 3 agent iterations"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'clinical' ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-500 hover:text-white border border-transparent'}`}
              >
                <HUDIcons.Brain /> Deep Clinical
              </button>
              <button
                onClick={() => setEngineMode('demo')}
                title="Single-pass analysis — fast for stage demonstrations"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'demo' ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-slate-500 hover:text-white border border-transparent'}`}
              >
                <HUDIcons.GraduationCap /> Fast Demo
              </button>
              <button
                onClick={() => setEngineMode('batch')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'batch' ? 'bg-violet-950/50 text-violet-400 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'text-slate-500 hover:text-white border border-transparent'}`}
              >
                ⚡ Batch
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
          <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[75vh]">
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
                onReveal={() => setIsRevealed(true)}
                onDownloadPDF={handleDownloadPDF}
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
