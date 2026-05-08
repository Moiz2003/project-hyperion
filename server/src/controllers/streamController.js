'use strict'

const crypto = require('crypto')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { isMongoConnected } = require('../db')
const ScanResult = require('../models/ScanResult')
const { runPipeline } = require('./analyzeController')
const { PROMPT_VERSION } = require('../prompts')

function isDemoMode(req) {
  if (req.query.demo === 'true' || req.query.demo === '1') return true
  if (req.query.demo === 'false' || req.query.demo === '0') return false
  return CONFIG.demoMode === true
}

function send(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

async function streamAnalysis(req, res) {
  const requestId = req.id || crypto.randomUUID()
  const log = logger.child({ requestId, stream: true })
  const demoMode = isDemoMode(req)
  const t0 = Date.now()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const imageBuffer = req.file.buffer
  const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex')

  // Cache hit — stream the stored result immediately
  if (isMongoConnected()) {
    try {
      const cached = await ScanResult.findOne({ imageHash, promptVersion: PROMPT_VERSION }).lean()
      if (cached) {
        log.info({ imageHash }, 'Stream cache hit')
        send(res, 'pipeline_start', { requestId, mode: demoMode ? 'demo' : 'production', cached: true, timestamp: Date.now() })
        send(res, 'pipeline_complete', {
          status: 'success',
          data: {
            raw_findings: cached.rawFindings,
            initial_draft: cached.initialDraft || cached.verifiedReport,
            verified_report: cached.verifiedReport,
            urgency_flag: cached.urgencyFlag,
            recommended_dept: cached.recommendedDept,
            critic_interventions: cached.criticInterventions,
            agent_timings: null,
            partial: cached.partial || false,
          },
          processing_latency: '0.00s (cached)',
          requestId,
          mode: demoMode ? 'demo' : 'production',
        })
        return res.end()
      }
    } catch (err) {
      log.warn({ err: err.message }, 'Stream cache lookup failed — continuing without cache')
    }
  }

  send(res, 'pipeline_start', { requestId, mode: demoMode ? 'demo' : 'production', timestamp: Date.now() })

  const emit = (eventType, data) => send(res, eventType, data)

  const pipelineTimeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(Object.assign(new Error('Stream pipeline timeout'), { isTimeout: true })),
      CONFIG.pipelineTimeoutMs
    )
  )

  let pipelineResult
  try {
    pipelineResult = await Promise.race([
      runPipeline(imageBuffer, imageHash, requestId, log, demoMode, emit),
      pipelineTimeout,
    ])
  } catch (err) {
    const isTimeout = err.isTimeout === true
    log.warn({ err: err.message }, isTimeout ? 'Stream pipeline timeout' : 'Stream pipeline error')
    send(res, 'pipeline_error', {
      error: isTimeout
        ? 'Pipeline timed out. Switch to Demo Mode for faster results.'
        : err.message || 'Unexpected pipeline error',
      timeout: isTimeout,
    })
    return res.end()
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2)

  // Persist to MongoDB
  if (isMongoConnected()) {
    ScanResult.create({
      imageHash,
      promptVersion: PROMPT_VERSION,
      rawFindings: pipelineResult.rawFindings,
      initialDraft: pipelineResult.initialDraft,
      verifiedReport: pipelineResult.verifiedReport,
      urgencyFlag: pipelineResult.urgencyFlag,
      recommendedDept: pipelineResult.recommendedDept,
      criticInterventions: pipelineResult.totalInterventions,
      partial: pipelineResult.partial,
      processingLatency: `${elapsed}s`,
    }).catch(err => log.warn({ err: err.message }, 'Failed to persist stream result'))
  }

  log.info({ elapsed: `${elapsed}s`, interventions: pipelineResult.totalInterventions, partial: pipelineResult.partial }, 'Stream pipeline complete')

  send(res, 'pipeline_complete', {
    status: pipelineResult.partial ? 'partial' : 'success',
    data: {
      raw_findings: pipelineResult.rawFindings,
      initial_draft: pipelineResult.initialDraft,
      verified_report: pipelineResult.verifiedReport,
      urgency_flag: pipelineResult.urgencyFlag,
      recommended_dept: pipelineResult.recommendedDept,
      critic_interventions: pipelineResult.totalInterventions,
      agent_timings: pipelineResult.agentTimings,
      partial: pipelineResult.partial,
    },
    processing_latency: `${elapsed}s`,
    requestId,
    mode: demoMode ? 'demo' : 'production',
  })

  res.end()
}

module.exports = { streamAnalysis }
