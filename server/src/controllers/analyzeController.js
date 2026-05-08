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
      initialDraft: pipelineResult.initialDraft,
      verifiedReport: pipelineResult.verifiedReport,
      urgencyFlag: pipelineResult.urgencyFlag,
      recommendedDept: pipelineResult.recommendedDept,
      criticInterventions: pipelineResult.totalInterventions,
      partial: pipelineResult.partial,
      processingLatency: `${elapsed}s`,
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
}

async function runPipeline(imageBuffer, imageHash, requestId, log, demoMode, emit = () => {}) {
  const maxIterations = demoMode ? DEMO_MAX_ITERATIONS : PROD_MAX_ITERATIONS
  let partial = false
  const agentTimings = {}

  // Stage 1: Vision
  log.info('Stage 1: Vision agent')
  emit('agent_start', { agent: 'vision', label: 'Vision Agent', detail: 'Scanning image geometry...' })
  let rawFindings
  try {
    const t = Date.now()
    rawFindings = await runVisionAgent(imageBuffer, requestId)
    agentTimings.vision = `${((Date.now() - t) / 1000).toFixed(2)}s`
    if (!isViable(rawFindings)) throw new Error(`Vision returned degenerate output (${rawFindings?.length ?? 0} chars)`)
    emit('agent_done', { agent: 'vision', elapsed: agentTimings.vision, chars: rawFindings.length, preview: rawFindings.slice(0, 200) })
  } catch (err) {
    log.warn({ err: err.message }, 'Vision agent failed — using fallback')
    rawFindings = 'Vision analysis unavailable. Manual review required.'
    agentTimings.vision = 'failed'
    partial = true
    emit('agent_failed', { agent: 'vision', error: err.message })
  }

  // Stage 2: Initial draft
  log.info({ demoMode, maxIterations }, 'Stage 2: Adversarial consensus loop')
  emit('agent_start', { agent: 'drafter', label: 'Drafter Agent', detail: 'Composing preliminary clinical assessment...' })
  let draftReport
  let initialDraft
  try {
    const t = Date.now()
    draftReport = await runDrafterAgent(rawFindings, null, requestId)
    agentTimings.drafter = `${((Date.now() - t) / 1000).toFixed(2)}s`
    if (!isViable(draftReport)) throw new Error(`Drafter returned degenerate output (${draftReport?.length ?? 0} chars)`)
    initialDraft = draftReport
    emit('agent_done', { agent: 'drafter', elapsed: agentTimings.drafter, chars: draftReport.length })
  } catch (err) {
    log.warn({ err: err.message }, 'Drafter agent failed — retrying with simplified prompt')
    emit('agent_retry', { agent: 'drafter', detail: 'Retrying with simplified prompt...' })
    try {
      const t = Date.now()
      draftReport = await runDrafterAgent(rawFindings, null, requestId, { simplified: true })
      agentTimings.drafter = `${((Date.now() - t) / 1000).toFixed(2)}s (simplified)`
      if (!isViable(draftReport)) throw new Error(`Simplified drafter returned degenerate output (${draftReport?.length ?? 0} chars)`)
      log.info('Simplified drafter retry succeeded')
      initialDraft = draftReport
      emit('agent_done', { agent: 'drafter', elapsed: agentTimings.drafter, chars: draftReport.length, simplified: true })
    } catch (retryErr) {
      log.warn({ err: retryErr.message }, 'Simplified drafter retry failed — using text fallback')
      draftReport = `Preliminary findings from imaging: ${rawFindings}`
      initialDraft = draftReport
      agentTimings.drafter = 'failed'
      partial = true
      emit('agent_failed', { agent: 'drafter', error: retryErr.message })
    }
  }

  let verifiedReport = draftReport
  let urgencyFlag = 'Moderate'
  let recommendedDept = 'General Medicine'
  let totalInterventions = 0
  const criticTimings = []

  // Stage 3: Adversarial loop (skipped after first critic pass in demo mode)
  for (let i = 0; i < maxIterations; i++) {
    const iteration = i + 1
    emit('agent_start', {
      agent: 'critic',
      label: `Critic Agent (pass ${iteration})`,
      detail: iteration === 1 ? 'Verifying draft against raw findings...' : 'Re-evaluating revised report...',
      iteration,
    })

    let criticResult
    try {
      const t = Date.now()
      criticResult = await runCriticAgent(draftReport, rawFindings, requestId)
      const elapsed = `${((Date.now() - t) / 1000).toFixed(2)}s`
      criticTimings.push(elapsed)
      if (!isViable(criticResult.verifiedReport)) throw new Error('Critic returned degenerate report')

      urgencyFlag = criticResult.urgencyFlag
      recommendedDept = criticResult.recommendedDept

      if (!criticRejected(criticResult) || demoMode) {
        log.info({ iteration, demoMode }, 'Consensus accepted')
        verifiedReport = criticResult.verifiedReport
        emit('critic_accepted', { agent: 'critic', elapsed, iteration, urgency_flag: urgencyFlag, recommended_dept: recommendedDept, interventions: totalInterventions })
        break
      }

      totalInterventions += criticResult.interventionsMade
      log.info({ iteration, issues: criticResult.issuesFound }, 'Critic rejected — revising')
      emit('critic_rejected', { agent: 'critic', elapsed, iteration, issues: criticResult.issuesFound, interventions: totalInterventions })
    } catch (err) {
      log.warn({ err: err.message, iteration }, 'Critic agent failed — keeping current draft')
      partial = true
      emit('agent_failed', { agent: 'critic', error: err.message, iteration })
      break
    }

    if (i < maxIterations - 1) {
      emit('agent_start', { agent: 'drafter', label: 'Drafter Agent (revision)', detail: 'Incorporating critic feedback...', revision: true, iteration })
      try {
        const t = Date.now()
        const revised = await runDrafterAgent(rawFindings, criticResult.issuesFound, requestId)
        const elapsed = `${((Date.now() - t) / 1000).toFixed(2)}s`
        agentTimings.drafterRevision = elapsed
        if (!isViable(revised)) throw new Error(`Revision degenerate (${revised?.length ?? 0} chars)`)
        draftReport = revised
        verifiedReport = draftReport
        emit('agent_done', { agent: 'drafter', elapsed, chars: revised.length, revision: true, iteration })
      } catch (err) {
        log.warn({ err: err.message }, 'Drafter revision failed — keeping critic corrected report')
        verifiedReport = criticResult.verifiedReport
        partial = true
        emit('agent_failed', { agent: 'drafter', error: err.message, revision: true, iteration })
        break
      }
    } else {
      verifiedReport = criticResult.verifiedReport
      log.warn({ imageHash }, 'Max consensus iterations reached — using final critic output')
    }
  }

  if (criticTimings.length > 0) agentTimings.critic = criticTimings.join(', ')

  return { rawFindings, initialDraft, verifiedReport, urgencyFlag, recommendedDept, totalInterventions, partial, agentTimings }
}

module.exports = { analyzeScan, runPipeline }
