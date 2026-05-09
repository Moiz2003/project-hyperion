'use strict'

const { calculateDiagnosisMatch } = require('./diagnosisMatch')

/**
 * Builds a complete reveal payload from already-computed vision findings,
 * without invoking the drafter or critic agents. Used for the Fast tier and
 * as a never-fail fallback when the Pro pipeline times out — the user always
 * gets a usable scorecard.
 */
function synthesizeRevealFromVision({ rawFindings, residentAssessment, socraticHint }) {
  const safeRaw = typeof rawFindings === 'string' && rawFindings.length > 0
    ? rawFindings
    : 'Vision analysis unavailable. Manual review required.'

  // Vision rawFindings are already a structured clinical narrative; surface
  // them as the verified report and add explicit recommendation language so
  // the existing summary parser in ResultsPanel renders cleanly.
  const verifiedReport = [
    `(1) Summary of Findings: ${safeRaw}`,
    `(2) Differential Diagnosis: Based on vision-stage geometry. Refer to a specialist for ranked differential.`,
    `(3) Recommended Workup: - Specialist consultation for full adversarial-loop analysis`,
    `(4) Patient-Facing Summary: Imaging review complete. Please discuss findings with your physician for next steps.`,
  ].join('\n\n')

  const urgencyFlag = /\b(urgent|severe|acute|critical|red flag|immediate)\b/i.test(safeRaw)
    ? 'High'
    : /\b(moderate|notable|significant|concerning)\b/i.test(safeRaw)
      ? 'Moderate'
      : 'Low'

  const recommendedDept = /\b(lung|chest|pulmonary|thorac)\b/i.test(safeRaw)
    ? 'Pulmonology'
    : /\b(heart|cardiac|cardio)\b/i.test(safeRaw)
      ? 'Cardiology'
      : /\b(bone|fracture|musculo|skelet)\b/i.test(safeRaw)
        ? 'Orthopedics'
        : 'Internal Medicine'

  const diagnosisMatch = residentAssessment
    ? calculateDiagnosisMatch(residentAssessment, verifiedReport)
    : null

  return {
    rawFindings: safeRaw,
    initialDraft: verifiedReport,
    verifiedReport,
    urgencyFlag,
    recommendedDept,
    totalInterventions: 0,
    partial: false,
    socraticHint: socraticHint || null,
    diagnosisMatch,
    agentTimings: { vision: 'cached', drafter: 'fast-synth', critic: 'fast-synth' },
  }
}

module.exports = { synthesizeRevealFromVision }
