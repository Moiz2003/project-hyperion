import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { HyperionLogo } from './Logo';

export const Header = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
      <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')}>
        <HyperionLogo horizontal={true} className="h-20 w-auto" />
      </div>
      
      {/* Desktop Nav Links */}
      <div className="hidden lg:flex items-center gap-10">
        <button
          onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
          className="text-sm font-bold tracking-widest text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
        >
          Product
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
          className="text-sm font-bold tracking-widest text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
        >
          Solutions
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onNavigate('pricing'); }}
          className="text-sm font-bold tracking-widest text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
        >
          Pricing
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onNavigate('documentation'); }}
          className="text-sm font-bold tracking-widest text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
        >
          Docs
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer border border-white/20 text-white text-sm font-semibold tracking-widest uppercase transition-all backdrop-blur-md active:scale-95 text-center hover:scale-105 ml-4"
        >
          Book Demo
        </button>
      </div>

      {/* Mobile Burger Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors z-50 cursor-pointer"
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
            className="absolute top-full left-0 w-full bg-[#020617]/95 backdrop-blur-2xl border-b border-slate-800 overflow-hidden lg:hidden flex flex-col items-center gap-6 py-12 px-6 z-40"
          >
            <button
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); setIsMenuOpen(false); }}
              className="text-lg font-bold tracking-[0.2em] text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); setIsMenuOpen(false); }}
              className="text-lg font-bold tracking-[0.2em] text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
            >
              Solutions
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onNavigate('pricing'); setIsMenuOpen(false); }}
              className="text-lg font-bold tracking-[0.2em] text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onNavigate('documentation'); setIsMenuOpen(false); }}
              className="text-lg font-bold tracking-[0.2em] text-slate-400 hover:text-cyan-400 uppercase transition-colors cursor-pointer"
            >
              Docs
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onNavigate('contact'); setIsMenuOpen(false); }}
              className="w-full px-8 py-4 rounded-full bg-cyan-400 text-black text-sm font-bold tracking-[0.2em] uppercase transition-all active:scale-95 text-center shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            >
              Book Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
