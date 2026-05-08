// Frozen demo snapshot — used by the "Load Demo Scan" button as a GPU-free fallback.
// Shows a full production-mode adversarial run: vision → drafter → critic reject →
// revision → critic accept. All timings are representative of real MI300X throughput.

const DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#010b18"/>
  <rect x="40" y="40" width="720" height="520" rx="4" fill="#020c1a" stroke="#0d2236" stroke-width="1"/>
  <text x="400" y="30" text-anchor="middle" font-family="monospace" font-size="9" fill="#0f2d4a">HYPERION MEDICAL AI · DEMO INSTANCE · NOT FOR CLINICAL USE</text>
  <text x="58" y="62" font-family="monospace" font-size="8" fill="#1a3a5c">CHEST PA · UPRIGHT · DEMO</text>
  <text x="58" y="74" font-family="monospace" font-size="8" fill="#1a3a5c">DATE: 2026-05-08 · UNIT: AMD-MI300X</text>
  <text x="724" y="62" text-anchor="end" font-family="monospace" font-size="10" fill="#1e4a70">R</text>
  <text x="76" y="62" font-family="monospace" font-size="10" fill="#1e4a70">L</text>
  <rect x="60" y="80" width="680" height="460" rx="2" fill="#030f1f"/>
  <ellipse cx="400" cy="310" rx="200" ry="200" fill="none" stroke="#0e2840" stroke-width="1"/>
  <ellipse cx="290" cy="295" rx="105" ry="145" fill="#050e1e" stroke="#112c45" stroke-width="0.75"/>
  <ellipse cx="510" cy="295" rx="105" ry="145" fill="#050e1e" stroke="#112c45" stroke-width="0.75"/>
  <ellipse cx="400" cy="330" rx="55" ry="75" fill="#04111f" stroke="#0d2438" stroke-width="0.75"/>
  <line x1="240" y1="155" x2="560" y2="155" stroke="#091c30" stroke-width="0.5"/>
  <line x1="220" y1="195" x2="580" y2="195" stroke="#091c30" stroke-width="0.5"/>
  <line x1="210" y1="235" x2="590" y2="235" stroke="#091c30" stroke-width="0.5"/>
  <line x1="205" y1="275" x2="595" y2="275" stroke="#091c30" stroke-width="0.5"/>
  <line x1="205" y1="315" x2="595" y2="315" stroke="#091c30" stroke-width="0.5"/>
  <line x1="210" y1="355" x2="590" y2="355" stroke="#091c30" stroke-width="0.5"/>
  <line x1="220" y1="395" x2="580" y2="395" stroke="#091c30" stroke-width="0.5"/>
  <line x1="240" y1="430" x2="560" y2="430" stroke="#091c30" stroke-width="0.5"/>
  <ellipse cx="305" cy="210" rx="52" ry="38" fill="#0a1e33" stroke="#1a3d63" stroke-width="1"/>
  <text x="60" y="555" font-family="monospace" font-size="7" fill="#0f2236">WW: 1500  WL: -600  kVp: 120  mAs: 4</text>
  <text x="740" y="555" text-anchor="end" font-family="monospace" font-size="7" fill="#0f2236">DEMO · NOT FOR CLINICAL USE</text>
</svg>`

const DEMO_PREVIEW_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DEMO_SVG)}`

const RAW_FINDINGS = `Modality & Anatomy: Chest X-ray (PA view, upright), adult patient.

Key Observations: Bilateral lung fields partially visualized. Heart size upper limits of normal (cardiothoracic ratio ~0.52). Costophrenic angles sharp bilaterally. Trachea midline.

Abnormalities / Pathology: Right upper lobe consolidation with air bronchograms, measuring approximately 6 × 4 cm. Increased opacity in the right upper zone consistent with lobar consolidation. No pleural effusion identified. No pneumothorax.

Incidental Findings: Mild thoracic scoliosis convex to the right. Mild degenerative changes at the thoracic spine. No rib fractures identified.

Image Quality Notes: Adequate inspiratory effort (8 posterior ribs visible). Slight patient rotation to the left. Adequate penetration.

Urgent Flag: Right upper lobe consolidation requires urgent clinical correlation and initiation of antibiotic therapy.`

const INITIAL_DRAFT = `(1) Summary of Findings
PA chest radiograph demonstrates right upper lobe consolidation with air bronchograms measuring approximately 6 × 4 cm. Cardiothoracic ratio at upper limits of normal at 0.52. Costophrenic angles clear bilaterally. No pleural effusion or pneumothorax.

(2) Differential Diagnosis
1. Community-acquired pneumonia (most likely) — lobar consolidation with air bronchograms is classic for bacterial pneumonia, particularly Streptococcus pneumoniae.
2. Post-obstructive pneumonia — less likely without a visible mass lesion; CT recommended if no rapid improvement.
3. Pulmonary infarction — less likely given lack of pleural effusion and wedge-shaped opacity.

(3) Recommended Workup
- Blood cultures × 2 before antibiotic initiation
- Sputum Gram stain and culture
- CBC with differential, CRP, procalcitonin
- Follow-up CXR in 6–8 weeks to confirm resolution
- Consider CT chest if no improvement within 48–72 hours

(4) Red Flags / Urgent Actions
- Initiate antibiotics within 4 hours per IDSA/ATS CAP guidelines
- Assess PSI/PORT or CURB-65 score for inpatient vs outpatient disposition
- Monitor oxygen saturation; supplemental O₂ if SpO₂ < 94%

(5) Patient-Facing Summary
Your chest X-ray shows an infection in the upper right part of your lung. This is called pneumonia. You will need antibiotics. Your doctor will decide if you need to stay in hospital based on how you are feeling and your test results.`

const VERIFIED_REPORT = `(1) Summary of Findings
PA chest radiograph demonstrates right upper lobe lobar consolidation with air bronchograms measuring approximately 6 × 4 cm. Cardiothoracic ratio at upper limits of normal (0.52). Costophrenic angles sharp bilaterally. No pleural effusion or pneumothorax identified.

(2) Differential Diagnosis
1. Community-acquired pneumonia (most likely) — lobar consolidation with air bronchograms is the hallmark of bacterial pneumonia, particularly Streptococcus pneumoniae. Atypical pathogens (Mycoplasma pneumoniae, Legionella pneumophila) must also be considered given the lobar pattern.
2. Post-obstructive pneumonia — less likely without a visible endobronchial mass; CT chest warranted if no clinical improvement at 48–72 hours.
3. Pulmonary infarction — less likely: no pleural effusion, no wedge-shaped peripheral opacity, no clinical history of DVT/PE provided.

(3) Recommended Workup
- Blood cultures × 2 prior to first antibiotic dose
- Sputum Gram stain, culture, and sensitivity
- Legionella and pneumococcal urinary antigen testing
- CBC with differential, CRP, procalcitonin, BMP
- CURB-65 or PSI/PORT score to guide inpatient vs outpatient disposition
- Follow-up PA CXR in 6–8 weeks to document radiographic clearance
- CT chest with contrast if no improvement at 48–72 hours or if malignancy cannot be excluded

(4) Red Flags / Urgent Actions
- Initiate empirical antibiotic therapy within 4 hours of presentation per IDSA/ATS CAP guidelines
- Cover atypical organisms: beta-lactam + macrolide, or respiratory fluoroquinolone monotherapy
- Continuous SpO₂ monitoring; supplemental O₂ to maintain SpO₂ ≥ 94%
- Reassess clinically at 48–72 hours; failure to improve mandates CT and infectious disease review

(5) Patient-Facing Summary
Your chest X-ray shows a lung infection (pneumonia) in the upper right portion of your lung. You will need antibiotic treatment. Additional blood and urine tests will help identify the exact bacteria causing the infection. Your doctor will use a scoring system to decide whether you need hospital admission or can be treated safely at home.`

export const DEMO_SCAN = {
  file: { name: 'demo-chest-xray-pa.jpg', size: 1_843_200, type: 'image/jpeg' },
  previewUrl: DEMO_PREVIEW_URL,
  streamMode: 'production',

  result: {
    raw_findings: RAW_FINDINGS,
    initial_draft: INITIAL_DRAFT,
    verified_report: VERIFIED_REPORT,
    urgency_flag: 'High',
    recommended_dept: 'Pulmonology',
    critic_interventions: 1,
    processing_latency: '8.4s',
    partial: false,
    agent_timings: {
      vision: '2.14s',
      drafter: '3.82s',
      drafterRevision: '0.89s',
      critic: '1.18s, 0.91s',
    },
  },

  // SSE event replay — drives the SwarmVisualizer animation
  events: [
    { type: 'pipeline_start', mode: 'production', timestamp: Date.now() },
    { type: 'agent_start',  agent: 'vision',  label: 'Vision Agent',  detail: 'Scanning image geometry...' },
    { type: 'agent_done',   agent: 'vision',  elapsed: '2.14s', chars: RAW_FINDINGS.length, preview: RAW_FINDINGS.slice(0, 200) },
    { type: 'agent_start',  agent: 'drafter', label: 'Drafter Agent', detail: 'Composing preliminary clinical assessment...' },
    { type: 'agent_done',   agent: 'drafter', elapsed: '3.82s', chars: INITIAL_DRAFT.length },
    { type: 'agent_start',  agent: 'critic',  label: 'Critic Agent (pass 1)', detail: 'Verifying draft against raw findings...', iteration: 1 },
    { type: 'critic_rejected', agent: 'critic', elapsed: '1.18s', iteration: 1,
      issues: 'Missing atypical pathogen coverage (Mycoplasma, Legionella). Antibiotic regimen incomplete — beta-lactam monotherapy insufficient per IDSA/ATS guidelines.',
      interventions: 1 },
    { type: 'agent_start',  agent: 'drafter', label: 'Drafter Agent (revision)', detail: 'Incorporating critic feedback...', revision: true, iteration: 1 },
    { type: 'agent_done',   agent: 'drafter', elapsed: '0.89s', chars: VERIFIED_REPORT.length, revision: true, iteration: 1 },
    { type: 'agent_start',  agent: 'critic',  label: 'Critic Agent (pass 2)', detail: 'Re-evaluating revised report...', iteration: 2 },
    { type: 'critic_accepted', agent: 'critic', elapsed: '0.91s', iteration: 2,
      urgency_flag: 'High', recommended_dept: 'Pulmonology', interventions: 1 },
    { type: 'pipeline_complete', status: 'success',
      data: { urgency_flag: 'High', critic_interventions: 1 },
      processing_latency: '8.4s', mode: 'production' },
  ],
}
