import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HyperionLogo } from './Logo';

export const Header = ({ onNavigate }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  const solutionItems = [
    { label: 'Radiology AI Assistant', view: 'radiology-ai-assistant' },
    { label: 'Rural Clinics / Low-resource settings', view: 'rural-clinics-low-resource-settings' },
    { label: 'Emergency Diagnosis Support', view: 'emergency-diagnosis-support' },
    { label: 'Telemedicine Integration', view: 'telemedicine-integration' },
  ];

  const activeKey = (() => {
    if (location.pathname === '/pricing') return 'pricing';
    if (location.pathname === '/about') return 'about';
    if (location.pathname === '/contact') return 'contact';
    if (location.pathname.startsWith('/solutions/')) return 'solutions';
    if (location.pathname.startsWith('/docs/feature-tour')) return 'product';
    if (location.pathname.startsWith('/docs/documentation')) return 'docs';
    return 'solutions';
  })();

  const desktopNavClass = (key) =>
    `text-sm font-bold tracking-widest uppercase transition-all cursor-pointer ${
      activeKey === key
        ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]'
        : 'text-slate-400 hover:text-cyan-400'
    }`;

  const mobileNavClass = (key) =>
    `text-lg font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer ${
      activeKey === key ? 'text-cyan-300' : 'text-slate-400 hover:text-cyan-400'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020617]/55 backdrop-blur-2xl supports-backdrop-filter:bg-[#020617]/45">
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center relative">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')}>
          <HyperionLogo horizontal={true} className="h-20 w-auto" />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-10">
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('feature-tour'); }}
            className={desktopNavClass('product')}
          >
            Product
          </button>
          <div
            className="relative group"
            onMouseEnter={() => setIsSolutionsOpen(true)}
            onMouseLeave={() => setIsSolutionsOpen(false)}
          >
            <button
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
              className={desktopNavClass('solutions')}
            >
              Solutions
            </button>
            <AnimatePresence>
              {isSolutionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute top-full left-0 mt-3 w-80 rounded-2xl border border-white/20 bg-black/10 backdrop-blur-2xl p-4 shadow-[0_8px_32px_rgba(2,6,23,0.6)]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/15 via-white/5 to-cyan-400/10 pointer-events-none" />
                  <ul className="relative space-y-1">
                    {solutionItems.map((item) => (
                      <li key={item.view}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(item.view);
                            setIsSolutionsOpen(false);
                          }}
                          className="w-full text-left px-2 py-2 rounded-lg text-sm text-slate-200 hover:text-cyan-300 hover:bg-dark/20 transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('pricing'); }}
            className={desktopNavClass('pricing')}
          >
            Pricing
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('documentation'); }}
            className={desktopNavClass('docs')}
          >
            Docs
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('about'); }}
            className={desktopNavClass('about')}
          >
            About
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}
            className={`px-6 py-2.5 rounded-full cursor-pointer border text-sm font-semibold tracking-widest uppercase transition-all backdrop-blur-md active:scale-95 text-center hover:scale-105 ml-4 ${
              activeKey === 'contact'
                ? 'bg-cyan-400/20 border-cyan-300/60 text-cyan-200'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
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
                onClick={(e) => { e.preventDefault(); onNavigate('feature-tour'); setIsMenuOpen(false); }}
                className={mobileNavClass('product')}
              >
                Product
              </button>
              <div className="w-full flex flex-col items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSolutionsOpen((prev) => !prev);
                  }}
                  className={mobileNavClass('solutions')}
                >
                  Solutions
                </button>
                <AnimatePresence>
                  {isSolutionsOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="w-full max-w-xl overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-3 space-y-2"
                    >
                      {solutionItems.map((item) => (
                        <li key={item.view}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(item.view);
                              setIsMenuOpen(false);
                              setIsSolutionsOpen(false);
                            }}
                            className="w-full text-sm text-slate-200 text-center hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); onNavigate('pricing'); setIsMenuOpen(false); }}
                className={mobileNavClass('pricing')}
              >
                Pricing
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onNavigate('documentation'); setIsMenuOpen(false); }}
                className={mobileNavClass('docs')}
              >
                Docs
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onNavigate('about'); setIsMenuOpen(false); }}
                className={mobileNavClass('about')}
              >
                About
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
    </header>
  );
};
