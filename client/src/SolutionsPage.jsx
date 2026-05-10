import React, { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import {
  Hospital,
  Activity,
  ClipboardCheck,
  Building2,
  HardHat,
  Zap,
  FileJson,
  Database,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Smartphone,
  Cloud,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import './SolutionsPage.css';

import deploymentArch from './assets/deployment_architecture.png';
import dashboardPreview from './assets/hospital_dashboard.png';

const SolutionsPage = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hyperion-solutions-page bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 min-h-screen text-slate-50">
      <Header onNavigate={onNavigate} />

      <main>
        {/* Hero Section */}
        <section className="solutions-hero">
          <h1 className="text-white">Hyperion <span className="highlight">Solutions</span></h1>
          <p>Purpose-built for different healthcare settings. From rural clinics to national health networks, Hyperion adapts to your infrastructure, workflow, and budget.</p>
          <div className="hero-buttons">
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg font-semibold text-slate-950 hover:shadow-lg hover:shadow-cyan-400/30 transition-all cursor-pointer" onClick={() => onNavigate('contact')}>Explore Solutions</button>
            <button className="px-8 py-3 border-2 border-slate-700 rounded-lg font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer" onClick={() => onNavigate('contact')}>View Case Studies</button>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="solutions-section">
          {/* <div className="section-header mb-12">
            <h2 className="section-title text-white">Healthcare Solutions</h2>
            <p className="section-subtitle">Specialized clinical and operational modules for every healthcare environment.</p>
          </div> */}

          <div className="solutions-category">
            <h3 className="category-title"><Activity className="w-6 h-6 text-cyan-400" /> Clinical Settings</h3>
            <div className="solutions-grid">
              {/* Rural Hospitals */}
              <div className="solution-card">
                <div className="solution-icon-wrapper">
                  <Hospital className="solution-icon-svg" />
                </div>
                <h3 className="text-white">Rural Hospital Network</h3>
                <p>Bring expert radiologist-level diagnosis to underserved areas with limited connectivity and no specialist staff.</p>
                <ul className="solution-highlights">
                  <li>Offline-first deployment</li>
                  <li>Zero internet dependency</li>
                  <li>Fast ROI (6-12 months)</li>
                  <li>One-time license cost</li>
                </ul>
                <div className="solution-metrics">
                  <div className="metric">
                    <div className="metric-value">40%</div>
                    <div className="metric-label">Faster Diagnosis</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">0</div>
                    <div className="metric-label">Radiologists Needed</div>
                  </div>
                </div>
              </div>

              {/* Emergency Departments */}
              <div className="solution-card">
                <div className="solution-icon-wrapper">
                  <Activity className="solution-icon-svg" />
                </div>
                <h3 className="text-white">Emergency Departments</h3>
                <p>Critical cases analyzed in seconds. Real-time alerts for pneumothorax, cardiac tamponade, and other life-threatening pathology.</p>
                <ul className="solution-highlights">
                  <li>Sub-3 second analysis</li>
                  <li>Critical case flagging</li>
                  <li>Radiologist second-opinion</li>
                  <li>24/7 availability</li>
                </ul>
                <div className="solution-metrics">
                  <div className="metric">
                    <div className="metric-value">&lt;3s</div>
                    <div className="metric-label">Analysis Time</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">98%</div>
                    <div className="metric-label">Uptime SLA</div>
                  </div>
                </div>
              </div>

              {/* Hospital Networks */}
              <div className="solution-card">
                <div className="solution-icon-wrapper">
                  <Building2 className="solution-icon-svg" />
                </div>
                <h3 className="text-white">Hospital Networks</h3>
                <p>Enterprise deployment across multiple facilities. Centralized analytics, federated learning, and white-label options.</p>
                <ul className="solution-highlights">
                  <li>Multi-site management</li>
                  <li>Performance dashboards</li>
                  <li>Federated learning</li>
                  <li>White-label support</li>
                </ul>
                <div className="solution-metrics">
                  <div className="metric">
                    <div className="metric-value">50+</div>
                    <div className="metric-label">Sites Supported</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">∞</div>
                    <div className="metric-label">Unlimited Scans</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="solutions-category mt-16">
            <h3 className="category-title"><ClipboardCheck className="w-6 h-6 text-purple-400" /> Public Health & Enterprise</h3>
            <div className="solutions-grid">
              {/* TB Screening */}
              <div className="solution-card">
                <div className="solution-icon-wrapper">
                  <ClipboardCheck className="solution-icon-svg" />
                </div>
                <h3 className="text-white">TB Screening Programs</h3>
                <p>Mass screening campaigns with consistent accuracy. Process hundreds of films per day across multiple clinics.</p>
                <ul className="solution-highlights">
                  <li>Batch processing mode</li>
                  <li>Geographic distribution</li>
                  <li>Audit trails & compliance</li>
                  <li>Epidemiological insights</li>
                </ul>
                <div className="solution-metrics">
                  <div className="metric">
                    <div className="metric-value">500+</div>
                    <div className="metric-label">Scans/Day</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">92%</div>
                    <div className="metric-label">TB Detection Rate</div>
                  </div>
                </div>
              </div>

              {/* Occupational Health */}
              <div className="solution-card">
                <div className="solution-icon-wrapper">
                  <HardHat className="solution-icon-svg" />
                </div>
                <h3 className="text-white">Occupational Health</h3>
                <p>Annual screening for mining and construction. Consistent findings across all exams. Compliant reporting.</p>
                <ul className="solution-highlights">
                  <li>Baseline/interval tracking</li>
                  <li>Longitudinal analysis</li>
                  <li>Worker compliance reports</li>
                  <li>OSHA-ready audits</li>
                </ul>
                <div className="solution-metrics">
                  <div className="metric">
                    <div className="metric-value">100%</div>
                    <div className="metric-label">Reproducibility</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">0</div>
                    <div className="metric-label">Interpretation Bias</div>
                  </div>
                </div>
              </div>

              {/* Disaster Response */}
              <div className="solution-card">
                <div className="solution-icon-wrapper">
                  <Zap className="solution-icon-svg" />
                </div>
                <h3 className="text-white">Disaster & Field Response</h3>
                <p>Deploy Hyperion to tent hospitals and field clinics during crises with zero infrastructure needs.</p>
                <ul className="solution-highlights">
                  <li>Zero connectivity required</li>
                  <li>Portable deployment</li>
                  <li>Battery-powered operation</li>
                  <li>Rapid triage support</li>
                </ul>
                <div className="solution-metrics">
                  <div className="metric">
                    <div className="metric-value">Hours</div>
                    <div className="metric-label">Deploy Time</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">Yes</div>
                    <div className="metric-label">Mobile Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Section */}
        <section className="implementation">
          <div className="implementation-container">
            <h2 className="section-title text-white">Implementation & Deployment</h2>
            <div className="implementation-grid">
              <div className="implementation-content">
                <h3 className="text-white">How We Deploy</h3>
                <p>Hyperion deploys in days, not months. Our implementation team handles installation, training, and integration with your existing systems.</p>
                <ol className="implementation-steps">
                  <li>
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4 className="text-white">Assessment & Planning</h4>
                      <p>We evaluate your infrastructure, workflows, and compliance requirements to create a custom deployment roadmap.</p>
                    </div>
                  </li>
                  <li>
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4 className="text-white">Installation & Integration</h4>
                      <p>Install Hyperion on local servers or cloud. Integrate with DICOM, EHR, and existing PACS systems.</p>
                    </div>
                  </li>
                  <li>
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4 className="text-white">Training & Validation</h4>
                      <p>Train your staff on the platform. Validate accuracy on your own patient data before going live.</p>
                    </div>
                  </li>
                  <li>
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4 className="text-white">Launch & Optimization</h4>
                      <p>Go live with dedicated support. Continuous optimization based on your clinical workflows and feedback.</p>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="implementation-visual">
                <img
                  src={deploymentArch}
                  alt="Deployment Architecture Diagram"
                  className="w-full h-auto rounded-lg shadow-2xl border border-blue-500/20"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section className="roi-section">
          <div className="roi-container">
            <h2 className="section-title text-white">Return on Investment</h2>
            <div className="roi-grid">
              <div className="roi-card">
                <div className="roi-label">Time to Diagnosis</div>
                <div className="roi-value">40%↓</div>
                <div className="roi-desc">Faster analysis means faster treatment and better patient outcomes</div>
              </div>
              <div className="roi-card">
                <div className="roi-label">False Negatives</div>
                <div className="roi-value">40%↓</div>
                <div className="roi-desc">Multi-agent consensus catches subtle findings radiologists might miss</div>
              </div>
              <div className="roi-card">
                <div className="roi-label">Cost per Analysis</div>
                <div className="roi-value">80%↓</div>
                <div className="roi-desc">One-time license cost means unlimited scans with zero per-exam fees</div>
              </div>
              <div className="roi-card">
                <div className="roi-label">Radiologist Hours</div>
                <div className="roi-value">60%↓</div>
                <div className="roi-desc">Hyperion handles triage and basic analysis, freeing up specialist time</div>
              </div>
              <div className="roi-card">
                <div className="roi-label">Infrastructure Costs</div>
                <div className="roi-value">100%↓</div>
                <div className="roi-desc">Works offline—no cloud infrastructure, no connectivity required</div>
              </div>
              <div className="roi-card">
                <div className="roi-label">Payback Period</div>
                <div className="roi-value">6-12mo</div>
                <div className="roi-desc">For medium-volume hospitals processing 100+ scans/day</div>
              </div>
            </div>
            <div className="mt-12 text-center">
              <button
                className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all font-semibold flex items-center justify-center gap-2 text-slate-950 cursor-pointer w-fit mx-auto"
                onClick={() => onNavigate('contact')}
              >
                Calculate Your Facility's ROI
              </button>
            </div>
          </div>
        </section>

        {/* Case Study */}
        <section className="case-study">
          <div className="case-study-container">
            <h2 className="section-title text-white">Real-World Impact</h2>
            <div className="case-study-content">
              <div className="case-study-text">
                <div className="pull-quote">
                  <p>"Hyperion transformed our emergency triage. What used to take days now takes seconds, saving lives in our most critical hours."</p>
                  <cite>— Medical Director, District Hospital Bihar</cite>
                </div>

                <h3 className="text-white mt-8">District Hospital, Bihar India</h3>
                <p>A 300-bed district hospital serving 2 million people across rural Bihar had zero radiologists. X-ray films were sent to the capital (6+ hours away), causing 3-7 day delays in diagnosis.</p>

                <ul className="case-study-results">
                  <li>
                    <div className="result-icon-wrapper"><Zap className="w-5 h-5 text-yellow-400" /></div>
                    <div className="result-text">
                      <strong className="text-white">6-day delays → 3-second diagnosis</strong>
                      Emergency cases now triaged immediately. TB suspects confirmed same day.
                    </div>
                  </li>
                  <li>
                    <div className="result-icon-wrapper"><Activity className="w-5 h-5 text-cyan-400" /></div>
                    <div className="result-text">
                      <strong className="text-white">Zero to expert-level</strong>
                      No radiologists on staff, but diagnostic accuracy matches urban tertiary centers.
                    </div>
                  </li>
                  <li>
                    <div className="result-icon-wrapper"><BarChart3 className="w-5 h-5 text-green-400" /></div>
                    <div className="result-text">
                      <strong className="text-white">ROI in 8 months</strong>
                      Processing 300+ scans/month. Saved ₹24 lakhs in outside consultation fees alone.
                    </div>
                  </li>
                </ul>

                <div className="mt-8">
                  <button
                    className="text-cyan-400 font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors cursor-pointer"
                    onClick={() => onNavigate('contact')}
                  >
                    Read Full Case Study <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="case-study-visual">
                <img
                  src={dashboardPreview}
                  alt="Hospital Metrics Dashboard Preview"
                  className="w-full h-auto rounded-lg shadow-2xl border border-blue-500/20"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="integrations">
          <div className="integrations-container">
            <h2 className="section-title text-white">Integration Ecosystem</h2>
            <div className="integrations-grid">
              <div className="integration-card">
                <div className="integration-icon-wrapper"><FileJson className="w-8 h-8 text-cyan-400" /></div>
                <div className="integration-name text-white">DICOM</div>
                <div className="integration-desc">Native DICOM import/export with all imaging data</div>
              </div>
              <div className="integration-card">
                <div className="integration-icon-wrapper"><Database className="w-8 h-8 text-blue-400" /></div>
                <div className="integration-name text-white">PACS</div>
                <div className="integration-desc">Seamless integration with hospital imaging systems</div>
              </div>
              <div className="integration-card">
                <div className="integration-icon-wrapper"><ClipboardCheck className="w-8 h-8 text-purple-400" /></div>
                <div className="integration-name text-white">EHR/EMR</div>
                <div className="integration-desc">HL7 integration with patient records</div>
              </div>
              <div className="integration-card">
                <div className="integration-icon-wrapper"><Cloud className="w-8 h-8 text-indigo-400" /></div>
                <div className="integration-name text-white">Cloud</div>
                <div className="integration-desc">AWS, GCP, Azure—or fully offline</div>
              </div>
              <div className="integration-card">
                <div className="integration-icon-wrapper"><ShieldCheck className="w-8 h-8 text-green-400" /></div>
                <div className="integration-name text-white">Compliance</div>
                <div className="integration-desc">HIPAA, GDPR, FDA frameworks included</div>
              </div>
              <div className="integration-card">
                <div className="integration-icon-wrapper"><BarChart3 className="w-8 h-8 text-yellow-400" /></div>
                <div className="integration-name text-white">Analytics</div>
                <div className="integration-desc">Tableau, Power BI, custom dashboards</div>
              </div>
              <div className="integration-card">
                <div className="integration-icon-wrapper"><RefreshCw className="w-8 h-8 text-orange-400" /></div>
                <div className="integration-name text-white">API</div>
                <div className="integration-desc">RESTful API for custom integrations</div>
              </div>
              <div className="integration-card">
                <div className="integration-icon-wrapper"><Smartphone className="w-8 h-8 text-pink-400" /></div>
                <div className="integration-name text-white">Mobile</div>
                <div className="integration-desc">iOS, Android apps for remote review</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-transparent border-t border-blue-500/20">
          <div className="flex flex-col gap-2 w-fit mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Healthcare Delivery?</h2>
            <p className="text-slate-300 text-lg mb-6">Let's find the right solution for your facility. Schedule a personalized demo with our team to see Hyperion in action.</p>
            <button
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all font-semibold flex items-center justify-center gap-2 text-slate-950 cursor-pointer w-fit mx-auto"
              onClick={() => onNavigate('contact')}
            >
              Schedule Free Consultation
            </button>
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default SolutionsPage;
