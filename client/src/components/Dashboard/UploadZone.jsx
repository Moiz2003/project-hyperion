import { useRef } from 'react'
import { motion } from 'framer-motion'
import HUDIcons from './HUDIcons'

export default function UploadZone({
  file, previewUrl, isDragging, isLoading, error, fileSizeError, engineMode,
  onFileSelect, onDragOver, onDragLeave, onDrop, onClear, onAnalyze, onLoadDemo,
}) {
  const fileInputRef = useRef(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <HUDIcons.Laptop />
        <h2 className="text-sm font-inter font-semibold tracking-widest uppercase text-slate-300">Input Source</h2>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center w-full aspect-[4/3] min-h-[450px] max-h-[800px] border rounded-lg transition-all duration-500 overflow-hidden backdrop-blur-xl shadow-2xl
          ${isDragging ? 'bg-[#0f2341]/40 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'bg-[#0f2341]/20 border-cyan-500/10 hover:bg-[#0f2341]/40 hover:border-cyan-500/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'}
          ${previewUrl ? 'p-2 bg-slate-950' : 'p-8'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!previewUrl && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent opacity-50" />
        )}

        {previewUrl ? (
          <div className="relative w-full h-full group bg-black rounded overflow-hidden">
            <img src={previewUrl} alt="Scan Preview" className="w-full h-full object-contain" />

            {isLoading && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
                className="absolute left-0 w-full h-1 bg-cyan-400  z-10"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <button
                onClick={onClear}
                className="absolute top-6 right-6 p-2 border-none rounded-full text-white-400 hover:text-white hover:bg-red-500 transition-colors shadow-lg"
              >
                <HUDIcons.Close />
              </button>
              <div className="flex items-center gap-3 text-sm bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 w-max">
                <HUDIcons.File />
                <div className="flex flex-col">
                  <span className="font-medium text-white truncate max-w-[200px]">
                    patient-scan-{btoa(file.name + file.size).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toLowerCase()}.jpeg
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Original: {file.name}</span>
                </div>
                <span className="text-slate-500 font-mono ml-4">
                  {file.size < 1024 * 1024
                    ? (file.size / 1024).toFixed(2) + ' KB'
                    : (file.size / (1024 * 1024)).toFixed(2) + ' MB'}
                </span>
              </div>
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
        className={`relative w-full py-4 rounded-lg font-inter font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-4 transition-all duration-500 overflow-hidden cursor-pointer shadow-lg
          ${!file || isLoading || fileSizeError
            ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-[#0a1628] hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)]'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
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
