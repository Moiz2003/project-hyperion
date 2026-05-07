import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HyperionLogo } from '../Logo'
import ScanHistorySidebar from '../ScanHistorySidebar'
import { generateClinicalPDF } from '../pdfReport'
import HUDIcons from '../components/Dashboard/HUDIcons'
import UploadZone from '../components/Dashboard/UploadZone'
import ResultsPanel from '../components/Dashboard/ResultsPanel'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const LOADING_STAGES = [
  'Intake Agent scanning image geometry...',
  'Diagnostic Agent drafting preliminary findings...',
  'Critic Node verifying against knowledge base...',
  'Synthesizing final diagnostic report...',
]

export default function Dashboard() {
  const navigate = useNavigate()

  const [engineMode, setEngineMode] = useState('clinical')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState(LOADING_STAGES[0])
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const [isRevealed, setIsRevealed] = useState(false)
  const [residentInput, setResidentInput] = useState('')
  const [hint, setHint] = useState(null)
  const [isHintLoading, setIsHintLoading] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading) return
    let idx = 0
    setLoadingText(LOADING_STAGES[0])
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_STAGES.length
      setLoadingText(LOADING_STAGES[idx])
    }, 1500)
    return () => clearInterval(interval)
  }, [isLoading])

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (.jpg, .png)')
      return
    }
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setResults(null)
    setError(null)
    setIsRevealed(false)
    setResidentInput('')
    setHint(null)
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
    setFile(null)
    setPreviewUrl(null)
    setResults(null)
    setError(null)
    setIsRevealed(false)
    setResidentInput('')
    setHint(null)
  }

  const handleSelectScan = useCallback((scan) => {
    setResults({
      raw_findings: scan.rawFindings,
      verified_report: scan.verifiedReport,
      critic_interventions: scan.criticInterventions || 1,
      urgency_flag: scan.urgencyFlag,
      recommended_dept: scan.recommendedDept,
      processing_latency: scan.processingLatency,
      _imageBase64: scan.imageBase64,
    })
    setSidebarOpen(false)
    setError(null)
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

  const analyzeScan = async () => {
    if (!file) return
    setIsLoading(true)
    setError(null)
    setResults(null)
    setIsRevealed(false)
    setHint(null)

    const formData = new FormData()
    formData.append('xray_image', file)

    try {
      const response = await fetch(`${API_BASE}/api/analyze-scan`, { method: 'POST', body: formData })

      if (!response.ok) {
        let msg = `Server returned ${response.status} ${response.statusText}`
        try { const d = await response.json(); if (d.message) msg = d.message } catch (_) {}
        throw new Error(msg)
      }

      const data = await response.json()
      if (data.status === 'success') {
        const resultData = { ...data.data, processing_latency: data.processing_latency }
        setResults(resultData)
        if (window.__hyperionSaveScan) window.__hyperionSaveScan(resultData)
      } else {
        throw new Error(data.message || 'Error processing scan')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to AI swarm endpoint.')
    } finally {
      setIsLoading(false)
    }
  }

  const requestHint = () => {
    setIsHintLoading(true)
    setTimeout(() => {
      setHint('Critic Node Nudge: Focus your attention on structural asymmetries in the medial zones.')
      setIsHintLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-inter p-6 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-800/60 gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <HyperionLogo horizontal={true} className="h-16 w-auto" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-[#000] border border-slate-800 rounded-full w-full md:w-auto">
            <button
              onClick={() => setEngineMode('clinical')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'clinical' ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-500 hover:text-white border border-transparent'}`}
            >
              <HUDIcons.Brain /> Clinical
            </button>
            <button
              onClick={() => setEngineMode('discovery')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${engineMode === 'discovery' ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-slate-500 hover:text-white border border-transparent'}`}
            >
              <HUDIcons.GraduationCap /> Edu: Discovery
            </button>
          </div>
        </header>

        <ScanHistorySidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
          onSelectScan={handleSelectScan}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[75vh]">
          <UploadZone
            file={file}
            previewUrl={previewUrl}
            isDragging={isDragging}
            isLoading={isLoading}
            error={error}
            engineMode={engineMode}
            onFileSelect={handleFileSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClear={clearSelection}
            onAnalyze={analyzeScan}
          />

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
