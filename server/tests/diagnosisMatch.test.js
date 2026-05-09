'use strict'

const { calculateDiagnosisMatch, extractKeywords } = require('../src/utils/diagnosisMatch')

describe('extractKeywords', () => {
  test('returns lowercased medical keywords', () => {
    const kw = extractKeywords('Right upper lobe Pneumonia with Consolidation')
    expect(kw.has('pneumonia')).toBe(true)
    expect(kw.has('consolidation')).toBe(true)
  })

  test('ignores non-medical words', () => {
    const kw = extractKeywords('the cat sat on the mat')
    expect(kw.size).toBe(0)
  })

  test('returns empty set for empty/null input', () => {
    expect(extractKeywords('').size).toBe(0)
    expect(extractKeywords(null).size).toBe(0)
    expect(extractKeywords(undefined).size).toBe(0)
  })

  test('deduplicates repeated keywords', () => {
    const kw = extractKeywords('pneumonia, pneumonia, and more pneumonia')
    expect(kw.size).toBe(1)
    expect(kw.has('pneumonia')).toBe(true)
  })
})

describe('calculateDiagnosisMatch', () => {
  test('perfect overlap → 100%', () => {
    const r = calculateDiagnosisMatch(
      'pneumonia with consolidation',
      'Findings consistent with pneumonia and consolidation in the right upper lobe.',
    )
    expect(r.score).toBe(100)
    expect(r.matched.sort()).toEqual(['consolidation', 'pneumonia'])
    expect(r.missed).toEqual([])
    expect(r.extra).toEqual([])
  })

  test('partial overlap returns proportional score and lists missed/extra', () => {
    const r = calculateDiagnosisMatch(
      'pneumonia and effusion',
      'pneumonia with consolidation and atelectasis',
    )
    expect(r.matched).toEqual(['pneumonia'])
    expect(r.missed.sort()).toEqual(['atelectasis', 'consolidation'])
    expect(r.extra).toEqual(['effusion'])
    expect(r.score).toBe(33)
  })

  test('no overlap → 0%', () => {
    const r = calculateDiagnosisMatch('pneumothorax', 'cardiomegaly with hypertrophy')
    expect(r.score).toBe(0)
    expect(r.matched).toEqual([])
  })

  test('AI report with no medical keywords returns score 0 and lists resident words as extra', () => {
    const r = calculateDiagnosisMatch('pneumonia', 'an unremarkable image with no notable findings')
    expect(r.score).toBe(0)
    expect(r.total_ai_keywords).toBe(0)
    expect(r.extra).toEqual(['pneumonia'])
  })

  test('case-insensitive matching', () => {
    const r = calculateDiagnosisMatch('PNEUMONIA', 'pneumonia')
    expect(r.score).toBe(100)
  })

  test('counts are reported in the result', () => {
    const r = calculateDiagnosisMatch(
      'pneumonia, fracture',
      'pneumonia and embolism',
    )
    expect(r.total_ai_keywords).toBe(2)
    expect(r.total_resident_keywords).toBe(2)
  })
})
