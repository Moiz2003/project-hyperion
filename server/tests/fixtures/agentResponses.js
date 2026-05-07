'use strict'

const VISION_RESPONSE = `Modality & Anatomy: Chest X-ray (PA view), adult patient.
Key Observations: Bilateral lung fields visible. Heart size within normal limits (cardiothoracic ratio ~0.48). Costophrenic angles sharp bilaterally.
Abnormalities / Pathology: Right upper lobe consolidation with air bronchograms, consistent with lobar pneumonia. No pleural effusion identified.
Incidental Findings: Mild scoliosis of the thoracic spine.
Image Quality Notes: Adequate inspiration. No rotation. Slight underpenetration in the left lower zone.
Urgent Flag: Right upper lobe consolidation requires urgent clinical correlation and antibiotic therapy.`

const DRAFTER_RESPONSE = `(1) Summary of Findings
PA chest radiograph demonstrates right upper lobe consolidation with air bronchograms. Cardiothoracic ratio normal at 0.48. Costophrenic angles clear.

(2) Differential Diagnosis
1. Community-acquired pneumonia (most likely) — lobar consolidation with air bronchograms classic for bacterial pneumonia, particularly Streptococcus pneumoniae.
2. Post-obstructive pneumonia — less likely without visible mass lesion; CT recommended if no rapid improvement.
3. Pulmonary infarction — less likely given lack of pleural effusion and wedge-shaped opacity.

(3) Recommended Workup
- Blood cultures x2 before antibiotic initiation
- Sputum Gram stain and culture
- CBC with differential, CRP, procalcitonin
- Follow-up CXR in 6-8 weeks to confirm resolution
- Consider CT chest if no improvement within 48-72 hours of antibiotics

(4) Red Flags / Urgent Actions
- Initiate antibiotics within 4 hours per IDSA/ATS CAP guidelines
- Assess PSI/PORT or CURB-65 score to determine inpatient vs outpatient management
- Monitor oxygen saturation; supplemental O2 if SpO2 < 94%

(5) Patient-Facing Summary
Your chest X-ray shows an infection in the right upper part of your lung. This is called pneumonia. You will need antibiotics. Your doctor will decide if you need to stay in hospital based on how you are feeling and your test results.`

const CRITIC_RESPONSE_CLEAN = `### Issues Found
None

### Verified Report
${DRAFTER_RESPONSE}

### Metadata
\`\`\`json
{
  "urgency_flag": "High",
  "recommended_dept": "Pulmonology",
  "interventions_made": 0,
  "rejected": false
}
\`\`\``

const CRITIC_RESPONSE_WITH_ISSUES = `### Issues Found
1. Missing CURB-65 scoring guidance in differential section.
2. No mention of atypical organisms (Mycoplasma, Legionella) in differential.

### Verified Report
${DRAFTER_RESPONSE}

Additional note: Consider atypical pathogen coverage (azithromycin or doxycycline) pending sputum culture results.

### Metadata
\`\`\`json
{
  "urgency_flag": "High",
  "recommended_dept": "Pulmonology",
  "interventions_made": 2,
  "rejected": true
}
\`\`\``

// Minimal 1x1 white JPEG (valid image bytes)
const MINIMAL_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
  'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
  'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
  'MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB' +
  'AQFAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Amk2rjcakWuFI5JJUkc6OkV' +
  'AAAAD/2Q==',
  'base64'
)

// OpenAI-compatible vLLM response shapes
function makeChatResponse(content) {
  return {
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
  }
}

function makeCompletionResponse(text) {
  return {
    id: 'cmpl-test',
    object: 'text_completion',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{ index: 0, text, finish_reason: 'stop' }],
    usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
  }
}

module.exports = {
  VISION_RESPONSE,
  DRAFTER_RESPONSE,
  CRITIC_RESPONSE_CLEAN,
  CRITIC_RESPONSE_WITH_ISSUES,
  MINIMAL_JPEG,
  makeChatResponse,
  makeCompletionResponse,
}
