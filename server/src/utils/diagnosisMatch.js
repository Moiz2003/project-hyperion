'use strict'

const KEYWORD_PATTERNS = [
  /\b(pneumonia|consolidation|infiltrate|opacity)\b/g,
  /\b(fracture|fissure|dislocation|subluxation)\b/g,
  /\b(tumor|mass|nodule|lesion|carcinoma|malignancy)\b/g,
  /\b(edema|swelling|effusion|fluid)\b/g,
  /\b(embolism|thrombosis|clot|occlusion)\b/g,
  /\b(hemorrhage|bleeding|hematoma)\b/g,
  /\b(infection|abscess|sepsis|inflammation)\b/g,
  /\b(atelectasis|collapse|pneumothorax)\b/g,
  /\b(cardiomegaly|hypertrophy|dilatation)\b/g,
  /\b(degenerative|osteophyte|stenosis|spondylosis)\b/g,
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
