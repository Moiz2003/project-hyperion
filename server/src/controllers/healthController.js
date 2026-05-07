'use strict'

const { CONFIG } = require('../config')
const { isMongoConnected } = require('../db')

let detailedCache = null
let detailedCacheAt = 0
const DETAILED_CACHE_TTL = 10_000

function liveness(_req, res) {
  res.json({ status: 'ok' })
}

function readiness(_req, res) {
  const mongoOk = !CONFIG.mongoUri || isMongoConnected()
  const code = mongoOk ? 200 : 503
  res.status(code).json({ status: mongoOk ? 'ready' : 'not_ready', mongo: mongoOk ? 'connected' : 'disconnected' })
}

async function detailed(_req, res) {
  const now = Date.now()
  if (detailedCache && now - detailedCacheAt < DETAILED_CACHE_TTL) {
    return res.json(detailedCache)
  }

  const agents = {
    drafter: { url: CONFIG.drafterUrl, model: CONFIG.drafterModel },
    vision: { url: CONFIG.visionUrl, model: CONFIG.visionModel },
    critic: { url: CONFIG.criticUrl, model: CONFIG.criticModel },
  }

  const agentStatus = {}
  await Promise.all(
    Object.entries(agents).map(async ([name, { url }]) => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 3000)
        const resp = await fetch(`${url}/models`, { signal: controller.signal })
        clearTimeout(timer)
        agentStatus[name] = resp.ok ? 'up' : `http_${resp.status}`
      } catch {
        agentStatus[name] = 'unreachable'
      }
    })
  )

  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongo: isMongoConnected() ? 'connected' : 'disconnected',
    agents: agentStatus,
    config: {
      maxConsensusIterations: CONFIG.maxConsensusIterations,
      maxFileSizeMB: CONFIG.maxFileSizeMB,
    },
  }

  detailedCache = payload
  detailedCacheAt = now
  res.json(payload)
}

module.exports = { liveness, readiness, detailed }
