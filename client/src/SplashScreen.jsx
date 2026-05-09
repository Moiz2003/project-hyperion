import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HyperionLogo } from './Logo';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting Hyperion...');

  useEffect(() => {
    const sequence = [
      { p: 20, text: 'Warming up Vision (InternVL)...', delay: 500 },
      { p: 50, text: 'Starting Drafter (Meditron)...', delay: 1200 },
      { p: 85, text: 'Enabling Critic checks (Llama 3)...', delay: 1800 },
      { p: 100, text: 'Ready.', delay: 2400 }
    ];

    sequence.forEach(({ p, text, delay }) => {
      setTimeout(() => {
        setProgress(p);
        setStatusText(text);
      }, delay);
    });

    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <HyperionLogo className="h-52 w-auto mb-0" />

        <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="h-6 flex items-center justify-center">
          <motion.p 
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono text-cyan-500/80 uppercase tracking-wider"
          >
            {statusText}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
