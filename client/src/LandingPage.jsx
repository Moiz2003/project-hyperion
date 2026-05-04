import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { HyperionLogo } from './Logo';
import { Footer } from './Footer';
import { Header } from './Header';

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
    <div className="min-h-screen bg-[#020617] text-slate-50 font-inter overflow-x-hidden selection:bg-cyan-500/30 relative">

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

      {/* 2. The "Living" Hero */}
      <main
        className="max-w-7xl mx-auto px-6 pt-12 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col"
        >
          {/* <div className="mb-6 inline-flex items-center gap-3 text-cyan-400 text-sm font-bold tracking-widest uppercase bg-cyan-950/30 px-4 py-2 rounded-full w-max border border-cyan-900/50">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            Edge-Native Inference
          </div>
          </div> */}
          <h1 className="text-6xl md:text-8xl font-inter font-bold tracking-tighter text-white mb-6 leading-[1.1]">
            Radiology,<br />
            Redefined by<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Consensus.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-xl leading-relaxed font-medium tracking-wide">
            Hyperion abandons single-model frailty. Three localized agents extract, draft, and aggressively verify clinical findings in milliseconds—completely offline.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
              className="w-full sm:w-max px-12 py-5 rounded-full bg-cyan-400 text-[#020617] font-inter font-semibold text-white tracking-widest uppercase shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)] transition-all cursor-pointer text-center"
            >
              Start for free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); onNavigate('pricing'); }}
              className="w-full sm:w-max px-12 py-5 rounded-full border border-slate-600 bg-slate-800/50 text-white font-inter font-semibold text-base tracking-widest uppercase hover:bg-slate-800 hover:border-slate-400 transition-all cursor-pointer backdrop-blur-md text-center"
            >
              View Pricing
            </motion.button>
          </div>
        </motion.div>

        {/* Interactive Pulse SVG */}
        <div className="relative h-[400px] flex items-center justify-center lg:justify-end w-full">
          <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full" />
          <motion.svg
            viewBox="0 0 400 200"
            className="w-full h-full max-w-lg overflow-visible drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            <motion.path
              d="M 0 100 L 100 100 L 120 50 L 160 150 L 200 20 L 230 180 L 260 80 L 280 100 L 400 100"
              fill="none"
              stroke="url(#pulseGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
            />
            <defs>
              <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
      </main>

      {/* NEW: The "Why Edge?" Manifest */}
      <section className="py-32 bg-[#01030a] border-y border-slate-900 relative z-10 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-inter font-semibold text-white leading-tight tracking-tighter mb-12">
            Cloud AI is a
            <span className="px-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Privacy Crisis.</span>
          </h2>
          <p className="text-2xl md:text-4xl text-slate-300 font-medium leading-relaxed mb-12">
            Sending PHI to a remote server is unacceptable. But running a single local model means risking
            <motion.span
              animate={{
                textShadow: [
                  "0 0 10px rgba(34,211,238,0)",
                  "0 0 20px rgba(34,211,238,0.5)",
                  "0 0 10px rgba(34,211,238,0)"
                ],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mx-3 font-black inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              Hallucinations.
            </motion.span>
          </p>
          <div className="h-px w-32 bg-slate-800 mx-auto mb-12"></div>
          <p className="text-xl md:text-2xl text-cyan-400 font-bold tracking-wide">
            Hyperion solves this by running an adversarial swarm directly on the edge.
          </p>
        </div>
      </section>

      {/* 3. The Scannable Tech (Scroll-Focus Effect) */}
      <section className="py-40 relative z-10 bg-[#020617]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-base font-bold tracking-widest text-slate-500 uppercase mb-16">Pixel-Level Verification</h2>
          <div className="relative w-full max-w-3xl mx-auto aspect-square md:aspect-video rounded-[40px] overflow-hidden border border-slate-800 bg-black flex items-center justify-center shadow-2xl">
            <motion.div
              style={{ filter: mriBlur, opacity: mriOpacity }}
              className="absolute inset-0 opacity-80"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-600 via-[#01030a] to-black opacity-60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-[10px] border-white/20 rounded-[50px] blur-sm" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-56 border-[8px] border-white/40 rounded-[40px] blur-[2px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-32 bg-white/60 blur-[4px] rounded-full" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 border-2 border-cyan-500/50 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)]" />
                <div className="absolute -top-6 w-[2px] h-6 bg-cyan-500/50" />
                <div className="absolute -bottom-6 w-[2px] h-6 bg-cyan-500/50" />
                <div className="absolute -left-6 w-6 h-[2px] bg-cyan-500/50" />
                <div className="absolute -right-6 w-6 h-[2px] bg-cyan-500/50" />
              </div>
            </div>
          </div>
          <p className="mt-16 text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            As LLaVA interprets the raw geometry, the Critic Node actively compares the drafted report against local pixel variances, isolating anomalies with mathematical precision.
          </p>
        </div>
      </section>

      {/* NEW: Dual-Market Strategy Section */}
      <section className="py-32 relative z-10 bg-[#020617] border-t border-slate-900">
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
              className="p-12 rounded-[40px] bg-slate-900/40 border border-slate-800 shadow-2xl relative overflow-hidden group"
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

      {/* 4. Scroll Parallax Feature Grid */}
      <section className="py-40 relative z-10 overflow-hidden bg-[#01030a] border-y border-slate-900">
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
              <p className="text-slate-300 text-base font-medium leading-relaxed">LLaVA performs deterministic pixel extraction natively on GPU hardware without internet access.</p>
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
              <p className="text-slate-300 text-base font-medium leading-relaxed">DeepSeek synthesizes structural data into a preliminary clinical impression in milliseconds.</p>
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
              <p className="text-slate-200 text-base font-medium leading-relaxed">An independent auditor checks the draft against raw data, violently rejecting hallucinations.</p>
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

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
