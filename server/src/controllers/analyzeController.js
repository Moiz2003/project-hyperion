'use strict'

const crypto = require('crypto')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { isMongoConnected } = require('../db')
const ScanResult = require('../models/ScanResult')
const { runVisionAgent } = require('../services/visionAgent')
const { runDrafterAgent } = require('../services/drafterAgent')
const { runCriticAgent, criticRejected } = require('../services/criticAgent')
const { PROMPT_VERSION } = require('../prompts')

// Demo Mode: 1 iteration, no revision loop, <45s target
// Production Mode: up to CONFIG.maxConsensusIterations with full adversarial loop
const DEMO_MAX_ITERATIONS = 1
const PROD_MAX_ITERATIONS = 2  // hard cap below CONFIG default to avoid 504s

const MIN_VIABLE_CHARS = 10  // anything shorter is treated as a failed response

function isDemoMode(req) {
  // Priority: per-request flag > env var
  if (req.query.demo === 'true' || req.query.demo === '1') return true
  if (req.query.demo === 'false' || req.query.demo === '0') return false
  return CONFIG.demoMode === true
}

function isViable(text) {
  return typeof text === 'string' && text.trim().length >= MIN_VIABLE_CHARS
}

async function analyzeScan(req, res, next) {
  const requestId = req.id || crypto.randomUUID()
  const log = logger.child({ requestId })
  const t0 = Date.now()
  const demoMode = isDemoMode(req)

  log.info({ demoMode }, 'Pipeline starting')
  console.log(`[DEBUG] [Controller] mode=${demoMode ? 'DEMO' : 'PRODUCTION'} requestId=${requestId}`)

  const imageBuffer = req.file.buffer
  const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex')

  // Cache hit
  if (isMongoConnected()) {
    try {
      const cached = await ScanResult.findOne({ imageHash, promptVersion: PROMPT_VERSION }).lean()
      if (cached) {
        log.info({ imageHash }, 'Cache hit — returning stored result')
        return res.json({
          status: 'success',
          data: {
            raw_findings: cached.rawFindings,
            verified_report: cached.verifiedReport,
            urgency_flag: cached.urgencyFlag,
            recommended_dept: cached.recommendedDept,
            critic_interventions: cached.criticInterventions,
          },
          processing_latency: '0.00s (cached)',
          requestId,
          mode: demoMode ? 'demo' : 'production',
        })
      }
    } catch (err) {
      log.warn({ err: err.message }, 'Cache lookup failed — proceeding without cache')
    }
  }

  // Pipeline with timeout
  let pipelineResult
  try {
    pipelineResult = await Promise.race([
      runPipeline(imageBuffer, imageHash, requestId, log, demoMode),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(Object.assign(new Error('Pipeline timeout'), { status: 504 })),
          CONFIG.pipelineTimeoutMs
        )
      ),
    ])
  } catch (err) {
    // Graceful degression: timeout or unrecoverable error → partial analysis
    if (err.status === 504 || err.message === 'Pipeline timeout') {
      log.warn({ requestId }, 'Pipeline timeout — returning partial analysis')
      return res.status(206).json({
        status: 'partial',
        message: 'Analysis timed out. Partial results returned.',
        data: {
          raw_findings: 'Vision analysis incomplete due to timeout.',
          verified_report: 'The AI swarm did not complete within the allowed time. Please retry or switch to Demo Mode (?demo=true).',
          urgency_flag: 'Unknown',
          recommended_dept: 'General Medicine',
          critic_interventions: 0,
        },
        processing_latency: `${((Date.now() - t0) / 1000).toFixed(2)}s`,
        requestId,
        mode: demoMode ? 'demo' : 'production',
      })
    }
    return next(err)
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2)

  // Persist
  if (isMongoConnected()) {
    ScanResult.create({
      imageHash,
      promptVersion: PROMPT_VERSION,
      rawFindings: pipelineResult.rawFindings,
      verifiedReport: pipelineResult.verifiedReport,
      urgencyFlag: pipelineResult.urgencyFlag,
      recommendedDept: pipelineResult.recommendedDept,
      criticInterventions: pipelineResult.totalInterventions,
    }).catch(err => log.warn({ err: err.message }, 'Failed to persist scan result'))
  }

  log.info(
    { elapsed: `${elapsed}s`, interventions: pipelineResult.totalInterventions, demoMode, partial: pipelineResult.partial },
    'Pipeline complete'
  )

  const status = pipelineResult.partial ? 206 : 200
  res.status(status).json({
    status: pipelineResult.partial ? 'partial' : 'success',
    ...(pipelineResult.partial && { message: 'One or more agents returned a degraded response. Partial analysis shown.' }),
    data: {
      raw_findings: pipelineResult.rawFindings,
      verified_report: pipelineResult.verifiedReport,
      urgency_flag: pipelineResult.urgencyFlag,
      recommended_dept: pipelineResult.recommendedDept,
      critic_interventions: pipelineResult.totalInterventions,
    },
    processing_latency: `${elapsed}s`,
    requestId,
    mode: demoMode ? 'demo' : 'production',
  })
}

async function runPipeline(imageBuffer, imageHash, requestId, log, demoMode) {
  const maxIterations = demoMode ? DEMO_MAX_ITERATIONS : PROD_MAX_ITERATIONS
  let partial = false

  // Stage 1: Vision
  console.log('[DEBUG] [VisionAgent] starting inference...')
  log.info('Stage 1: Vision agent')
  let rawFindings
  try {
    rawFindings = await runVisionAgent(imageBuffer, requestId)
    if (!isViable(rawFindings)) throw new Error(`Vision returned degenerate output (${rawFindings?.length ?? 0} chars)`)
  } catch (err) {
    log.warn({ err: err.message }, 'Vision agent failed — using fallback')
    rawFindings = 'Vision analysis unavailable. Manual review required.'
    partial = true
  }

  // Stage 2: Initial draft
  log.info({ demoMode, maxIterations }, 'Stage 2: Adversarial consensus loop')
  let draftReport
  try {
    draftReport = await runDrafterAgent(rawFindings, null, requestId)
    if (!isViable(draftReport)) throw new Error(`Drafter returned degenerate output (${draftReport?.length ?? 0} chars)`)
  } catch (err) {
    log.warn({ err: err.message }, 'Drafter agent failed — retrying with simplified prompt')
    try {
      draftReport = await runDrafterAgent(rawFindings, null, requestId, { simplified: true })
      if (!isViable(draftReport)) throw new Error(`Simplified drafter returned degenerate output (${draftReport?.length ?? 0} chars)`)
      log.info('Simplified drafter retry succeeded')
    } catch (retryErr) {
      log.warn({ err: retryErr.message }, 'Simplified drafter retry failed — using text fallback')
      draftReport = `Preliminary findings from imaging: ${rawFindings}`
      partial = true
    }
  }

  let verifiedReport = draftReport
  let urgencyFlag = 'Moderate'
  let recommendedDept = 'General Medicine'
  let totalInterventions = 0

  // Stage 3: Adversarial loop (skipped after first critic pass in demo mode)
  for (let i = 0; i < maxIterations; i++) {
    let criticResult
    try {
      criticResult = await runCriticAgent(draftReport, rawFindings, requestId)
      if (!isViable(criticResult.verifiedReport)) throw new Error('Critic returned degenerate report')
    } catch (err) {
      log.warn({ err: err.message, iteration: i + 1 }, 'Critic agent failed — keeping current draft')
      partial = true
      break
    }

    urgencyFlag = criticResult.urgencyFlag
    recommendedDept = criticResult.recommendedDept
    totalInterventions += criticResult.interventionsMade

    if (!criticRejected(criticResult) || demoMode) {
      // Demo mode: always accept after first critic pass, no revision
      log.info({ iteration: i + 1, demoMode }, 'Consensus accepted')
      verifiedReport = criticResult.verifiedReport
      break
    }

    log.info({ iteration: i + 1, issues: criticResult.issuesFound }, 'Critic rejected — revising')

    if (i < maxIterations - 1) {
      try {
        const revised = await runDrafterAgent(rawFindings, criticResult.issuesFound, requestId)
        if (!isViable(revised)) throw new Error(`Revision degenerate (${revised?.length ?? 0} chars)`)
        draftReport = revised
        verifiedReport = draftReport
      } catch (err) {
        log.warn({ err: err.message }, 'Drafter revision failed — keeping critic corrected report')
        verifiedReport = criticResult.verifiedReport
        partial = true
        break
      }
    } else {
      verifiedReport = criticResult.verifiedReport
      log.warn({ imageHash }, 'Max consensus iterations reached — using final critic output')
    }
  }

  return { rawFindings, verifiedReport, urgencyFlag, recommendedDept, totalInterventions, partial }
}

module.exports = { analyzeScan }
