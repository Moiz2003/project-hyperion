import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

const Starfield = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: 0.1,
          }}
          animate={{ y: ['0%', '-100%'], opacity: [0.05, 0.3, 0.05] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export default function AboutPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-inter selection:bg-cyan-500/30 relative overflow-x-hidden flex flex-col">
      <Starfield />
      <Header onNavigate={onNavigate} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-20 relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 md:p-14 shadow-2xl"
        >
         
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight mb-6">
            Healthcare is a trust-heavy industry.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
            Hyperion is built for teams that need diagnostic support that is transparent, accountable, and practical for
            real-world clinical workflows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <article className="rounded-2xl border border-cyan-400/20 bg-slate-900/50 p-6 hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-400/10">
              <h2 className="text-xl font-semibold text-white mb-3">Why Hyperion</h2>
              <p className="text-slate-400 leading-relaxed">
                We combine edge-native AI inference with clinician-first design so decisions are faster, explainable, and
                deployable in constrained environments.
              </p>
            </article>
            <article className="rounded-2xl border border-cyan-400/20 bg-slate-900/50 p-6 hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-400/10">
              <h2 className="text-xl font-semibold text-white mb-3">Security / Compliance</h2>
              <p className="text-slate-400 leading-relaxed">
                Hyperion is designed to support HIPAA-aligned workflows with protected data handling, role-aware access,
                and audit-conscious system architecture.
              </p>
            </article>
          </div>
        </motion.section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
