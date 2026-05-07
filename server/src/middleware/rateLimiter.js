'use strict'

const rateLimit = require('express-rate-limit')
const { CONFIG } = require('../config')

function makeHandler(res) {
  return (_req, reply) => {
    reply.status(429).json({
      status: 'error',
      message: 'Too many requests — please slow down.',
      retryAfter: Math.ceil(CONFIG.rateLimitWindowMs / 1000),
    })
  }
}

const analyzeLimiter = rateLimit({
  windowMs: CONFIG.rateLimitWindowMs,
  max: CONFIG.rateLimitMaxAnalyze,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler(),
})

const scansLimiter = rateLimit({
  windowMs: CONFIG.rateLimitWindowMs,
  max: CONFIG.rateLimitMaxScans,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler(),
})

module.exports = { analyzeLimiter, scansLimiter }
