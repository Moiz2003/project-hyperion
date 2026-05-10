'use strict'

/**
 * Benchmark: Consensus Pipeline Quality
 *
 * Runs the Drafter → Critic → (revision loop) pipeline against two hard clinical
 * cases and scores the final report on section completeness, differential breadth,
 * and output length preservation (proxy for non-summarisation).
 *
 * Target endpoints (hybrid architecture — inference on remote AMD GPU cluster):
 *   Drafter : LOCAL_DRAFTER_URL (default http://129.212.183.176:8000/v1)
 *   Vision  : LOCAL_VISION_URL  (default http://129.212.183.176:8001/v1)
 *   Critic  : LOCAL_CRITIC_URL  (default http://129.212.183.176:8002/v1)
 *
 * Usage:
 *   node server/tests/benchmarkConsensusQuality.js
 *   node server/tests/benchmarkConsensusQuality.js --case 02
 *   node server/tests/benchmarkConsensusQuality.js --case 04
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const { runDrafterAgent } = require('../src/services/drafterAgent')
const { runCriticAgent, criticRejected } = require('../src/services/criticAgent')
const { CONFIG } = require('../src/config')

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const caseFilter = (() => {
  const idx = args.indexOf('--case')
  return idx !== -1 ? args[idx + 1] : null
})()

// ── Clinical fixtures ─────────────────────────────────────────────────────────

const CASES = {
  '02': {
    name: 'Case 02 — Complex Pneumonia (Bilateral, Atypical)',
    visionFindings: `
Modality & Anatomy: PA and lateral chest radiograph, adult patient ~55y.
Key Observations:
  - Bilateral lower lobe consolidations — right > left.
  - Right lower lobe shows dense lobar consolidation with air bronchograms extending to the right heart border (silhouette sign positive).
  - Left lower lobe shows patchy ground-glass opacity without air bronchograms.
  - Right-sided parapneumonic pleural effusion, moderate (blunting of right costophrenic angle, estimated 200–300 mL).
  - Bilateral hilar enlargement with peribronchial cuffing suggesting interstitial involvement.
  - No pneumothorax. Mediastinum midline.
  - Cardiac silhouette upper limits of normal (CTR 0.52).
Abnormalities / Pathology:
  - Right lower lobe lobar consolidation: community-acquired bacterial pneumonia most likely (Streptococcus pneumoniae).
  - Left lower lobe GGO pattern raises concern for atypical organism (Mycoplasma, Legionella, viral).
  - Pleural effusion right side — parapneumonic vs early empyema cannot be excluded without aspiration.
  - Bilateral hilar adenopathy — consider sarcoidosis or lymphoma as incidental finding if consolidations resolve.
Incidental Findings: Mild cardiomegaly. Degenerative changes lower thoracic spine.
Image Quality Notes: Adequate inspiration. Slight patient rotation. AP portable technique (magnification artefact expected).
Urgent Flag: Bilateral pneumonia with pleural effusion — HIGH urgency. ICU evaluation warranted.
    `.trim(),
    expectedSections: ['Summary of Findings', 'Differential Diagnosis', 'Recommended Workup', 'Red Flags', 'Patient-Facing Summary'],
    expectedDifferentials: ['pneumonia', 'atypical', 'mycoplasma', 'legionella', 'empyema'],
    minOutputChars: 1200,
  },

  '04': {
    name: 'Case 04 — Acute Cardiac (Suspected STEMI + Pulmonary Oedema)',
    visionFindings: `
Modality & Anatomy: AP portable chest radiograph, male ~68y, brought in by ambulance.
Key Observations:
  - Cardiomegaly: cardiothoracic ratio 0.62 (significantly elevated).
  - Bilateral perihilar "bat-wing" pulmonary oedema with Kerley B lines at both lung bases.
  - Bilateral pleural effusions, small-moderate (right > left).
  - Upper lobe vascular diversion (cephalisation) — upper zone vessels prominent compared to lower zones.
  - No focal lobar consolidation to suggest primary pneumonia.
  - Widened mediastinum upper contour — aortic knuckle prominent. Aortic calcification noted.
  - ECG leads visible on image — not interpretable from radiograph alone.
Abnormalities / Pathology:
  - Acute decompensated heart failure (ADHF) — cardiogenic pulmonary oedema. Pattern consistent with acute LV dysfunction.
  - Widened mediastinum raises concern for aortic pathology (dissection vs aneurysm) — CT angiography required urgently.
  - Bilateral effusions secondary to cardiac failure.
  - Aortic calcification suggests significant atherosclerotic burden.
Incidental Findings: Rib notching not clearly visible. Old healed rib fractures left 6th and 7th rib (likely prior trauma).
Image Quality Notes: Portable AP — lordotic projection. Patient supine, reduces sensitivity for effusion quantification.
Urgent Flag: CRITICAL. Acute LV failure with possible aortic pathology. Immediate cardiology and vascular surgery review.
    `.trim(),
    expectedSections: ['Summary of Findings', 'Differential Diagnosis', 'Recommended Workup', 'Red Flags', 'Patient-Facing Summary'],
    expectedDifferentials: ['heart failure', 'lv', 'aortic', 'dissection', 'cardiogenic'],
    minOutputChars: 1200,
  },
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreReport(report, { expectedSections, expectedDifferentials, minOutputChars }) {
  const text = report.toLowerCase()
  const scores = {}

  // Section completeness (0–1 per section)
  const sectionHits = expectedSections.filter(s => {
    const header = s.toLowerCase()
    return text.includes(`## ${header}`) || text.includes(`# ${header}`) ||
           text.includes(`(1)`) && header.includes('summary') ||
           text.includes(`(2)`) && header.includes('differential') ||
           text.includes(`(3)`) && header.includes('workup') ||
           text.includes(`(4)`) && header.includes('red') ||
           text.includes(`(5)`) && header.includes('patient')
  })

  // More lenient: also check for section keywords without headers
  const sectionKeywords = {
    'Summary of Findings': ['summary of findings', 'key findings', 'imaging findings', 'summary:'],
    'Differential Diagnosis': ['differential diagnosis', 'differential:', 'ddx', 'ranked by probability'],
    'Recommended Workup': ['recommended workup', 'workup:', 'investigations', 'recommended investigations'],
    'Red Flags': ['red flags', 'urgent actions', 'urgent:', 'immediate', 'critical:'],
    'Patient-Facing Summary': ['patient-facing', 'patient summary', 'for the patient', 'in plain language'],
  }

  const sectionScores = expectedSections.map(section => {
    const keywords = sectionKeywords[section] || [section.toLowerCase()]
    const found = keywords.some(kw => text.includes(kw))
    return found ? 1 : 0
  })
  scores.sectionCompleteness = sectionScores.reduce((a, b) => a + b, 0) / expectedSections.length

  // Differential breadth
  const diffHits = expectedDifferentials.filter(d => text.includes(d.toLowerCase()))
  scores.differentialBreadth = diffHits.length / expectedDifferentials.length

  // Output length preservation (penalise over-summarisation)
  scores.outputLength = Math.min(1.0, report.length / minOutputChars)

  // Composite
  scores.composite = (
    scores.sectionCompleteness * 0.4 +
    scores.differentialBreadth * 0.35 +
    scores.outputLength * 0.25
  )

  return scores
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function runCase(caseId, caseData) {
  const { name, visionFindings, expectedSections, expectedDifferentials, minOutputChars } = caseData
  const requestId = `bench-${caseId}-${Date.now()}`

  console.log('\n' + '═'.repeat(72))
  console.log(`  ${name}`)
  console.log('═'.repeat(72))
  console.log(`  Drafter  → ${CONFIG.drafterUrl}  [${CONFIG.drafterModel}]`)
  console.log(`  Critic   → ${CONFIG.criticUrl}  [${CONFIG.criticModel}]`)
  console.log('─'.repeat(72))

  const result = {
    caseId,
    name,
    iterations: 0,
    criticRejections: [],
    finalReport: '',
    scores: null,
    error: null,
  }

  try {
    // ── Iteration 1: Initial draft ───────────────────────────────────────────
    console.log('\n[1] Drafter → generating initial draft...')
    const t0 = Date.now()
    let draft = await runDrafterAgent(visionFindings, null, requestId)
    console.log(`    ✓ Draft generated in ${((Date.now() - t0) / 1000).toFixed(1)}s  (${draft.length} chars)`)
    console.log('\n    ── Draft preview (first 400 chars) ──')
    console.log('   ', draft.slice(0, 400).replace(/\n/g, '\n    '))

    // ── Consensus loop ───────────────────────────────────────────────────────
    let lastCriticResult = null
    const maxIter = CONFIG.maxConsensusIterations || 3

    for (let i = 1; i <= maxIter; i++) {
      result.iterations = i
      console.log(`\n[${i}] Critic → auditing draft (iteration ${i})...`)
      const tc = Date.now()
      lastCriticResult = await runCriticAgent(draft, visionFindings, requestId)
      const { rejected, interventionsMade, issuesFound, verifiedReport, urgencyFlag } = lastCriticResult

      console.log(`    ✓ Critic completed in ${((Date.now() - tc) / 1000).toFixed(1)}s`)
      console.log(`    rejected=${rejected}  interventions=${interventionsMade}  urgency=${urgencyFlag}`)

      if (rejected) {
        result.criticRejections.push({ iteration: i, interventionsMade, issuesFound })
        console.log('\n    ── Issues Found ──')
        console.log('   ', (issuesFound || '(empty)').slice(0, 600).replace(/\n/g, '\n    '))

        if (i < maxIter) {
          console.log(`\n[${i}+] Drafter → revising based on critic feedback...`)
          const tr = Date.now()
          draft = await runDrafterAgent(visionFindings, issuesFound, requestId)
          console.log(`    ✓ Revision generated in ${((Date.now() - tr) / 1000).toFixed(1)}s  (${draft.length} chars)`)
        } else {
          // Keep the last Drafter draft — the critic never accepted its own verifiedReport
          // (which is truncated), so the last full Drafter output is the best we have.
          console.log('\n    ⚠ Max iterations reached — keeping last Drafter draft.')
        }
      } else {
        console.log('\n    ✓ Critic accepted the report.')
        draft = verifiedReport || draft
        break
      }
    }

    result.finalReport = draft

    // ── Score the final report ───────────────────────────────────────────────
    result.scores = scoreReport(draft, { expectedSections, expectedDifferentials, minOutputChars })

  } catch (err) {
    result.error = err.message
    console.error('\n  ERROR:', err.message)
  }

  return result
}

// ── Summary printer ───────────────────────────────────────────────────────────

function printSummary(results) {
  console.log('\n' + '═'.repeat(72))
  console.log('  BENCHMARK SUMMARY')
  console.log('═'.repeat(72))

  for (const r of results) {
    console.log(`\n  ${r.name}`)
    console.log(`  ${'─'.repeat(68)}`)

    if (r.error) {
      console.log(`  ✗ FAILED: ${r.error}`)
      continue
    }

    const rejCount = r.criticRejections.length
    const totalInterventions = r.criticRejections.reduce((s, x) => s + x.interventionsMade, 0)
    const scores = r.scores

    console.log(`  Critic Rejections   : ${rejCount}  (total interventions: ${totalInterventions})`)
    console.log(`  Consensus Iterations: ${r.iterations}`)
    console.log(`  Final Report Length : ${r.finalReport.length} chars  (min target: ${CASES[r.caseId]?.minOutputChars})`)
    console.log(``)
    console.log(`  Quality Scores:`)
    console.log(`    Section Completeness : ${(scores.sectionCompleteness * 100).toFixed(0)}%`)
    console.log(`    Differential Breadth : ${(scores.differentialBreadth * 100).toFixed(0)}%`)
    console.log(`    Output Length Score  : ${(scores.outputLength * 100).toFixed(0)}%`)
    console.log(`    ── COMPOSITE SCORE ── : ${scores.composite.toFixed(2)}  (prev baseline: ~0.20)`)

    const verdict = rejCount > 0 ? '✓ Critic was ADVERSARIAL (rejected at least once)' : '✗ Critic was a YES-MAN (zero rejections)'
    console.log(`\n  ${verdict}`)
  }

  console.log('\n' + '═'.repeat(72))
  console.log('  Benchmark complete.')
  console.log('═'.repeat(72) + '\n')
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║  Project Hyperion — Consensus Quality Benchmark                     ║')
  console.log('║  Hybrid Architecture: local orchestration → remote AMD GPU cluster  ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝')

  const casesToRun = caseFilter
    ? { [caseFilter]: CASES[caseFilter] }
    : CASES

  if (caseFilter && !CASES[caseFilter]) {
    console.error(`\nUnknown case ID "${caseFilter}". Available: ${Object.keys(CASES).join(', ')}`)
    process.exit(1)
  }

  const results = []
  for (const [caseId, caseData] of Object.entries(casesToRun)) {
    const r = await runCase(caseId, caseData)
    r.caseId = caseId
    results.push(r)
  }

  printSummary(results)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
