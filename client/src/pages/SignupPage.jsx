import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../Header'
import { Footer } from '../Footer'

export default function SignupPage({ onNavigate }) {
  const navigate = useNavigate()
  const siteNavigate = useMemo(() => onNavigate || ((view) => navigate(view === 'landing' ? '/' : '/')), [onNavigate, navigate])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    setIsSubmitting(true)
    try {
      // Placeholder flow until backend auth is wired.
      await new Promise(r => setTimeout(r, 700))
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Sign up failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-50 font-inter overflow-x-hidden selection:bg-cyan-500/30 relative">
      <Header onNavigate={siteNavigate} />

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center">
              <div className="inline-block px-4 py-2 bg-cyan-400/10 border border-cyan-400/30 rounded-full text-xs tracking-widest uppercase text-cyan-400 font-semibold">
                New Account
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
                Sign Up
              </h1>
              <p className="mt-4 text-slate-300 font-medium">
                Create your Hyperion workspace.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl border border-cyan-400/20 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl">
                {error && (
                  <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      autoComplete="name"
                      placeholder="Dr. Jane Doe"
                      className="mt-2 w-full rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="you@hospital.org"
                      className="mt-2 w-full rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Password</span>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>

                  <button
                    disabled={isSubmitting}
                    className="w-full mt-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-sm font-semibold shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:shadow-[0_0_55px_rgba(34,211,238,0.45)] transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    type="submit"
                  >
                    {isSubmitting ? 'Creating…' : 'Create account'}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-slate-500">
                  <button
                    className="hover:text-cyan-400 transition-colors cursor-pointer"
                    type="button"
                    onClick={() => navigate('/login')}
                  >
                    Already have an account
                  </button>
                  <button
                    className="hover:text-cyan-400 transition-colors cursor-pointer"
                    type="button"
                    onClick={() => siteNavigate('landing')}
                  >
                    Back to site
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onNavigate={siteNavigate} />
    </div>
  )
}

