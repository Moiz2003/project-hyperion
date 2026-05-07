import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HyperionLogo } from './Logo';
import { Footer } from './Footer';
import { Header } from './Header';

// Reusing Custom Icons
const CustomIcons = {
  Check: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

// 3D Card Component
const TiltCard = ({ children, highlighted }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative w-full p-8 rounded-3xl backdrop-blur-xl border transition-colors duration-500
        ${highlighted
          ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.2)]'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
        }
      `}
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

// Starfield Component
const Starfield = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          duration: Math.random() * 10 + 10,
          delay: Math.random() * 5
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: 0.1
          }}
          animate={{
            y: ["0%", "-100%"],
            opacity: [0.1, 0.8, 0.1]
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function PricingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-inter selection:bg-cyan-500/30 relative overflow-x-hidden flex flex-col">
      <Starfield />

      <Header onNavigate={onNavigate} />

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-20 perspective-1000">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* <div className="mb-6 inline-flex items-center gap-3 text-indigo-400 text-xs font-bold tracking-widest uppercase border border-indigo-500/30 px-4 py-2 rounded-full bg-indigo-500/10 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Enterprise Deployment
          </div> */}
          <h1 className="text-5xl md:text-7xl font-inter font-bold tracking-tighter text-white mb-6">
            Compute the future.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Deploy the swarm on your hardware or scale across clinical clusters. Simple pricing for deterministic results.
          </p>
        </motion.div>

        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

          {/* TIER 1: Academic */}
          <TiltCard>
            <h3 className="text-2xl font-inter font-semibold text-white mb-2">Academic</h3>
            <p className="text-slate-400 text-sm mb-6">For researchers and students.</p>
            <div className="mb-8">
              <span className="text-5xl font-inter font-bold text-white">Free</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> 20 scans per day</li>
              <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> Cloud-Inference Fallback</li>
              <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> Community Support</li>
            </ul>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full py-4 rounded-xl border border-slate-700 text-white font-inter font-semibold tracking-widest uppercase text-xs hover:bg-slate-800 transition-colors"
            >
              Get Started
            </button>
          </TiltCard>

          {/* TIER 2: Clinician Pro */}
          <div className="relative transform md:scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20">
              Most Popular
            </div>
            <TiltCard highlighted={true}>
              <h3 className="text-2xl font-inter font-semibold text-white mb-2">Clinician Pro</h3>
              <p className="text-slate-400 text-sm mb-6">For independent practitioners.</p>
              <div className="mb-8">
                <span className="text-5xl font-inter font-bold text-white">$199</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> Unlimited Scans</li>
                <li className="flex items-center gap-3 text-sm text-white font-medium"><CustomIcons.Check /> RTX 3050 Local-Edge Support</li>
                <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> Custom Report Headers</li>
                <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> Priority Verification Queue</li>
              </ul>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-inter font-semibold tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              >
                Start Trial
              </button>
            </TiltCard>
          </div>

          {/* TIER 3: Enterprise */}
          <TiltCard>
            <h3 className="text-2xl font-inter font-semibold text-white mb-2">Enterprise</h3>
            <p className="text-slate-400 text-sm mb-6">For hospital networks.</p>
            <div className="mb-8">
              <span className="text-4xl font-inter font-bold text-white">Custom</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> Multi-Node Clusters</li>
              <li className="flex items-center gap-3 text-sm text-white font-medium"><CustomIcons.Check /> AMD MI300X Optimization</li>
              <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> 100% Air-Gapped Deployment</li>
              <li className="flex items-center gap-3 text-sm text-slate-300"><CustomIcons.Check /> BAA / HIPAA Audit Logging</li>
            </ul>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full py-4 rounded-xl border border-slate-700 text-white font-inter font-semibold tracking-widest uppercase text-xs hover:bg-white hover:text-black transition-colors"
            >
              Contact Sales
            </button>
          </TiltCard>

        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
