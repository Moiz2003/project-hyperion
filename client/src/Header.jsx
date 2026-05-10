import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HyperionLogo } from './Logo'
import { useScrollTransform } from './hooks/useScrollProgress'

export const Header = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  // Map view names to paths for aria-current detection
  const viewPaths = {
    product: '/product',
    solutions: '/solutions',
    pricing: '/pricing',
    documentation: '/docs/documentation',
    contact: '/contact',
  }

  // Scroll-aware glass effect
  const headerBg = useScrollTransform(
    [0, 0.05],
    ['rgba(2,6,23,0)', 'rgba(2,6,23,0.95)']
  )
  const headerBorder = useScrollTransform(
    [0, 0.05],
    ['rgba(59,130,246,0)', 'rgba(59,130,246,0.2)']
  )
  const headerBlur = useScrollTransform(
    [0, 0.05],
    ['blur(0px)', 'blur(20px)']
  )

  const navLinks = [
    { label: 'Product', view: 'product' },
    { label: 'Solutions', view: 'solutions' },
    { label: 'Pricing', view: 'pricing' },
    { label: 'Docs', view: 'documentation' },
    { label: 'Contact', view: 'contact' },
  ]

  return (
    <motion.header
      style={{
        backgroundColor: headerBg,
        borderColor: headerBorder,
        backdropFilter: headerBlur,
      }}
      className="sticky top-0 z-50 border-b border-blue-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <HyperionLogo horizontal className="h-10 md:h-12 w-auto" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isCurrent = currentPath === viewPaths[link.view]
              return (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`relative px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-200 group cursor-pointer ${isCurrent ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'
                    }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-px bg-cyan-400 transition-transform duration-300 origin-left ${isCurrent ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                  />
                </button>
              )
            })}

            <div className="ml-4 flex items-center gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="px-5 py-2 text-xs font-bold tracking-widest uppercase text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:border-cyan-400/50 transition-all duration-200 cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-5 py-2 text-xs font-bold tracking-widest uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all duration-200 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-blue-500/20 bg-slate-950/95 backdrop-blur-2xl"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => {
                const isCurrent = currentPath === viewPaths[link.view]
                return (
                  <button
                    key={link.view}
                    onClick={() => { onNavigate(link.view); setMobileOpen(false) }}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`block w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase rounded-lg transition-all ${isCurrent
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
                      }`}
                  >
                    {link.label}
                  </button>
                )
              })}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => { onNavigate('login'); setMobileOpen(false) }}
                  className="block w-full text-center px-5 py-3 text-xs font-bold tracking-widest uppercase text-slate-300 border border-slate-700 rounded-lg hover:border-cyan-400/50 transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={() => { onNavigate('signup'); setMobileOpen(false) }}
                  className="block w-full text-center px-5 py-3 text-xs font-bold tracking-widest uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg transition-all"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
