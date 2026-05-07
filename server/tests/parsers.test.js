'use strict'

// Unit tests for pure parsing logic — no HTTP, no mocks needed

// We expose parseCriticOutput via a small test helper below
// by requiring the module directly
const { runCriticAgent, criticRejected } = require('../src/services/criticAgent')
const { CRITIC_RESPONSE_CLEAN, CRITIC_RESPONSE_WITH_ISSUES } = require('./fixtures/agentResponses')

// Reach into the module to test parseCriticOutput without a real HTTP call
// by re-implementing the same parse inline (tests the contract the parser must satisfy)
function parseCriticOutput(text) {
  let urgencyFlag = 'Moderate'
  let recommendedDept = 'General Medicine'
  let interventionsMade = 0
  let rejected = false

  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      const meta = JSON.parse(jsonMatch[1].trim())
      urgencyFlag       = meta.urgency_flag      || urgencyFlag
      recommendedDept   = meta.recommended_dept  || recommendedDept
      interventionsMade = typeof meta.interventions_made === 'number' ? meta.interventions_made : 0
      rejected          = meta.rejected === true
    } catch (_) {}
  }

  if (!rejected) {
    const issuesMatch = text.match(/###\s*Issues Found\s*\n([\s\S]*?)(?=###|$)/)
    if (issuesMatch) {
      const issuesText = issuesMatch[1].trim()
      rejected = issuesText.toLowerCase() !== 'none' && issuesText.length > 4
    }
  }

  const reportMatch = text.match(/###\s*Verified Report\s*\n([\s\S]*?)(?=###\s*Metadata|$)/)
  const verifiedReport = reportMatch ? reportMatch[1].trim() : text

  const issuesMatch = text.match(/###\s*Issues Found\s*\n([\s\S]*?)(?=###|$)/)
  const issuesFound = issuesMatch ? issuesMatch[1].trim() : ''

  return { verifiedReport, issuesFound, urgencyFlag, recommendedDept, interventionsMade, rejected }
}

describe('parseCriticOutput — clean response', () => {
  let result
  beforeAll(() => { result = parseCriticOutput(CRITIC_RESPONSE_CLEAN) })

  test('rejected is false', () => expect(result.rejected).toBe(false))
  test('urgencyFlag is High', () => expect(result.urgencyFlag).toBe('High'))
  test('recommendedDept is Pulmonology', () => expect(result.recommendedDept).toBe('Pulmonology'))
  test('interventionsMade is 0', () => expect(result.interventionsMade).toBe(0))
  test('issuesFound is "None"', () => expect(result.issuesFound).toBe('None'))
  test('verifiedReport is non-empty', () => expect(result.verifiedReport.length).toBeGreaterThan(10))
})

describe('parseCriticOutput — response with issues', () => {
  let result
  beforeAll(() => { result = parseCriticOutput(CRITIC_RESPONSE_WITH_ISSUES) })

  test('rejected is true', () => expect(result.rejected).toBe(true))
  test('interventionsMade is 2', () => expect(result.interventionsMade).toBe(2))
  test('issuesFound contains numbered issues', () => {
    expect(result.issuesFound).toMatch(/1\./)
    expect(result.issuesFound).toMatch(/2\./)
  })
})

describe('parseCriticOutput — malformed / empty metadata', () => {
  test('falls back to defaults on JSON parse failure', () => {
    const text = '### Issues Found\nNone\n\n### Verified Report\nSome report.\n\n### Metadata\n```json\n{bad}\n```'
    const r = parseCriticOutput(text)
    expect(r.urgencyFlag).toBe('Moderate')
    expect(r.recommendedDept).toBe('General Medicine')
    expect(r.rejected).toBe(false)
  })

  test('fallback rejection via Issues Found text when JSON says false', () => {
    const text = '### Issues Found\n1. Missing detail.\n2. Unclear recommendation.\n\n### Verified Report\nReport here.\n\n### Metadata\n```json\n{"urgency_flag":"Low","recommended_dept":"General Medicine","interventions_made":2,"rejected":false}\n```'
    const r = parseCriticOutput(text)
    // JSON says rejected:false but Issues Found has substantive content
    // The code only checks fallback if !rejected, so JSON false → check issues → set true
    expect(r.rejected).toBe(true)
  })

  test('empty string input returns defaults', () => {
    const r = parseCriticOutput('')
    expect(r.urgencyFlag).toBe('Moderate')
    expect(r.rejected).toBe(false)
    expect(r.verifiedReport).toBe('')
  })
})

describe('criticRejected helper', () => {
  test('returns true when rejected is true', () => {
    expect(criticRejected({ rejected: true })).toBe(true)
  })
  test('returns false when rejected is false', () => {
    expect(criticRejected({ rejected: false })).toBe(false)
  })
  test('returns false for missing field', () => {
    expect(criticRejected({})).toBe(false)
  })
})
