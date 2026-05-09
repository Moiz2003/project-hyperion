'use strict'

const DEFAULT_TTL_MS = 30 * 60 * 1000
const DEFAULT_SWEEP_MS = 60 * 1000

const store = new Map()
let ttlMs = DEFAULT_TTL_MS

function set(imageHash, data) {
  store.set(imageHash, {
    ...data,
    createdAt: Date.now(),
    residentAssessments: [],
  })
}

function get(imageHash) {
  const entry = store.get(imageHash)
  if (!entry) return null
  if (Date.now() - entry.createdAt > ttlMs) {
    store.delete(imageHash)
    return null
  }
  return entry
}

function addResidentAssessment(imageHash, assessment) {
  const entry = get(imageHash)
  if (!entry) return false
  entry.residentAssessments.push(assessment)
  return true
}

function getResidentAssessments(imageHash) {
  const entry = get(imageHash)
  return entry ? entry.residentAssessments.slice() : []
}

function size() {
  return store.size
}

function _clear() {
  store.clear()
}

function _setTtlForTests(ms) {
  ttlMs = ms
}

function _resetTtlForTests() {
  ttlMs = DEFAULT_TTL_MS
}

const sweepTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store) {
    if (now - val.createdAt > ttlMs) store.delete(key)
  }
}, DEFAULT_SWEEP_MS)
sweepTimer.unref()

module.exports = {
  set,
  get,
  addResidentAssessment,
  getResidentAssessments,
  size,
  _clear,
  _setTtlForTests,
  _resetTtlForTests,
}
