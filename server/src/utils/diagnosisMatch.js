'use strict'

// Patterns end with `s?` so plural forms ("effusions", "nodules") still match.
// Patterns are ordered by category; intra-category synonyms collapse to the
// same conceptual hit when scored.
const KEYWORD_PATTERNS = [
  // Airspace / interstitial disease
  /\b(pneumonias?|consolidations?|infiltrates?|opacit(?:y|ies)|airspace|ground[- ]glass|interstitial|reticular|markings?)\b/g,
  // Trauma / bone
  /\b(fractures?|fissures?|dislocations?|subluxations?)\b/g,
  // Neoplasm
  /\b(tumou?rs?|masses?|nodules?|lesions?|carcinomas?|malignanc(?:y|ies)|neoplasms?)\b/g,
  // Fluid / edema
  /\b(edemas?|oedemas?|swellings?|effusions?|fluids?|congestion)\b/g,
  // Vascular
  /\b(embolisms?|thromboses|thrombosis|clots?|occlusions?|infarctions?|infarcts?)\b/g,
  // Hemorrhage
  /\b(hemorrhages?|haemorrhages?|bleeding|hematomas?|haematomas?)\b/g,
  // Infection / inflammation
  /\b(infections?|abscesses?|sepsis|inflammations?|empyemas?)\b/g,
  // Collapse / pleural
  /\b(atelectasis|collapse|pneumothorax|pneumothoraces|hemothorax|haemothorax)\b/g,
  // Cardiac
  /\b(cardiomegal(?:y|ies)|hypertroph(?:y|ies)|dilat(?:at|)ions?|enlarged|enlargement)\b/g,
  // Degenerative / spine
  /\b(degenerative|osteophytes?|stenoses|stenosis|spondyloses|spondylosis)\b/g,
  // COPD / hyperinflation / emphysema
  /\b(copd|emphysemas?|hyperinflations?|hyperinflated|bullae|bullous|flattened|hemidiaphragms?)\b/g,
  // Fibrosis / chronic
  /\b(fibrosis|fibrotic|scarring|granulomas?|calcifications?|calcified)\b/g,
]

function extractKeywords(text) {
  if (typeof text !== 'string' || text.length === 0) return new Set()
  const normalized = text.toLowerCase()
  const keywords = new Set()
  for (const pattern of KEYWORD_PATTERNS) {
    const matches = normalized.match(pattern)
    if (matches) matches.forEach(m => keywords.add(m))
  }
  return keywords
}

function calculateDiagnosisMatch(residentAssessment, verifiedReport) {
  const residentKeywords = extractKeywords(residentAssessment)
  const aiKeywords = extractKeywords(verifiedReport)

  if (aiKeywords.size === 0) {
    return {
      score: 0,
      matched: [],
      missed: [],
      extra: [...residentKeywords],
      total_ai_keywords: 0,
      total_resident_keywords: residentKeywords.size,
    }
  }

  const matched = [...residentKeywords].filter(k => aiKeywords.has(k))
  const missed = [...aiKeywords].filter(k => !residentKeywords.has(k))
  const extra = [...residentKeywords].filter(k => !aiKeywords.has(k))

  const score = Math.min(100, Math.round((matched.length / aiKeywords.size) * 100))

  return {
    score,
    matched,
    missed,
    extra,
    total_ai_keywords: aiKeywords.size,
    total_resident_keywords: residentKeywords.size,
  }
}

module.exports = { calculateDiagnosisMatch, extractKeywords }
