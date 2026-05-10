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

const DOC_CONTENT = {
  'feature-tour': {
    title: 'The Hyperion Architecture',
    subtitle: 'Feature Tour & System Design',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-slate-300 font-medium leading-relaxed">
          Standard medical AI hallucinates because it forces a single transformer to both extract visual geometry and synthesize clinical knowledge. Hyperion splits this cognitive load across an adversarial network.
        </p>

        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,1)]"></div>
          <h3 className="text-2xl font-inter font-semibold text-white mb-4">Node 1: Edge Vision (InternVL)</h3>
          <p className="text-slate-400 leading-relaxed">
            A lightweight, multimodal agent dedicated entirely to geometry extraction. It doesn't attempt to diagnose; it simply maps the pixel variances and flags structural anomalies in the scan. Runs perfectly on an RTX 3050.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
          <h3 className="text-2xl font-inter font-semibold text-white mb-4">Node 2: The Drafter (Meditron)</h3>
          <p className="text-slate-400 leading-relaxed">
            The Drafter takes the raw geometry from Node 1 and cross-references it against a massive embedded clinical knowledge base to write a preliminary impression.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/50 border border-cyan-400/20 shadow-xl relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.8)]"></div>
          <h3 className="text-2xl font-inter font-semibold text-white mb-4">Node 3: The Critic Node</h3>
          <p className="text-slate-400 leading-relaxed">
            The independent auditor. It checks the Drafter's output against the underlying evidence. If a claim isn't supported by what the system can point to, the Critic flags it and requests a revision before finalizing.
          </p>
        </div>
      </div>
    )
  },
  'documentation': {
    title: 'Platform Documentation',
    subtitle: '',
    content: (
      <div className="space-y-8 text-slate-300 leading-relaxed font-medium">
        <p>Hyperion is designed to be completely air-gapped. Deployment requires zero external API keys if running fully local open-weights.</p>

        <h3 className="text-2xl font-inter font-semibold text-white mt-12 mb-6">Hardware Requirements</h3>
        <ul className="list-disc list-inside space-y-4 text-slate-400 ml-4">
          <li><strong>Minimum:</strong> NVIDIA RTX 3050 (8GB VRAM) or Apple M1/M2 (16GB Unified Memory)</li>
          <li><strong>Recommended:</strong> NVIDIA RTX 4090 or Apple M3 Max</li>
          <li><strong>Enterprise:</strong> AMD MI300X Clusters</li>
        </ul>

        <h3 className="text-2xl font-inter font-semibold text-white mt-12 mb-6">Local Installation via Ollama</h3>
        <div className="p-6 bg-[#000] border border-slate-800 rounded-xl font-inter text-sm text-cyan-400 shadow-inner">
          <p className="text-slate-600 mb-2"># Install the Vision Agent (Node 1)</p>
          <p>ollama run internvl</p>
          <br />
          <p className="text-slate-600 mb-2"># Start the Express Orchestrator</p>
          <p>cd server && npm run dev</p>
          <br />
          <p className="text-slate-600 mb-2"># Launch the React HUD</p>
          <p>cd client && npm run dev</p>
        </div>
      </div>
    )
  },
  'api-reference': {
    title: 'API Reference',
    subtitle: 'Headless Integration',
    content: (
      <div className="space-y-8 text-slate-300 leading-relaxed font-medium">
        <p>Integrate the Hyperion swarm directly into your existing RIS/PACS systems using our localized HTTP endpoints.</p>

        <h3 className="text-xl font-bold text-white mt-8 flex items-center gap-4">
          <span className="px-3 py-1 bg-emerald-950/50 text-emerald-400 text-xs tracking-widest uppercase rounded-sm border border-emerald-900/50">POST</span>
          /api/analyze-scan
        </h3>

        <div className="p-6 bg-[#000] border border-slate-800 rounded-xl font-inter text-sm text-slate-300 overflow-x-auto shadow-inner mt-4">
          <p className="text-slate-500 mb-4">// Request Example (JavaScript Fetch)</p>
          <p className="text-cyan-400">const</p> formData = <p className="text-cyan-400 inline">new</p> FormData();<br />
          formData.<p className="text-blue-400 inline">append</p>('xray_image', fileInput.files[0]);<br />
          <br />
          <p className="text-cyan-400 inline">const</p> response = <p className="text-cyan-400 inline">await</p> <p className="text-blue-400 inline">fetch</p>('http://localhost:3000/api/analyze-scan', {'{'} <br />
          &nbsp;&nbsp;method: 'POST',<br />
          &nbsp;&nbsp;body: formData<br />
          {'}'});
        </div>

        <h3 className="text-xl font-bold text-white mt-12 mb-4">JSON Response Schema</h3>
        <div className="p-6 bg-[#000] border border-slate-800 rounded-xl font-inter text-sm text-emerald-400 shadow-inner">
          {'{'}<br />
          &nbsp;&nbsp;"status": "success",<br />
          &nbsp;&nbsp;"data": {'{'}<br />
          &nbsp;&nbsp;&nbsp;&nbsp;"raw_findings": "...",<br />
          &nbsp;&nbsp;&nbsp;&nbsp;"verified_report": "...",<br />
          &nbsp;&nbsp;&nbsp;&nbsp;"urgency_flag": "High",<br />
          &nbsp;&nbsp;&nbsp;&nbsp;"recommended_dept": "Pulmonology",<br />
          &nbsp;&nbsp;&nbsp;&nbsp;"critic_interventions": 2<br />
          &nbsp;&nbsp;{'}'},<br />
          &nbsp;&nbsp;"processing_latency": "3.2s"<br />
          {'}'}
        </div>
      </div>
    )
  },
  'privacy': {
    title: 'Privacy Policy',
    subtitle: 'Zero Data Retention Framework',
    content: (
      <div className="space-y-6 text-slate-400 leading-relaxed">
        <p className="font-bold text-white">Last Updated: April 2026</p>
        <p>Project Hyperion operates on a "Zero Data Retention" architecture. By design, our software does not phone home, does not store Protected Health Information (PHI) on our servers, and does not require an active internet connection to execute inference.</p>

        <h3 className="text-xl font-bold text-white mt-8">1. Air-Gapped Execution</h3>
        <p>When deployed on local hardware (Academic and Clinician Pro tiers), all images remain entirely within your facility's isolated network. The software loads the inference weights into local VRAM and purges all tensors immediately upon returning the final JSON report.</p>

        <h3 className="text-xl font-bold text-white mt-8">2. Analytics & Telemetry</h3>
        <p>We do not collect usage telemetry. We do not track diagnostic outcomes. You are buying the engine, not renting access to a tracking network.</p>
      </div>
    )
  },
  'terms': {
    title: 'Terms of Service',
    subtitle: 'Software Licensing Agreement',
    content: (
      <div className="space-y-6 text-slate-400 leading-relaxed">
        <p>By downloading or utilizing the Hyperion Edge Engine, you agree to the following terms regarding clinical liability and software usage.</p>

        <h3 className="text-xl font-bold text-white mt-8">1. Diagnostic Augmentation Only</h3>
        <p>Hyperion is an assistive tool, not an autonomous diagnostic agent. A licensed medical practitioner must always review the 'Verified Consensus Report' before initiating patient treatment. We are not liable for clinical misdiagnoses.</p>

        <h3 className="text-xl font-bold text-white mt-8">2. Reverse Engineering</h3>
        <p>You may not reverse-engineer the proprietary adversarial prompts driving the Critic Node, nor attempt to extract the fine-tuned adapter weights integrated within the proprietary Hyperion container.</p>
      </div>
    )
  },
  'hipaa': {
    title: 'HIPAA & Compliance',
    subtitle: 'Enterprise Security Posture',
    content: (
      <div className="space-y-6 text-slate-400 leading-relaxed">
        <div className="p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl mb-8 flex items-start gap-4 shadow-[0_0_30px_rgba(52,211,153,0.05)]">
          <div className="w-12 h-12 bg-emerald-950 border border-emerald-500/50 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-400 mb-2">Verified Local: HIPAA Compliant by Design</h3>
            <p className="text-sm text-slate-300">Because Hyperion runs entirely on your local hardware, there is no transmission of PHI to third-party servers. Therefore, standard BAA (Business Associate Agreements) with us are unnecessary.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-8">Encryption at Rest</h3>
        <p>All transient data held in swap memory during swarm consensus is encrypted using AES-256 block ciphers. Data is automatically zeroed out the millisecond the API request concludes.</p>

        <h3 className="text-xl font-bold text-white mt-8">Audit Logging</h3>
        <p>Enterprise deployments feature tamper-proof audit logging. Every inference run logs the exact timestamp, local IP, and the exact Critic Node interventions required to reach consensus, ensuring perfect accountability for compliance reviews.</p>
      </div>
    )
  }
};

export default function DocumentPage({ type, onNavigate }) {
  const doc = DOC_CONTENT[type] || DOC_CONTENT['feature-tour'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-50 font-inter selection:bg-cyan-500/30 relative overflow-x-hidden flex flex-col">
      <Starfield />

      <Header onNavigate={onNavigate} />

      {/* Content Engine */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="mb-12 border-b border-slate-800 pb-12 relative z-10">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-4">{doc.subtitle}</h2>
            <h1 className="text-4xl md:text-6xl font-inter font-bold text-white tracking-tighter leading-tight">
              {doc.title}
            </h1>
          </div>

          <div className="relative z-10">
            {doc.content}
          </div>
        </motion.div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
