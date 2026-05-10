import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Building2, Siren, Users, Stethoscope, PlayCircle } from 'lucide-react';
import demoXray from './assets/demo_xray.png';
import pixelHeatmap from './assets/pixel_heatmap.png';
import consensusWorkflow from './assets/consensus_workflow.png';
import privacyShield from './assets/privacy_shield.png';
import './ProductPage.css';

const ProductPage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="hyperion-product-page bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 min-h-screen text-slate-50">
      <Header onNavigate={onNavigate} />

      <main>
        {/* Product Hero */}
        <section className="product-hero">
          <div className="product-header">
            <div>
              <h1 className="text-white">Intelligent X-Ray <span className="highlight">Diagnosis</span></h1>
              <p className="product-tagline">Expert-level radiology analysis powered by multi-agent AI consensus. Offline-first, privacy-by-default, built for clinicians.</p>
              <div className="product-stats">
                <div className="stat-block">
                  <div className="stat-value">94%</div>
                  <div className="stat-label">Diagnostic Accuracy</div>
                </div>
                <div className="stat-block">
                  <div className="stat-value">&lt;3s</div>
                  <div className="stat-label">Analysis Time</div>
                </div>
                <div className="stat-block">
                  <div className="stat-value">100%</div>
                  <div className="stat-label">Offline Capable</div>
                </div>
              </div>
            </div>
            <div className="product-image relative group overflow-hidden p-0 border-none bg-transparent">
              <img src={demoXray} alt="Chest X-Ray Analysis Demo" loading="lazy" className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <button className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-full p-4 backdrop-blur-sm transition-all transform group-hover:scale-110 cursor-pointer border border-cyan-400/30">
                  <PlayCircle size={48} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => switchTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'capabilities' ? 'active' : ''}`}
                onClick={() => switchTab('capabilities')}
              >
                Capabilities
              </button>
              <button
                className={`tab-btn ${activeTab === 'deployment' ? 'active' : ''}`}
                onClick={() => switchTab('deployment')}
              >
                Deployment
              </button>
            </div>

            <div id="overview" className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', marginBottom: '1rem' }}>How Hyperion Works</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>Hyperion uses a three-layer consensus engine to analyze chest X-rays with medical-grade accuracy. First, a pixel-level CNN identifies regions of interest. Second, a clinical assessment module evaluates findings against diagnostic criteria. Third, an explainability layer generates actionable reports for clinicians.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>All processing happens locally on your device. Images are never uploaded to the cloud. No data retention. HIPAA and GDPR compliant by design.</p>
            </div>

            <div id="capabilities" className={`tab-content ${activeTab === 'capabilities' ? 'active' : ''}`}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', marginBottom: '1rem' }}>What Hyperion Detects</h3>
              <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', listStyle: 'none', padding: 0 }}>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Pneumonia (bacterial, viral)</li>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Tuberculosis</li>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Pneumothorax</li>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Cardiomegaly</li>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Pulmonary Edema</li>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Pleural Effusion</li>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Nodules & Masses</li>
                <li style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>✓ Fractured Ribs</li>
              </ul>
            </div>

            <div id="deployment" className={`tab-content ${activeTab === 'deployment' ? 'active' : ''}`}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', marginBottom: '1rem' }}>Deployment Options</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}><strong>Cloud Integrated:</strong> DICOM integration with existing hospital systems. Real-time sync. Full audit trails.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}><strong>Offline Standalone:</strong> Install on local servers. No internet required. Perfect for remote clinics.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}><strong>Mobile App:</strong> Analyze on tablet or laptop. Works with USB X-ray readers.</p>
            </div>
          </div>
        </section>

        {/* Features Deep Dive */}
        <section className="features-section">
          <h2 className="section-title">Core Capabilities</h2>
          <div className="feature-rows">
            <div className="feature-row">
              <div className="feature-text">
                <h3><span className="accent">Pixel-Level</span> Analysis</h3>
                <p>Deep convolutional networks read every region of the chest with medical-grade precision. Our model identifies subtle findings—nodules, infiltrates, effusions—that human eyes might miss.</p>
                <ul className="feature-list">
                  <li>Multi-scale feature detection</li>
                  <li>Attention mechanisms for critical zones</li>
                  <li>Gradient-based explainability</li>
                </ul>
              </div>
              <div className="feature-visual p-0 overflow-hidden border-none bg-transparent">
                <img src={pixelHeatmap} alt="Pixel-level heat map visualization" loading="lazy" className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>

            <div className="feature-row alt">
              <div className="feature-text">
                <h3><span className="accent">Consensus</span> Engine</h3>
                <p>Three AI agents cross-validate findings. One reads pixels. One drafts clinical reports. One fact-checks findings against medical literature. The result: zero false positives on critical pathology.</p>
                <ul className="feature-list">
                  <li>Multi-agent agreement scoring</li>
                  <li>Automatic uncertainty flagging</li>
                  <li>Confidence scoring (0-100%)</li>
                </ul>
              </div>
              <div className="feature-visual p-0 overflow-hidden border-none bg-transparent">
                <img src={consensusWorkflow} alt="Consensus validation workflow" loading="lazy" className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>

            <div className="feature-row">
              <div className="feature-text">
                <h3><span className="accent">Privacy</span> First</h3>
                <p>All processing happens locally. Images never leave your device. No cloud uploads. No data retention. Fully HIPAA and GDPR compliant by architectural design.</p>
                <ul className="feature-list">
                  <li>On-device processing</li>
                  <li>End-to-end encryption</li>
                  <li>Zero data telemetry</li>
                </ul>
              </div>
              <div className="feature-visual p-0 overflow-hidden border-none bg-transparent">
                <img src={privacyShield} alt="Privacy architecture diagram" loading="lazy" className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>

            {/* <div className="feature-row alt">
              <div className="feature-text">
                <h3><span className="accent">Clinical</span> Dashboard</h3>
                <p>Track outcomes, performance metrics, and diagnostic trends across your hospital. Real-time alerts for critical findings. Patient history and longitudinal tracking.</p>
                <ul className="feature-list">
                  <li>Real-time case management</li>
                  <li>Performance analytics by radiologist</li>
                  <li>Longitudinal patient tracking</li>
                </ul>
              </div>
              <div className="feature-visual">
                Dashboard analytics UI
              </div>
            </div> */}
          </div>
        </section>

        {/* Use Cases */}
        <section className="use-cases">
          <div className="use-cases-container">
            <h2 className="section-title">Perfect For</h2>
            <div className="use-cases-grid">
              <div className="use-case-card">
                <div className="use-case-icon">
                  <Building2 className="text-cyan-400" size={24} />
                </div>
                <h3>Rural Hospitals</h3>
                <p>No radiologists on staff? Hyperion provides expert-level diagnostic support with zero connectivity requirements. Deploy once, run forever offline.</p>
              </div>
              <div className="use-case-card">
                <div className="use-case-icon">
                  <Siren className="text-cyan-400" size={24} />
                </div>
                <h3>Emergency Departments</h3>
                <p>Chest X-rays in seconds, not hours. Hyperion prioritizes critical cases and flags life-threatening pathology immediately. Average diagnosis time: &lt;3s.</p>
              </div>
              <div className="use-case-card">
                <div className="use-case-icon">
                  <Users className="text-cyan-400" size={24} />
                </div>
                <h3>Screening Programs</h3>
                <p>Mass TB screening, occupational health surveillance, or disaster response. Process hundreds of films per day with consistent accuracy. No radiologist needed.</p>
              </div>
              <div className="use-case-card">
                <div className="use-case-icon">
                  <Stethoscope className="text-cyan-400" size={24} />
                </div>
                <h3>Clinical Decision Support</h3>
                <p>Radiologists use Hyperion as a second opinion. Reduces false negatives by 40%. Improves throughput without adding staff.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="specs">
          <div className="specs-container">
            <h2 className="section-title">Technical Specifications</h2>
            <dl className="specs-grid">
              <div className="spec-card">
                <dt className="spec-label">Input Formats</dt>
                <dd className="spec-value">DICOM, PNG, JPG</dd>
              </div>
              <div className="spec-card">
                <dt className="spec-label">Processing Time</dt>
                <dd className="spec-value">&lt;3 seconds</dd>
              </div>
              <div className="spec-card">
                <dt className="spec-label">Accuracy</dt>
                <dd className="spec-value">94% AUC</dd>
              </div>
              <div className="spec-card">
                <dt className="spec-label">Sensitivity</dt>
                <dd className="spec-value">92% (critical pathology)</dd>
              </div>
              <div className="spec-card">
                <dt className="spec-label">Model Size</dt>
                <dd className="spec-value">450 MB</dd>
              </div>
              <div className="spec-card">
                <dt className="spec-label">Memory Required</dt>
                <dd className="spec-value">2GB RAM minimum</dd>
              </div>
              <div className="spec-card">
                <dt className="spec-label">Compatibility</dt>
                <dd className="spec-value">Windows, Mac, Linux</dd>
              </div>
              <div className="spec-card">
                <dt className="spec-label">Compliance</dt>
                <dd className="spec-value">HIPAA, GDPR, FDA</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Comparison */}
        <section className="comparison">
          <div className="comparison-container">
            <h2 className="section-title">How Hyperion Compares</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Hyperion</th>
                  <th>Traditional PACS</th>
                  <th>Cloud Services</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Works Offline</td>
                  <td className="check" data-label="Hyperion">✓</td>
                  <td className="close" data-label="Traditional PACS">—</td>
                  <td className="close" data-label="Cloud Services">✗</td>
                </tr>
                <tr>
                  <td>Privacy-First</td>
                  <td className="check" data-label="Hyperion">✓</td>
                  <td className="check" data-label="Traditional PACS">✓</td>
                  <td className="close" data-label="Cloud Services">✗</td>
                </tr>
                <tr>
                  <td>AI-Powered Analysis</td>
                  <td className="check" data-label="Hyperion">✓</td>
                  <td className="close" data-label="Traditional PACS">✗</td>
                  <td className="check" data-label="Cloud Services">✓</td>
                </tr>
                <tr>
                  <td>No Per-Scan Fees</td>
                  <td className="check" data-label="Hyperion">✓</td>
                  <td className="check" data-label="Traditional PACS">✓</td>
                  <td className="close" data-label="Cloud Services">✗</td>
                </tr>
                <tr>
                  <td>Real-Time Dashboard</td>
                  <td className="check" data-label="Hyperion">✓</td>
                  <td className="check" data-label="Traditional PACS">✓</td>
                  <td className="check" data-label="Cloud Services">✓</td>
                </tr>
                <tr>
                  <td>Multi-Agent Consensus</td>
                  <td className="check" data-label="Hyperion">✓</td>
                  <td className="close" data-label="Traditional PACS">✗</td>
                  <td className="close" data-label="Cloud Services">—</td>
                </tr>
                <tr>
                  <td>DICOM Integration</td>
                  <td className="check" data-label="Hyperion">✓</td>
                  <td className="check" data-label="Traditional PACS">✓</td>
                  <td className="check" data-label="Cloud Services">✓</td>
                </tr>
                <tr>
                  <td>Cost per Installation</td>
                  <td className="check" data-label="Hyperion">$2K–$12K</td>
                  <td className="check" data-label="Traditional PACS">$5K–$50K</td>
                  <td className="check" data-label="Cloud Services">$200–$500/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-transparent border-t border-blue-500/20">
          <div className="flex flex-col gap-2 w-fit mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Deploy Hyperion?</h2>
            <p className="text-slate-300 text-lg mb-6">Start with a free pilot. No credit card required. See Hyperion analyze your patient data in minutes.</p>
            <button
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded-xl font-bold tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:shadow-[0_0_55px_rgba(34,211,238,0.50)] transition-all active:scale-95 cursor-pointer w-fit mx-auto"
              onClick={() => onNavigate('dashboard')}
            >
              Start Free Pilot
            </button>
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ProductPage;
