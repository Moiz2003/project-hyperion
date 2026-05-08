import { useRef } from 'react'
import { motion } from 'framer-motion'
import HUDIcons from './HUDIcons'

export default function UploadZone({
  file, previewUrl, isDragging, isLoading, error, engineMode,
  onFileSelect, onDragOver, onDragLeave, onDrop, onClear, onAnalyze, onLoadDemo,
}) {
  const fileInputRef = useRef(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <HUDIcons.Database />
        <h2 className="text-sm font-inter font-semibold tracking-widest uppercase text-slate-300">Input Source</h2>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[450px] border border-slate-800 rounded-3xl transition-all duration-500 overflow-hidden backdrop-blur-xl shadow-2xl
          ${isDragging ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-700'}
          ${previewUrl ? 'p-0' : 'p-8'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!previewUrl && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-50" />
        )}

        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img src={previewUrl} alt="Scan Preview" className="w-full h-full object-contain bg-black" />

            {isLoading && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
                className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,1),0_0_10px_rgba(34,211,238,1)] z-10"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <button
                onClick={onClear}
                className="absolute top-6 right-6 p-2 bg-red-950/80 border border-red-900 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-colors shadow-lg"
              >
                <HUDIcons.Close />
              </button>
              <div className="flex items-center gap-3 text-sm bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 w-max">
                <HUDIcons.File />
                <span className="font-medium text-white truncate max-w-[200px]">{file.name}</span>
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
                className="px-8 py-3 rounded-full border border-slate-700 bg-slate-800/50 text-white font-inter font-semibold text-xs tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-colors active:scale-95 cursor-pointer backdrop-blur-md"
              >
                Browse System
              </button>
              {onLoadDemo && (
                <button
                  onClick={onLoadDemo}
                  className="px-5 py-3 rounded-full border border-cyan-900/50 text-cyan-700 font-inter font-semibold text-xs tracking-widest uppercase hover:border-cyan-500/50 hover:text-cyan-400 transition-colors active:scale-95 cursor-pointer"
                >
                  Load Demo Scan
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
  )
}
