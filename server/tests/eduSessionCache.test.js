'use strict'

const cache = require('../src/utils/eduSessionCache')

describe('eduSessionCache', () => {
  beforeEach(() => {
    cache._clear()
    cache._resetTtlForTests()
  })

  test('set/get round-trip preserves data', () => {
    cache.set('hash-1', { socraticHint: 'What do you notice?', imageBuffer: Buffer.from('xx') })
    const entry = cache.get('hash-1')
    expect(entry).not.toBeNull()
    expect(entry.socraticHint).toBe('What do you notice?')
    expect(Buffer.isBuffer(entry.imageBuffer)).toBe(true)
    expect(entry.createdAt).toEqual(expect.any(Number))
    expect(entry.residentAssessments).toEqual([])
  })

  test('get returns null for unknown key', () => {
    expect(cache.get('does-not-exist')).toBeNull()
  })

  test('expired entries are evicted on read', () => {
    cache._setTtlForTests(10)
    cache.set('hash-2', { socraticHint: 'x' })
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(cache.get('hash-2')).toBeNull()
        expect(cache.size()).toBe(0)
        resolve()
      }, 20)
    })
  })

  test('addResidentAssessment appends to the entry', () => {
    cache.set('hash-3', { socraticHint: 'q' })
    const ok1 = cache.addResidentAssessment('hash-3', { residentName: 'Dr. A', assessment: 'pneumonia' })
    const ok2 = cache.addResidentAssessment('hash-3', { residentName: 'Dr. B', assessment: 'effusion' })
    expect(ok1).toBe(true)
    expect(ok2).toBe(true)
    const list = cache.getResidentAssessments('hash-3')
    expect(list).toHaveLength(2)
    expect(list[0].residentName).toBe('Dr. A')
    expect(list[1].assessment).toBe('effusion')
  })

  test('addResidentAssessment returns false when session is missing', () => {
    const ok = cache.addResidentAssessment('missing', { residentName: 'X', assessment: 'y' })
    expect(ok).toBe(false)
  })

  test('getResidentAssessments returns empty array for missing session', () => {
    expect(cache.getResidentAssessments('nope')).toEqual([])
  })

  test('getResidentAssessments returns a copy, not a live reference', () => {
    cache.set('hash-4', {})
    cache.addResidentAssessment('hash-4', { residentName: 'A', assessment: 'a' })
    const snapshot = cache.getResidentAssessments('hash-4')
    snapshot.push({ residentName: 'X', assessment: 'tampered' })
    expect(cache.getResidentAssessments('hash-4')).toHaveLength(1)
  })
})
