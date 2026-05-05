import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Header } from '../../Header';
import { Footer } from '../../Footer';

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

export default function SolutionPageTemplate({ onNavigate, title, subtitle, description, featureCards }) {
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
          <p className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-4">Solutions</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight mb-4">{title}</h1>
          <h2 className="text-xl md:text-2xl text-cyan-300 font-semibold mb-6">{subtitle}</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">{description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {featureCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-800 bg-black/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{card.description}</p>
              </article>
            ))}
          </div>
        </motion.section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
