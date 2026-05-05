import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HyperionLogo } from './Logo';
import { Footer } from './Footer';
import { Header } from './Header';

// Starfield Component for background depth
const Starfield = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          duration: Math.random() * 20 + 20,
          delay: Math.random() * 5
        });
      }
      setStars(newStars);
    };
    generateStars();
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
            opacity: 0.1
          }}
          animate={{
            y: ["0%", "-100%"],
            opacity: [0.05, 0.3, 0.05]
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

export default function ContactPage({ onNavigate }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-inter selection:bg-cyan-500/30 relative overflow-x-hidden flex flex-col">
      <Starfield />

      <Header onNavigate={onNavigate} />

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="mb-12 border-b border-slate-800 pb-12 relative z-10">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-4">Get in Touch</h2>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
              Contact Us
            </h1>
          </div>

          <div className="relative z-10">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Message Intercepted</h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                  Our swarm has received your transmission. A team member will respond shortly.
                </p>
                <button
                  onClick={() => onNavigate('landing')}
                  className="mt-8 px-8 py-3 rounded-full bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-slate-200 transition-all"
                >
                  Return Home
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-black/40 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      placeholder="Dr. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-black/40 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      placeholder="john@hospital.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Message</label>
                  <textarea
                    required
                    className="w-full bg-black/40 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all min-h-[200px]"
                    placeholder="How can our swarm help your clinical team?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-2xl bg-cyan-400 text-[#020617] font-bold text-white text-sm tracking-widest uppercase hover:bg-cyan-300  cursor-pointer transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
