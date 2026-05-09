'use strict'

/**
 * Resolves the speed tier for a request: 'fast' (Demo, <30s budget) or
 * 'pro' (Production, <5min budget). Defaults to 'pro' for back-compat with
 * older clients that don't send the param.
 *
 * Source priority: body.speed > query.speed > 'pro'.
 */
function resolveSpeed(req) {
  const raw = (req.body && req.body.speed) || (req.query && req.query.speed) || 'pro'
  return raw === 'fast' ? 'fast' : 'pro'
}

const SPEED_BUDGETS_MS = {
  fast: 28_000,   // hard wall-clock cap for fast tier
  pro: 290_000,   // hard wall-clock cap for pro tier (just under 5 min)
}

const PER_AGENT_TIMEOUTS_MS = {
  fast: { vision: 12_000, drafter: 10_000, critic: 8_000, socratic: 8_000 },
  pro:  { vision: 60_000, drafter: 90_000, critic: 90_000, socratic: 60_000 },
}

module.exports = { resolveSpeed, SPEED_BUDGETS_MS, PER_AGENT_TIMEOUTS_MS }
