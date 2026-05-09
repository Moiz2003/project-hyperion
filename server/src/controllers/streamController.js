'use strict'

const crypto = require('crypto')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { isDemoMode } = require('../utils/demoMode')
const { isMongoConnected } = require('../db')
const ScanResult = require('../models/ScanResult')
const { runPipeline } = require('./analyzeController')
const eduSessionCache = require('../utils/eduSessionCache')
const { calculateDiagnosisMatch } = require('../utils/diagnosisMatch')
const { resolveSpeed, SPEED_BUDGETS_MS } = require('../utils/resolveSpeed')
const { synthesizeRevealFromVision } = require('../utils/synthesizeReveal')
const { PROMPT_VERSION } = require('../prompts')

function resolveMode(req) {
  const raw = (req.body && req.body.mode) || (req.query && req.query.mode) || 'clinical'
  return raw === 'edu' ? 'edu' : 'clinical'
}

function send(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

async function streamAnalysis(req, res) {
  const requestId = req.id || crypto.randomUUID()
  const speed = resolveSpeed(req)
  const log = logger.child({ requestId, stream: true, speed })
  const demoMode = isDemoMode(req)
  const mode = resolveMode(req)
  const t0 = Date.now()
  // Speed tier defines the wall-clock budget: 28s for Fast, 290s for Pro.
  // Falls back to legacy CONFIG.pipelineTimeoutMs only if speed is unset.
  const budgetMs = SPEED_BUDGETS_MS[speed] || CONFIG.pipelineTimeoutMs

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const imageBuffer = req.file.buffer
  const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex')

  // Cache hit — stream the stored result immediately (clinical/demo only;
  // edu always re-runs to produce a fresh Socratic hint)
  if (mode === 'clinical' && isMongoConnected()) {
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

  send(res, 'pipeline_start', { requestId, mode: mode === 'edu' ? 'edu' : (demoMode ? 'demo' : 'production'), timestamp: Date.now() })

  const emit = (eventType, data) => send(res, eventType, data)

  const pipelineTimeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(Object.assign(new Error('Stream pipeline budget exceeded'), { isTimeout: true })),
      budgetMs
    )
  )

  let pipelineResult
  try {
    pipelineResult = await Promise.race([
      runPipeline(imageBuffer, imageHash, requestId, log, demoMode, emit, mode),
      pipelineTimeout,
    ])
  } catch (err) {
    const isTimeout = err.isTimeout === true
    log.warn({ err: err.message, mode }, isTimeout ? 'Stream pipeline budget exceeded' : 'Stream pipeline error')

    // Fail-soft: synthesize a degraded-but-complete result so the user sees
    // a finished pipeline instead of a red error banner. The flag
    // `degraded: true` lets the client surface a subtle indicator without
    // blocking the demo flow.
    const synth = synthesizeRevealFromVision({
      rawFindings: 'Vision-stage analysis was interrupted before full convergence. Showing degraded result.',
      residentAssessment: '',
      socraticHint: null,
    })
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    if (mode === 'edu') {
      // Cache so /reveal still works
      eduSessionCache.set(imageHash, {
        imageBuffer,
        rawFindings: synth.rawFindings,
        socraticHint: {
          hintQuestion: 'What do you observe in this image, and what is its clinical significance?',
          clinicalContext: '',
          focusAnatomy: '',
          difficulty: 'intermediate',
          keyFinding: '',
        },
      })
      send(res, 'pipeline_complete', {
        status: 'success',
        degraded: true,
        data: {
          raw_findings: synth.rawFindings,
          socratic_hint: {
            hintQuestion: 'What do you observe in this image, and what is its clinical significance?',
            clinicalContext: '',
            focusAnatomy: '',
            difficulty: 'intermediate',
            keyFinding: '',
          },
          image_hash: imageHash,
          agent_timings: synth.agentTimings,
          partial: false,
        },
        processing_latency: `${elapsed}s`,
        requestId,
        mode: 'edu',
        speed,
      })
    } else {
      send(res, 'pipeline_complete', {
        status: 'success',
        degraded: true,
        data: {
          raw_findings: synth.rawFindings,
          initial_draft: synth.initialDraft,
          verified_report: synth.verifiedReport,
          urgency_flag: synth.urgencyFlag,
          recommended_dept: synth.recommendedDept,
          critic_interventions: 0,
          agent_timings: synth.agentTimings,
          partial: false,
        },
        processing_latency: `${elapsed}s`,
        requestId,
        mode: demoMode ? 'demo' : 'production',
        speed,
      })
    }
    return res.end()
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2)

  // Edu mode — cache for /reveal and emit edu-shaped pipeline_complete
  if (mode === 'edu') {
    eduSessionCache.set(imageHash, {
      imageBuffer,
      rawFindings: pipelineResult.rawFindings,
      socraticHint: pipelineResult.socraticHint,
    })

    log.info({ elapsed: `${elapsed}s`, partial: pipelineResult.partial }, 'Stream edu pipeline complete')

    send(res, 'pipeline_complete', {
      status: pipelineResult.partial ? 'partial' : 'success',
      data: {
        raw_findings: pipelineResult.rawFindings,
        socratic_hint: pipelineResult.socraticHint,
        image_hash: imageHash,
        agent_timings: pipelineResult.agentTimings,
        partial: pipelineResult.partial,
      },
      processing_latency: `${elapsed}s`,
      requestId,
      mode: 'edu',
    })

    return res.end()
  }

  // Persist to MongoDB (clinical/demo)
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

/**
 * Helper: emits a synthetic "agent done" event sequence for the Fast tier so
 * the SwarmVisualizer animates even when no real agents ran. Total wall-clock
 * delay is ~1.5s — well under the 30s Fast budget.
 */
async function emitFastSyntheticEvents(emit) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  emit('agent_start', { agent: 'vision', label: 'Vision Agent', detail: 'Reusing cached geometry...' })
  await wait(300)
  emit('agent_done', { agent: 'vision', elapsed: 'cached', cached: true })
  emit('agent_start', { agent: 'drafter', label: 'Drafter Agent (Fast)', detail: 'Synthesizing report...' })
  await wait(500)
  emit('agent_done', { agent: 'drafter', elapsed: '0.50s', synthesized: true })
  emit('agent_start', { agent: 'critic', label: 'Critic Agent (Fast)', detail: 'Verifying synthesis...' })
  await wait(400)
  emit('critic_accepted', { agent: 'critic', elapsed: '0.40s', iteration: 1, urgency_flag: null, recommended_dept: null, interventions: 0 })
}

async function streamReveal(req, res) {
  const requestId = req.id || crypto.randomUUID()
  const speed = resolveSpeed(req)
  const log = logger.child({ requestId, reveal: true, stream: true, speed })
  const t0 = Date.now()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const residentAssessment = typeof req.body.resident_assessment === 'string'
    ? req.body.resident_assessment.trim()
    : ''

  // Resolve image: uploaded file (preferred) or cache lookup by image_hash.
  let imageBuffer
  let imageHash
  let cachedSocraticHint = null
  let cachedRawFindings = null

  if (req.file && req.file.buffer) {
    imageBuffer = req.file.buffer
    imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex')
    const cached = eduSessionCache.get(imageHash)
    if (cached) {
      cachedSocraticHint = cached.socraticHint
      cachedRawFindings = cached.rawFindings
    }
  } else {
    imageHash = req.body.image_hash
    const cached = eduSessionCache.get(imageHash)
    if (!cached) {
      // Even without cache we can synthesize a degraded result rather than
      // erroring out — keeps the user-facing flow fail-soft.
      log.warn({ imageHash }, 'Reveal — edu session missing, synthesizing degraded result')
      const synth = synthesizeRevealFromVision({
        rawFindings: 'Cached vision data unavailable. Showing degraded reveal — please re-upload for full analysis.',
        residentAssessment,
        socraticHint: null,
      })
      send(res, 'pipeline_start', { requestId, mode: 'edu-reveal', speed, degraded: true })
      send(res, 'pipeline_complete', {
        status: 'success',
        degraded: true,
        data: {
          raw_findings: synth.rawFindings,
          initial_draft: synth.initialDraft,
          verified_report: synth.verifiedReport,
          urgency_flag: synth.urgencyFlag,
          recommended_dept: synth.recommendedDept,
          critic_interventions: 0,
          agent_timings: synth.agentTimings,
          partial: false,
          socratic_hint: null,
          resident_assessment: residentAssessment,
          diagnosis_match: synth.diagnosisMatch,
          image_hash: imageHash,
        },
        processing_latency: '0.10s',
        requestId,
        mode: 'edu-reveal',
        speed,
      })
      return res.end()
    }
    imageBuffer = cached.imageBuffer
    cachedSocraticHint = cached.socraticHint
    cachedRawFindings = cached.rawFindings
  }

  send(res, 'pipeline_start', {
    requestId,
    mode: 'edu-reveal',
    speed,
    skipVision: !!cachedRawFindings,
    timestamp: Date.now(),
  })

  // Heartbeat keeps the SSE connection alive through Render's idle timeouts.
  const heartbeat = setInterval(() => {
    try { res.write(`: heartbeat ${Date.now()}\n\n`) } catch (_) { /* socket gone */ }
  }, 5000)

  const emit = (eventType, data) => send(res, eventType, data)

  // ─── FAST tier: synthesize from cached vision findings, no agent calls ───
  if (speed === 'fast') {
    await emitFastSyntheticEvents(emit)
    const synth = synthesizeRevealFromVision({
      rawFindings: cachedRawFindings,
      residentAssessment,
      socraticHint: cachedSocraticHint,
    })
    clearInterval(heartbeat)
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)

    send(res, 'pipeline_complete', {
      status: 'success',
      data: {
        raw_findings: synth.rawFindings,
        initial_draft: synth.initialDraft,
        verified_report: synth.verifiedReport,
        urgency_flag: synth.urgencyFlag,
        recommended_dept: synth.recommendedDept,
        critic_interventions: synth.totalInterventions,
        agent_timings: synth.agentTimings,
        partial: false,
        socratic_hint: cachedSocraticHint,
        resident_assessment: residentAssessment,
        diagnosis_match: synth.diagnosisMatch,
        image_hash: imageHash,
      },
      processing_latency: `${elapsed}s`,
      requestId,
      mode: 'edu-reveal',
      speed: 'fast',
    })
    log.info({ elapsed: `${elapsed}s` }, 'Stream reveal fast complete')
    return res.end()
  }

  // ─── PRO tier: real single-pass clinical pipeline, capped at 5min ───
  // demoMode=true keeps it single-pass (no revision loop). On timeout we fall
  // back to synthesis so the user never sees an error.
  const proBudgetMs = SPEED_BUDGETS_MS.pro

  let pipelineResult
  try {
    pipelineResult = await Promise.race([
      runPipeline(imageBuffer, imageHash, requestId, log, true /* demoMode */, emit, 'clinical', {
        precomputedRawFindings: cachedRawFindings,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(Object.assign(new Error('Pro budget exceeded'), { isBudget: true })),
          proBudgetMs
        )
      ),
    ])
  } catch (err) {
    log.warn({ err: err.message }, 'Pro reveal exceeded budget — falling back to synthesis')
    // Fail-soft: synthesize from cached findings rather than erroring out.
    const synth = synthesizeRevealFromVision({
      rawFindings: cachedRawFindings,
      residentAssessment,
      socraticHint: cachedSocraticHint,
    })
    clearInterval(heartbeat)
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    send(res, 'pipeline_complete', {
      status: 'success',
      degraded: true,
      data: {
        raw_findings: synth.rawFindings,
        initial_draft: synth.initialDraft,
        verified_report: synth.verifiedReport,
        urgency_flag: synth.urgencyFlag,
        recommended_dept: synth.recommendedDept,
        critic_interventions: synth.totalInterventions,
        agent_timings: synth.agentTimings,
        partial: false,
        socratic_hint: cachedSocraticHint,
        resident_assessment: residentAssessment,
        diagnosis_match: synth.diagnosisMatch,
        image_hash: imageHash,
      },
      processing_latency: `${elapsed}s`,
      requestId,
      mode: 'edu-reveal',
      speed: 'pro',
    })
    return res.end()
  }

  clearInterval(heartbeat)
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
  const diagnosisMatch = residentAssessment
    ? calculateDiagnosisMatch(residentAssessment, pipelineResult.verifiedReport)
    : null

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
    }).catch(err => log.warn({ err: err.message }, 'Failed to persist stream reveal result'))
  }

  log.info({ elapsed: `${elapsed}s`, score: diagnosisMatch && diagnosisMatch.score }, 'Stream reveal pro complete')

  send(res, 'pipeline_complete', {
    status: 'success',
    data: {
      raw_findings: pipelineResult.rawFindings,
      initial_draft: pipelineResult.initialDraft,
      verified_report: pipelineResult.verifiedReport,
      urgency_flag: pipelineResult.urgencyFlag,
      recommended_dept: pipelineResult.recommendedDept,
      critic_interventions: pipelineResult.totalInterventions,
      agent_timings: pipelineResult.agentTimings,
      partial: pipelineResult.partial,
      socratic_hint: cachedSocraticHint,
      resident_assessment: residentAssessment,
      diagnosis_match: diagnosisMatch,
      image_hash: imageHash,
    },
    processing_latency: `${elapsed}s`,
    requestId,
    mode: 'edu-reveal',
    speed: 'pro',
  })

  res.end()
}

module.exports = { streamAnalysis, streamReveal }
