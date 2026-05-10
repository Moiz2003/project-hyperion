import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import HUDIcons from './HUDIcons'

export default function UploadZone({
  file, previewUrl, isDragging, isLoading, error, fileSizeError, engineMode,
  onFileSelect, onDragOver, onDragLeave, onDrop, onClear, onAnalyze, onLoadDemo,
}) {
  const fileInputRef = useRef(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [invert, setInvert] = useState(false)

  const resetFilters = () => {
    setBrightness(100)
    setContrast(100)
    setInvert(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <HUDIcons.Laptop />
          <h2 className="text-sm font-inter font-semibold tracking-widest uppercase text-slate-300">Input Source</h2>
        </div>
        {previewUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-white hover:text-slate-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <div
        className={`relative flex flex-col items-center justify-center w-full aspect-[4/3] min-h-[450px] max-h-[800px] border rounded-lg transition-all duration-500 overflow-hidden backdrop-blur-xl shadow-2xl
          ${isDragging ? 'bg-[#0f2341]/40 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'bg-[#0f2341]/20 border-cyan-500/10 hover:bg-[#0f2341]/40 hover:border-cyan-500/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'}
          ${previewUrl ? 'p-2 bg-black' : 'p-8'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!previewUrl && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent opacity-50" />
        )}

        {previewUrl ? (
          <div className="relative w-full h-full group bg-black rounded overflow-hidden flex flex-col">
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
              <img
                src={previewUrl}
                alt="Scan Preview"
                className="max-w-full max-h-full object-contain transition-all duration-300"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : ''}`,
                }}
              />

              {isLoading && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
                  className="absolute left-0 w-full h-1 bg-cyan-400 z-10"
                />
              )}
            </div>

            {/* Imaging Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="flex flex-col gap-1 min-w-[80px]">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Brightness</span>
                <input
                  type="range" min="50" max="200" value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[80px]">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Contrast</span>
                <input
                  type="range" min="50" max="200" value={contrast}
                  onChange={(e) => setContrast(e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
              <button
                onClick={() => setInvert(!invert)}
                className={`p-2 rounded-lg border transition-all ${invert ? 'bg-cyan-400 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                title="Invert Colors"
              >
                <HUDIcons.Activity className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-800 mx-1" />
              <button
                onClick={onClear}
                className="p-2 rounded-lg bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-500 hover:text-white transition-all"
                title="Clear Scan"
              >
                <HUDIcons.Close className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center relative z-10">
            <div className="w-24 h-24 mb-8 mx-auto rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 transition-all duration-300 shadow-xl">
              <HUDIcons.Upload />
            </div>
            <h3 className="text-2xl font-inter font-semibold text-white mb-3">Initialize Scan Data</h3>
            <p className="text-slate-500 mb-8 font-light text-sm">Drag & drop raw geometries (.png, .jpg)</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 rounded-lg border border-slate-700 bg-slate-900/40 text-white font-inter font-bold text-xs tracking-widest uppercase hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
              >
                Browse System
              </button>
              {onLoadDemo && (
                <button
                  onClick={onLoadDemo}
                  className="px-5 py-3 rounded-lg border border-slate-800 text-slate-500 font-inter font-bold text-xs tracking-widest uppercase hover:text-slate-300 transition-all active:scale-95 cursor-pointer"
                >
                  Load Demo
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => onFileSelect(e.target.files?.[0])}
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
        onClick={onAnalyze}
        disabled={!file || isLoading || fileSizeError}
        className={`relative w-full py-4 rounded-lg font-inter font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-4 transition-all duration-500 overflow-hidden cursor-pointer
          ${!file || isLoading || fileSizeError
            ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-90'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <HUDIcons.Brain />
            <span className="relative z-10">Start Scanning</span>
          </>
        )}
      </button>
    </div>
  )
}
