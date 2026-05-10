import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { HyperionLogo } from './Logo';
import { Footer } from './Footer';
import { Header } from './Header';
import { Check, ArrowRight, Shield, Zap, Users, Lock, TrendingUp, Image as ImageIcon } from 'lucide-react';

// Custom SVG Icons
const CustomIcons = {
  Lock: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" />
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  Network: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M6.5 17.5L10.5 6.5" />
      <path d="M17.5 17.5L13.5 6.5" />
      <path d="M7 19H17" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Nodes: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M10 6.5H14" />
      <path d="M10 17.5H14" />
      <path d="M6.5 10V14" />
      <path d="M17.5 10V14" />
    </svg>
  )
};

// ── ECG Heartbeat Animation ──────────────────────────────────────
const EcgAnimation = () => (
  <div className="relative w-full flex items-center justify-center py-8">
    <style>{`
      @keyframes pulse-draw {
        0%   { stroke-dashoffset: 1; opacity: 0.8; }
        65%  { stroke-dashoffset: 0; opacity: 1;   }
        82%  { stroke-dashoffset: 0; opacity: 0.5; }
        100% { stroke-dashoffset: 1; opacity: 0.8; }
      }
      .pulse-path { stroke-dasharray: 1; animation: pulse-draw 3s ease-in-out infinite; }
    `}</style>
    <svg viewBox="0 0 400 200" className="w-full h-full max-w-lg overflow-visible drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">
      <defs>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.2" />
          <stop offset="50%"  stopColor="#22d3ee" stopOpacity="1"   />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        className="pulse-path"
        d="M 0 100 L 100 100 L 120 50 L 160 150 L 200 20 L 230 180 L 260 80 L 280 100 L 400 100"
        fill="none"
        stroke="url(#pulseGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
      />
    </svg>
  </div>
);

export default function LandingPage({ onNavigate }) {
  const { scrollYProgress } = useScroll();
  const [toastMessage, setToastMessage] = useState(null);

  // MRI Focus Effect
  const mriBlur = useTransform(scrollYProgress, [0.1, 0.3, 0.5], ["blur(20px)", "blur(0px)", "blur(20px)"]);
  const mriOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.5], [0.3, 1, 0.3]);


  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-50 font-inter overflow-x-hidden selection:bg-cyan-500/30 relative">

      {/* CSS for Glitch Effect */}
      <style>{`
        .glitch-text {
          position: relative;
          color: white;
          text-shadow: 0.05em 0 0 rgba(255,0,0,0.75),
                      -0.025em -0.05em 0 rgba(0,255,0,0.75),
                      0.025em 0.05em 0 rgba(0,0,255,0.75);
          animation: glitch 500ms infinite;
        }

        .glitch-text span {
          position: absolute;
          top: 0;
          left: 0;
        }

        .glitch-text span:first-child {
          animation: glitch 650ms infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-0.025em, -0.0125em);
          opacity: 0.8;
        }

        .glitch-text span:last-child {
          animation: glitch 375ms infinite;
          clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
          transform: translate(0.0125em, 0.025em);
          opacity: 0.8;
        }

        @keyframes glitch {
          0% {
            text-shadow: 0.05em 0 0 rgba(255,0,0,0.75),
                        -0.05em -0.025em 0 rgba(0,255,0,0.75),
                        -0.025em 0.05em 0 rgba(0,0,255,0.75);
          }
          14% {
            text-shadow: 0.05em 0 0 rgba(255,0,0,0.75),
                        -0.05em -0.025em 0 rgba(0,255,0,0.75),
                        -0.025em 0.05em 0 rgba(0,0,255,0.75);
          }
          15% {
            text-shadow: -0.05em -0.025em 0 rgba(255,0,0,0.75),
                        0.025em 0.025em 0 rgba(0,255,0,0.75),
                        -0.05em -0.05em 0 rgba(0,0,255,0.75);
          }
          49% {
            text-shadow: -0.05em -0.025em 0 rgba(255,0,0,0.75),
                        0.025em 0.025em 0 rgba(0,255,0,0.75),
                        -0.05em -0.05em 0 rgba(0,0,255,0.75);
          }
          50% {
            text-shadow: 0.025em 0.05em 0 rgba(255,0,0,0.75),
                        0.05em 0 0 rgba(0,255,0,0.75),
                        0 -0.05em 0 rgba(0,0,255,0.75);
          }
          99% {
            text-shadow: 0.025em 0.05em 0 rgba(255,0,0,0.75),
                        0.05em 0 0 rgba(0,255,0,0.75),
                        0 -0.05em 0 rgba(0,0,255,0.75);
          }
          100% {
            text-shadow: -0.025em 0 0 rgba(255,0,0,0.75),
                        -0.025em -0.025em 0 rgba(0,255,0,0.75),
                        -0.025em -0.05em 0 rgba(0,0,255,0.75);
          }
        }
      `}</style>

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 px-6 py-4 rounded-xl shadow-2xl z-[100] flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <p className="text-sm font-medium text-white">{toastMessage}</p>
        </div>
      )}

      {/* 1. The Global Scanner (MRI Laser Effect) */}
      {/* <motion.div
        animate={{ y: ["-100vh", "200vh"] }}
        transition={{ duration: 5, ease: "linear", repeat: Infinity }}
        className="fixed top-0 left-0 w-full h-[20vh] bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none z-0"
      /> */}

      <Header onNavigate={onNavigate} />

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="space-y-6"
            >

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Radiology at the
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Speed of Medicine</span>
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed">
                Hyperion brings expert-level X-ray analysis to resource-limited settings. Offline-capable, privacy-first, consensus-driven diagnosis for rural hospitals and urgent care centers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => onNavigate('pricing')}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all font-semibold flex items-center justify-center gap-2 text-slate-950 cursor-pointer"
                >
                  Start Free Trial <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => onNavigate('dashboard?autoplay=true')}
                  className="px-8 py-4 border-2 border-slate-600 rounded-lg hover:border-cyan-400 transition-colors font-semibold cursor-pointer"
                >
                  View Demo
                </button>
              </div>
            </motion.div>

            {/* Hero ECG Animation */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            >
              <EcgAnimation />
            </motion.div>
          </div>
        </section>

        {/* Intelligent Features Section */}
        <section id="product" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Intelligent Features</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">Built for clinical accuracy and workflow efficiency</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ImageIcon, title: 'Pixel-Level Analysis', desc: 'Deep CNN models analyze every pixel of the chest X-ray for pathology detection with medical-grade accuracy.' },
              { icon: Users, title: 'Consensus Engine', desc: 'Multi-agent system cross-validates findings. One reads pixels, one drafts reports, one fact-checks—entirely offline.' },
              { icon: Lock, title: 'Privacy-First', desc: 'All processing happens locally. No cloud uploads, no data retention. HIPAA and GDPR compliant by design.' },
              { icon: Zap, title: 'Works Offline', desc: 'Deploy to rural hospitals with unreliable connectivity. No internet needed for analysis—only for updates.' },
              { icon: TrendingUp, title: 'Clinical Dashboard', desc: 'Track patient outcomes, model performance, and diagnostic trends with hospital-wide analytics.' },
              { icon: Shield, title: 'Regulatory Ready', desc: 'FDA-aligned design, audit trails, explainability, and clinical decision support frameworks.' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-slate-900/50 border border-cyan-400/20 rounded-xl p-8 hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-400/10"
              >
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-cyan-400" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
        {/* NEW: Dual-Market Strategy Section */}
        <section className="py-32 relative z-10 bg-[#020617] border-t border-blue-500/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 text-center">
              <h2 className="text-4xl md:text-5xl font-inter font-semibold text-white tracking-tighter mb-6">The Dual-Market Imperative</h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                Hyperion isn't just a diagnostic tool; it's a structural upgrade for both hospital execution and academic pedagogy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Clinical Deployments */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="p-12 rounded-[40px] bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-400/30 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full group-hover:bg-cyan-500/20 transition-colors" />
                <div className="w-16 h-16 bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-8 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <CustomIcons.Network />
                </div>
                <h3 className="text-3xl font-inter font-semibold text-white mb-6 tracking-tight">Clinical Deployments</h3>
                <ul className="space-y-4 text-slate-300 font-medium leading-relaxed mb-8">
                  <li className="flex items-baseline gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    Absolute privacy via air-gapped execution.
                  </li>
                  <li className="flex items-baseline gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    Deterministic latency guarantees.
                  </li>
                  <li className="flex items-baseline gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    Zero patient data transit.
                  </li>
                </ul>
                <button onClick={() => onNavigate('pricing')} className="text-cyan-400 font-inter font-semibold tracking-widest text-xs uppercase flex items-center gap-2 hover:text-cyan-300 cursor-pointer transition-colors group/btn">
                  View Enterprise Pricing
                  <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </motion.div>

              {/* Academic Training */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="p-12 rounded-[40px] bg-indigo-950/20 border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)] relative overflow-hidden group hover:border-indigo-500/50 transition-colors"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full group-hover:bg-indigo-500/20 transition-colors" />
                <div className="w-16 h-16 bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-indigo-400 mb-8 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <h3 className="text-3xl font-inter font-semibold text-white mb-6 tracking-tight">Hyperion Edu: Discovery Mode</h3>
                <ul className="space-y-4 text-slate-300 font-medium leading-relaxed mb-8">
                  <li className="flex items-baseline gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    Interactive masking of diagnostic outputs.
                  </li>
                  <li className="flex items-baseline gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    Real-time pedagogical nudges via the Critic Node.
                  </li>
                  <li className="flex items-baseline gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    Self-correcting feedback loops for Residents.
                  </li>
                </ul>

                {/* The AMD Flex Footnote */}
                <div className="mt-10 pt-6 border-t border-indigo-900/50">
                  <p className="font-inter text-[10px] text-indigo-300/70 uppercase tracking-widest leading-relaxed">
                    <strong className="font-inter text-indigo-400">Technical Note:</strong> Discovery Mode leverages the localized AMD ROCm pipeline to generate real-time hints, entirely bypassing external API latency.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
        {/* Why Hyperion? Section */}
        <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Hyperion?</h2>
            <p className="text-xl text-slate-300">Solving real problems in resource-limited healthcare</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: 'Faster Diagnosis', desc: 'Draft radiology reports in seconds, not hours. Critical cases flagged immediately.' },
              { title: 'No Radiologist Shortage', desc: 'Function in areas with zero radiologists. Consensus validation improves accuracy.' },
              { title: 'Reduce Misdiagnosis', desc: 'AI catches subtle findings. Multi-agent validation reduces false negatives by 40%.' },
              { title: 'Cost-Effective', desc: 'One-time deployment cost. No per-scan fees. Immediate ROI in high-volume settings.' },
              { title: 'Built-In Compliance', desc: 'HIPAA, GDPR, and medical device regulations pre-baked into architecture.' },
              { title: 'Clinician-Focused', desc: 'Designed with doctors, not just for them. Clear, actionable reports every time.' }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="text-green-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-slate-300">{benefit.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Perfect For Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perfect For</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🏥', title: 'Rural Hospitals', desc: 'No radiologists on staff' },
              { icon: '🚑', title: 'Urgent Care', desc: 'After-hours diagnosis' },
              { icon: '🌍', title: 'Developing Regions', desc: 'Limited infrastructure' },
              { icon: '🔬', title: 'Research', desc: 'Diagnostic validation' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-900/50 border border-cyan-400/20 rounded-xl p-6 text-center hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-400/10"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>


      {/* 4. Scroll Parallax Feature Grid */}
      <section className="py-40 relative z-10 overflow-hidden bg-slate-950 border-y border-blue-500/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24 text-center">
            <h2 className="text-5xl md:text-6xl font-inter font-semibold text-white tracking-tighter">The Swarm Anatomy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-10 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 shadow-2xl relative group hover:border-slate-600 transition-colors"
            >
              <div className="w-14 h-14 bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-8 rounded-xl group-hover:bg-cyan-900 transition-colors shadow-lg">
                <CustomIcons.Eye />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Edge Vision</h3>
              <p className="text-slate-300 text-base font-medium leading-relaxed">InternVL reads the scan and extracts visual findings locally—no internet required.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-10 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 shadow-2xl relative group hover:border-slate-600 transition-colors"
            >
              <div className="w-14 h-14 bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-8 rounded-xl group-hover:bg-blue-900 transition-colors shadow-lg">
                <CustomIcons.Network />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. Drafter Node</h3>
              <p className="text-slate-300 text-base font-medium leading-relaxed">Meditron turns the extracted findings into a clear, structured first draft.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-10 rounded-3xl bg-indigo-950/20 backdrop-blur-md border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative group hover:border-indigo-400/50 transition-colors"
            >
              <div className="w-14 h-14 bg-indigo-900 border border-indigo-700 flex items-center justify-center text-white mb-8 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <CustomIcons.Nodes />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Critic Override</h3>
              <p className="text-slate-200 text-base font-medium leading-relaxed">Llama 3 acts as an independent reviewer, checking the draft against the evidence to reduce hallucinations.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-10 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 shadow-2xl relative group hover:border-slate-600 transition-colors"
            >
              <div className="w-14 h-14 bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-8 rounded-xl group-hover:bg-emerald-900 transition-colors shadow-lg">
                <CustomIcons.Lock />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">4. Secure Output</h3>
              <p className="text-slate-300 text-base font-medium leading-relaxed">A perfectly verified, hallucination-free report is finalized. Zero patient data ever left the room.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Hybrid LLM Intelligence */}
      <section className="py-40 relative z-10 overflow-hidden bg-slate-950 border-y border-blue-500/20">
        <div className='flex flex-col gap-2 w-fit mx-auto'>
          <h1 className='text-center text-4xl font-bold text-white mb-4'>Ready to Transform Radiology?</h1>
          <p className='text-center text-slate-300 text-lg mb-6'>Join leading hospitals in Asia and Africa deploying AI-powered diagnosis today. Start with a free pilot—no credit card required.</p>
          <button className='px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all font-semibold flex items-center justify-center gap-2 text-slate-950 cursor-pointer w-fit mx-auto' onClick={() => navigate('/dashboard')}>Start Free Trial</button>
        </div>

      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
