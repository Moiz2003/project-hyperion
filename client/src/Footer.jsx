import { HyperionLogo } from './Logo';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="pt-24 pb-12 bg-[#000] relative z-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 items-start">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-6">
              <HyperionLogo horizontal={true} className="h-16 w-auto" />
            </div>
            <p className="text-slate-400 text-base leading-loose mb-8 font-medium">
              Pioneering edge-native swarm intelligence for clinical environments. Secure. Verifiable. Local.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-white text-black font-inter font-semibold text-xs tracking-widest uppercase rounded-full hover:bg-slate-200 transition-all shadow-lg hover:shadow-white/20 cursor-pointer active:scale-95 hover:scale-105"
            >
              Access Dashboard
            </button>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 tracking-widest uppercase text-sm">Product</h4>
            <ul className="space-y-5 text-base font-bold text-slate-500">
              <li><button onClick={() => onNavigate('feature-tour')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Product</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Pricing</button></li>
              <li><button onClick={() => onNavigate('documentation')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Documentation</button></li>
              <li><button onClick={() => onNavigate('api-reference')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">API Reference</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 tracking-widest uppercase text-sm">Legal & Privacy</h4>
            <ul className="space-y-5 text-base font-bold text-slate-500">
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('hipaa')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">HIPAA Compliance</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-cyan-400 transition-colors cursor-pointer text-left">Contact Us</button></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-slate-700">
          <p className="font-bold">© 2026 Project Hyperion Core Team.</p>
        </div>

      </div>
    </footer>
  );
};
