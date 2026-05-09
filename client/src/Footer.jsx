import { HyperionLogo } from './Logo';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="pt-24 pb-12 bg-slate-950/50 relative z-10 border-t border-blue-500/20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 items-start">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <HyperionLogo horizontal={true} className="h-16 w-auto" />
            </div>
            <p className="text-slate-400 text-base leading-loose mb-4 font-medium">
              Pioneering edge-native swarm intelligence for clinical environments. Secure. Verifiable. Local.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                aria-label="GitHub"
                className="w-10 h-10 rounded-2xl border border-cyan-400/30 bg-slate-950/30 text-cyan-400 flex items-center justify-center hover:border-cyan-400/60 transition-all cursor-pointer active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.87c0-1.1.1-1.4-.5-2 2-.2 4-1 4-4.5 0-1-.3-2-1-2.8.1-.3.4-1.5-.1-2.8 0 0-.8-.2-2.8 1.1-.8-.2-1.7-.3-2.6-.3-.9 0-1.8.1-2.6.3C7.4 5.7 6.6 5.9 6.6 5.9c-.5 1.3-.2 2.5-.1 2.8-.7.8-1 1.8-1 2.8 0 3.5 2 4.3 4 4.5-.4.4-.5 1-.5 2V22" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-3xl border border-cyan-400/30 bg-slate-950/30 text-cyan-400 flex items-center justify-center hover:border-cyan-400/60 transition-all cursor-pointer active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l9.5 10.5M20 20l-9.5-10.5" />
                  <path d="M20 4l-6.8 7.5M4 20l6.8-7.5" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-3xl border border-cyan-400/30 bg-slate-950/30 text-cyan-400 flex items-center justify-center hover:border-cyan-400/60 transition-all cursor-pointer active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V9h4v2" />
                  <path d="M2 9h4v12H2z" />
                  <path d="M4 4a2 2 0 1 0 0 .01" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Discord"
                className="w-10 h-10 rounded-3xl border border-cyan-400/30 bg-slate-950/30 text-cyan-400 flex items-center justify-center hover:border-cyan-400/60 transition-all cursor-pointer active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 7.5c1.1-.8 2.3-1.3 3.5-1.5 1.2.2 2.4.7 3.5 1.5" />
                  <path d="M7 8.5c-1.3 2.2-1.8 4.5-1.6 6.9 2 .8 4 1.2 6.6 1.2s4.6-.4 6.6-1.2c.2-2.4-.3-4.7-1.6-6.9" />
                  <path d="M9 14h.01M15 14h.01" />
                  <path d="M9.5 16.5c.8.6 1.7 1 2.5 1s1.7-.4 2.5-1" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 tracking-widest uppercase text-sm">Product</h4>
            <ul className="space-y-5 text-base font-medium text-slate-500">
              <li className='mb-2'><button onClick={() => onNavigate('product')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Product</button></li>
              <li className='mb-2'><button onClick={() => onNavigate('pricing')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Pricing</button></li>
              <li className='mb-2'><button onClick={() => onNavigate('documentation')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Documentation</button></li>
              <li className='mb-2'><button onClick={() => onNavigate('api-reference')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">API Reference</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 tracking-widest uppercase text-sm">Legal & Privacy</h4>
            <ul className="space-y-5 text-base font-medium text-slate-500">
              <li className='mb-2'><button onClick={() => onNavigate('privacy')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Privacy Policy</button></li>
              <li className='mb-2'><button onClick={() => onNavigate('terms')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Terms of Service</button></li>
              <li className='mb-2'><button onClick={() => onNavigate('hipaa')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">HIPAA Compliance</button></li>
              <li className='mb-2'><button onClick={() => onNavigate('contact')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Contact Us</button></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-slate-400">
          <p className="font-light">© 2026 Project Hyperion. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
