import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8">
        <div className="max-w-lg w-full p-8 rounded-3xl border border-red-900/50 bg-red-950/20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-950 border border-red-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="text-xl font-inter font-semibold text-white mb-3">Swarm Engine Error</h2>
          <p className="text-slate-400 text-sm mb-2">An unexpected error occurred in the interface.</p>
          <p className="text-red-400 font-mono text-xs mb-8 break-all">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-8 py-3 rounded-full border border-slate-700 bg-slate-800/50 text-white font-inter font-semibold text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
          >
            Restart Interface
          </button>
        </div>
      </div>
    )
  }
}
