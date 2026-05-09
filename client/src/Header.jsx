import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { HyperionLogo } from './Logo';

export const Header = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full border-b border-blue-500/20 bg-slate-950/80 backdrop-blur-md relative z-50">
      <nav className="w-full max-w-7xl mx-auto px-6 py-4 lg:py-5 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')}>
          <HyperionLogo horizontal={true} className="h-10 md:h-12 lg:h-16 w-auto" />
        </div>
        
        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('product'); }}
            className="text-sm font-semibold tracking-widest text-slate-100 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
          >
            Product
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('solutions'); }}
            className="text-sm font-semibold tracking-widest text-slate-100 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
          >
            Solutions
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('pricing'); }}
            className="text-sm font-semibold tracking-widest text-slate-100 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('documentation'); }}
            className="text-sm font-semibold tracking-widest text-slate-100 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
          >
            Docs
          </button>
        </div>

        {/* Desktop Auth/CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
            className="px-6 py-2.5 rounded-xl border border-cyan-400 bg-transparent text-cyan-400 text-sm font-semibold transition-colors hover:bg-cyan-400/10 cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('signup'); }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-sm font-semibold shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:shadow-[0_0_55px_rgba(34,211,238,0.50)] transition-all cursor-pointer active:scale-95"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Burger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-slate-200 hover:text-white transition-colors z-50 cursor-pointer"
        >
          {isMenuOpen ? (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-blue-500/20 overflow-hidden lg:hidden z-40"
            >
              <div className="flex flex-col items-center gap-6 py-10 px-6">
                <button
                  onClick={(e) => { e.preventDefault(); onNavigate('product'); setIsMenuOpen(false); }}
                  className="text-lg font-bold tracking-[0.2em] text-slate-200 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
                >
                  Product
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); onNavigate('solutions'); setIsMenuOpen(false); }}
                  className="text-lg font-bold tracking-[0.2em] text-slate-200 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
                >
                  Solutions
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); onNavigate('pricing'); setIsMenuOpen(false); }}
                  className="text-lg font-bold tracking-[0.2em] text-slate-200 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
                >
                  Pricing
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); onNavigate('documentation'); setIsMenuOpen(false); }}
                  className="text-lg font-bold tracking-[0.2em] text-slate-200 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
                >
                  Docs
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); onNavigate('login'); setIsMenuOpen(false); }}
                  className="w-full max-w-[300px] px-8 py-4 rounded-full border border-cyan-400 bg-transparent text-cyan-400 text-sm font-bold tracking-[0.2em] uppercase transition-all active:scale-95 text-center hover:bg-cyan-400/10"
                >
                  Log In
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); onNavigate('signup'); setIsMenuOpen(false); }}
                  className="w-full max-w-[300px] px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-sm font-bold tracking-[0.2em] uppercase transition-all active:scale-95 text-center shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)]"
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};
