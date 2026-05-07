export default function LoadingOverlay({ loadingText }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-md z-10 p-8">
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
  )
}
