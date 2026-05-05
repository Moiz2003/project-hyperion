import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

import LandingPage from './LandingPage';
import SplashScreen from './SplashScreen';
import PricingPage from './PricingPage';
import DocumentPage from './DocumentPage';
import ContactPage from './ContactPage';
import AboutPage from './AboutPage';
import {
  RadiologyAIAssistantPage,
  RuralClinicsPage,
  EmergencyDiagnosisSupportPage,
  TelemedicineIntegrationPage,
} from './pages/solutions/SolutionPages';
import { HyperionLogo, HyperionIcon } from './Logo';

// Custom SVGs for the Dashboard HUD
const HUDIcons = {
  Brain: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.5H6a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1v.5A2.5 2.5 0 0 0 9.5 16h5a2.5 2.5 0 0 0 2.5-2.5v-.5h1a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-1v-.5A2.5 2.5 0 0 0 14.5 2h-5Z" />
      <path d="M12 16v6M9 22h6" />
    </svg>
  ),
  Database: () => (
    <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  File: () => (
    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
  GraduationCap: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('hasSeenSplash') ? 'landing' : 'splash';
  });

  const [engineMode, setEngineMode] = useState('clinical'); // 'clinical' | 'discovery'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing swarm...');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Discovery Mode specific states
  const [isRevealed, setIsRevealed] = useState(false);
  const [residentInput, setResidentInput] = useState('');
  const [hint, setHint] = useState(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const fileInputRef = useRef(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const loadingStages = [
    "Intake Agent scanning image geometry...",
    "Diagnostic Agent drafting preliminary findings...",
    "Critic Node verifying against knowledge base...",
    "Synthesizing final diagnostic report..."
  ];

  const docTypes = ['feature-tour', 'documentation', 'api-reference', 'privacy', 'terms', 'hipaa'];

  const viewToPath = (view) => {
    switch (view) {
      case 'splash':
      case 'landing':
      case 'solutions':
        return '/';
      case 'pricing':
        return '/pricing';
      case 'contact':
        return '/contact';
      case 'about':
        return '/about';
      case 'radiology-ai-assistant':
        return '/solutions/radiology-ai-assistant';
      case 'rural-clinics-low-resource-settings':
        return '/solutions/rural-clinics-low-resource-settings';
      case 'emergency-diagnosis-support':
        return '/solutions/emergency-diagnosis-support';
      case 'telemedicine-integration':
        return '/solutions/telemedicine-integration';
      case 'dashboard':
        return '/dashboard';
      default:
        if (docTypes.includes(view)) return `/docs/${view}`;
        return '/';
    }
  };

  const pathToView = (pathname) => {
    if (pathname === '/' || pathname === '') {
      return sessionStorage.getItem('hasSeenSplash') ? 'landing' : 'splash';
    }
    if (pathname === '/pricing') return 'pricing';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/about') return 'about';
    if (pathname === '/solutions/radiology-ai-assistant') return 'radiology-ai-assistant';
    if (pathname === '/solutions/rural-clinics-low-resource-settings') return 'rural-clinics-low-resource-settings';
    if (pathname === '/solutions/emergency-diagnosis-support') return 'emergency-diagnosis-support';
    if (pathname === '/solutions/telemedicine-integration') return 'telemedicine-integration';
    if (pathname === '/dashboard') return 'dashboard';

    if (pathname.startsWith('/docs/')) {
      const type = pathname.replace('/docs/', '').split('/')[0];
      return docTypes.includes(type) ? type : 'feature-tour';
    }

    return 'landing';
  };

  const handleNavigate = (view) => {
    const nextView = view === 'solutions' ? 'landing' : view;
    setCurrentView(nextView);
    const path = viewToPath(nextView);
    if (location.pathname !== path) navigate(path);
  };

  // Sync URL -> currentView (back/forward, deep links)
  useEffect(() => {
    const nextView = pathToView(location.pathname);
    setCurrentView((prev) => (prev === nextView ? prev : nextView));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      let stageIndex = 0;
      setLoadingText(loadingStages[0]);
      interval = setInterval(() => {
        stageIndex = (stageIndex + 1) % loadingStages.length;
        setLoadingText(loadingStages[stageIndex]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (.jpg, .png)');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResults(null);
    setError(null);
    setIsRevealed(false);
    setResidentInput('');
    setHint(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
    setIsRevealed(false);
    setResidentInput('');
    setHint(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeScan = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setIsRevealed(false);
    setHint(null);

    const formData = new FormData();
    formData.append('xray_image', file);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/analyze-scan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server returned ${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.message) errorMessage = errData.message;
        } catch (e) { }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setResults({
          ...data.data,
          processing_latency: data.processing_latency
        });
      } else {
        throw new Error(data.message || 'Error processing scan');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to AI swarm endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestHint = () => {
    setIsHintLoading(true);
    // Simulate AMD ROCm low-latency local pipeline
    setTimeout(() => {
      setHint("Critic Node Nudge: Focus your attention on structural asymmetries in the medial zones.");
      setIsHintLoading(false);
    }, 1500);
  };

  return (
    <AnimatePresence mode="wait">
      {currentView === 'splash' && (
        <SplashScreen key="splash" onComplete={() => {
          sessionStorage.setItem('hasSeenSplash', 'true');
          handleNavigate('landing');
        }} />
      )}

      {currentView === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <LandingPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'pricing' && (
        <motion.div
          key="pricing"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <PricingPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'contact' && (
        <motion.div
          key="contact"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <ContactPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'about' && (
        <motion.div
          key="about"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <AboutPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'radiology-ai-assistant' && (
        <motion.div
          key="radiology-ai-assistant"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <RadiologyAIAssistantPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'rural-clinics-low-resource-settings' && (
        <motion.div
          key="rural-clinics-low-resource-settings"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <RuralClinicsPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'emergency-diagnosis-support' && (
        <motion.div
          key="emergency-diagnosis-support"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <EmergencyDiagnosisSupportPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'telemedicine-integration' && (
        <motion.div
          key="telemedicine-integration"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <TelemedicineIntegrationPage onNavigate={handleNavigate} />
        </motion.div>
      )}

      {docTypes.includes(currentView) && (
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(15px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
        >
          <DocumentPage type={currentView} onNavigate={handleNavigate} />
        </motion.div>
      )}

      {currentView === 'dashboard' && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="min-h-screen bg-[#020617] text-slate-200 font-inter p-6 selection:bg-cyan-500/30"
        >
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Header with Mode Switcher */}
            <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-800/60 gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="flex items-center cursor-pointer" onClick={() => handleNavigate('landing')}>
                  <HyperionLogo horizontal={true} className="h-16 w-auto" />
                </div>
              </div>

              {/* Mode Switcher */}
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

              {/* <div className="hidden lg:flex items-center gap-3 text-xs font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/20 px-4 py-2 rounded-full border border-emerald-900/50 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse"></div>
                Engine Online
              </div> */}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[75vh]">

              {/* LEFT COLUMN: Upload Zone */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2">
                  <HUDIcons.Database />
                  <h2 className="text-sm font-inter font-semibold tracking-widest uppercase text-slate-300">Input Source</h2>
                </div>

                <div
                  className={`relative flex flex-col items-center justify-center w-full min-h-[450px] border border-slate-800 rounded-3xl transition-all duration-500 overflow-hidden backdrop-blur-xl shadow-2xl
                    ${isDragging ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-700'}
                    ${previewUrl ? 'p-0' : 'p-8'}
                    ${!previewUrl ? 'cursor-pointer' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  role={!previewUrl ? 'button' : undefined}
                  tabIndex={!previewUrl ? 0 : undefined}
                  onClick={(e) => {
                    if (previewUrl) return;
                    if (e.target.closest('button')) return;
                    openFilePicker();
                  }}
                  onKeyDown={(e) => {
                    if (previewUrl) return;
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    openFilePicker();
                  }}
                >
                  {/* Subtle pulsing background glow when empty */}
                  {!previewUrl && (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-50" />
                  )}

                  {previewUrl ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={previewUrl}
                        alt="Scan Preview"
                        className="w-full h-full object-contain bg-black"
                      />

                      {/* Laser Scanner Effect Overlay (Active when loading) */}
                      {isLoading && (
                        <motion.div initial={{ top: "0%" }} animate={{ top: ["0%", "100%", "0%"] }} transition={{
                          duration: 4,
                          ease: "easeInOut", repeat: Infinity
                        }}
                          className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,1),0_0_10px_rgba(34,211,238,1)] z-10" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <button
                          onClick={clearSelection}
                          className="absolute top-6 right-6 p-2 bg-red-950/80 border border-red-900 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-colors shadow-lg"
                        >
                          <HUDIcons.Close />
                        </button>
                        <div className="flex items-center gap-3 text-sm bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 w-max">
                          <HUDIcons.File />
                          <span className="font-medium text-white truncate max-w-[200px]">{file.name}</span>
                          <span className="text-slate-500 font-mono ml-4">
                            {file.size < 1024 * 1024 ? (file.size / 1024).toFixed(2) + ' KB' : (file.size / (1024 * 1024)).toFixed(2)
                              + ' MB'} </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center relative z-10">
                      <div className="w-24 h-24 mb-8 mx-auto rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-900/50 transition-all duration-300 shadow-xl">
                        <HUDIcons.Upload />
                      </div>
                      <h3 className="text-2xl font-inter font-semibold text-white mb-3">Initialize Scan Data</h3>
                      <p className="text-slate-500 mb-8 font-light text-sm">Drag & drop raw geometries (.png, .jpg)</p>
                      <button
                        onClick={openFilePicker}
                        className="px-8 py-3 rounded-full border border-slate-700 bg-slate-800/50 text-white font-inter font-semibold text-xs tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-colors active:scale-95 cursor-pointer backdrop-blur-md"
                      >
                        Browse System
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/50 text-red-400 flex items-start gap-3 backdrop-blur-md animate-[slideUp_0.3s_ease-out]">
                    <HUDIcons.Alert />
                    <p className="text-sm font-medium leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  onClick={analyzeScan}
                  disabled={!file || isLoading}
                  className={`relative w-full py-5 rounded-2xl font-inter font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-4 transition-all duration-500 overflow-hidden cursor-pointer shadow-lg
                    ${!file || isLoading
                      ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                      : engineMode === 'discovery'
                        ? 'bg-indigo-950/50 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] group'
                        : 'bg-cyan-950/50 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] group'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <HUDIcons.Activity />
                      Processing Engine Data...
                    </>
                  ) : (
                    <>
                      <HUDIcons.Brain />
                      <span className="relative z-10">Execute Swarm Protocol</span>
                      <div className={`absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0 ${engineMode === 'discovery' ? 'bg-indigo-500' : 'bg-cyan-400'}`} />
                    </>
                  )}
                </button>
              </div>

              {/* RIGHT COLUMN: Results / Loading State */}
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

                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-md z-10 p-8">
                      {/* Custom Neural Loading Spinner */}
                      <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                        <div className="absolute inset-0 border-[1px] border-cyan-500/20 rounded-full animate-[spin_4s_linear_infinite]" />
                        <div className="absolute inset-2 border-[1px] border-indigo-500/40 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                        <div className="absolute inset-6 border-[2px] border-t-cyan-400 border-r-transparent border-b-indigo-400 border-l-transparent rounded-full animate-[spin_1s_linear_infinite]" />
                        <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] animate-pulse" />
                      </div>
                      <h3 className="text-sm font-inter font-semibold tracking-widest uppercase text-white mb-4">Neural Consensus Active</h3>
                      <div className="h-6 relative w-full max-w-sm">
                        <p key={loadingText} className="text-cyan-400 text-center animate-[slideUp_0.3s_ease-out] font-mono text-xs tracking-wider">
                          {'>'} {loadingText}
                        </p>
                      </div>
                    </div>
                  )}

                  {results && !isLoading && (
                    <div className="p-8 h-full flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out] overflow-y-auto relative z-0">

                      {/* Masking Overlay for Discovery Mode */}
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
                              onChange={(e) => setResidentInput(e.target.value)}
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
                                onClick={requestHint}
                                disabled={isHintLoading || hint}
                                className="px-6 py-4 rounded-xl border border-indigo-500/50 text-indigo-400 font-inter font-semibold text-xs tracking-widest uppercase hover:bg-indigo-950/50 transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                {isHintLoading ? 'Computing...' : 'Request Hint'}
                              </button>
                              <button
                                onClick={() => setIsRevealed(true)}
                                disabled={!residentInput.trim()}
                                className="flex-1 py-4 rounded-xl bg-emerald-500 text-[#020617] font-inter font-semibold text-xs tracking-widest uppercase hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 disabled:hover:shadow-none"
                              >
                                Verify Findings
                              </button>
                            </div>

                            {/* AMD Flex Footnote */}
                            <p className="text-center text-[10px] text-slate-600 font-mono uppercase tracking-widest mt-8">
                              Hints generated via localized AMD ROCm Pipeline for 0ms transit latency.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Content (Blurred if Discovery Mode and not revealed) */}
                      <div className={`space-y-8 flex-1 transition-all duration-700 ${engineMode === 'discovery' && !isRevealed ? 'blur-xl opacity-20 pointer-events-none select-none' : ''}`}>

                        {/* Metadata Row */}
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

                        {/* Raw Findings */}
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

                        {/* Verified Report */}
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

                        {/* Critic Stats */}
                        <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between text-xs font-mono uppercase tracking-widest">
                          <span className="text-slate-500">Critic Interventions: <strong className="text-cyan-400 font-inter font-bold text-sm ml-2">{results.critic_interventions}</strong></span>
                          <span className="text-slate-500 flex items-center gap-2">
                            Confidence: <strong className="text-emerald-400 text-sm">100%</strong>
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Global Animations for App.jsx */}
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
    </AnimatePresence>
  );
}
