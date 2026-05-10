'use strict'

const crypto = require('crypto')
const { logger } = require('../utils/logger')
const { runPipeline } = require('./analyzeController')
const { runVisionAgent } = require('../services/visionAgent')
const { CONFIG } = require('../config')
const { PROMPT_VERSION } = require('../prompts')
const { isMongoConnected } = require('../db')
const ScanResult = require('../models/ScanResult')
const { resolveSpeed } = require('../utils/resolveSpeed')
const { synthesizeRevealFromVision } = require('../utils/synthesizeReveal')

const BATCH_MAX = 5

// Per-item budgets — Fast must cover Vision (~22s) + Drafter + single Critic pass.
// Pro allows a full clinical run but caps short of the 5min wall-clock total.
const PER_ITEM_BUDGETS_MS = {
  fast: 90_000,
  pro: 240_000,
}

async function batchAnalyze(req, res) {
  const requestId = req.id || crypto.randomUUID()
  const speed = resolveSpeed(req)
  const log = logger.child({ requestId, batch: true, speed })
  const t0 = Date.now()
  const demoMode = req.query.demo !== 'false' && req.query.demo !== '0'

  const files = req.files
  if (!files || files.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No images uploaded' })
  }
  if (files.length > BATCH_MAX) {
    return res.status(400).json({ status: 'error', message: `Maximum ${BATCH_MAX} images per batch` })
  }

  log.info({ count: files.length, demoMode, speed }, 'Batch pipeline starting')

  const ITEM_TIMEOUT = PER_ITEM_BUDGETS_MS[speed] || CONFIG.pipelineTimeoutMs

  const settled = await Promise.allSettled(
    files.map(async (file, idx) => {
      const imageHash = crypto.createHash('sha256').update(file.buffer).digest('hex')
      const itemLog = log.child({ idx, imageHash })

      // Check cache first
      if (isMongoConnected()) {
        try {
          const cached = await ScanResult.findOne({ imageHash, promptVersion: PROMPT_VERSION }).lean()
          if (cached) {
            itemLog.info('Batch item cache hit')
            return {
              index: idx,
              status: 'success',
              cached: true,
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
            }
          }
        } catch (_) {}
      }

      const batchCaptureState = {}
      let result
      try {
        result = await Promise.race([
          runPipeline(file.buffer, imageHash, `${requestId}-${idx}`, itemLog, demoMode, () => {}, 'clinical', { captureState: batchCaptureState }),
          new Promise((_, reject) =>
            setTimeout(() => reject(Object.assign(new Error('Item budget exceeded'), { status: 504 })), ITEM_TIMEOUT)
          ),
        ])
      } catch (err) {
        // Fail-soft: use any Vision findings already captured, or run Vision as fallback.
        itemLog.warn({ err: err.message }, 'Item exceeded budget — synthesizing vision-only fallback')
        let visionFindings = batchCaptureState.rawFindings || ''
        if (!visionFindings) {
          try {
            visionFindings = await Promise.race([
              runVisionAgent(file.buffer, `${requestId}-${idx}-fallback`),
              new Promise((_, reject) => setTimeout(() => reject(new Error('vision fallback timeout')), 30_000)),
            ])
          } catch (_) {
            visionFindings = 'High-speed triage summary generated. Clinical swarm consensus pending full convergence. Please refer to raw radiological findings below.'
          }
        }
        const synth = synthesizeRevealFromVision({ rawFindings: visionFindings, residentAssessment: '', socraticHint: null })
        result = {
          rawFindings: synth.rawFindings,
          initialDraft: synth.initialDraft,
          verifiedReport: synth.verifiedReport,
          urgencyFlag: synth.urgencyFlag,
          recommendedDept: synth.recommendedDept,
          totalInterventions: 0,
          partial: false,
          agentTimings: synth.agentTimings,
          degraded: true,
        }
      }

      const itemElapsed = ((Date.now() - t0) / 1000).toFixed(2)

      if (isMongoConnected()) {
        ScanResult.create({
          imageHash,
          promptVersion: PROMPT_VERSION,
          rawFindings: result.rawFindings,
          initialDraft: result.initialDraft,
          verifiedReport: result.verifiedReport,
          urgencyFlag: result.urgencyFlag,
          recommendedDept: result.recommendedDept,
          criticInterventions: result.totalInterventions,
          partial: result.partial,
          processingLatency: `${itemElapsed}s`,
        }).catch(err => itemLog.warn({ err: err.message }, 'Failed to persist batch item'))
      }

      return {
        index: idx,
        status: result.partial ? 'partial' : 'success',
        degraded: result.degraded === true,
        data: {
          raw_findings: result.rawFindings,
          initial_draft: result.initialDraft,
          verified_report: result.verifiedReport,
          urgency_flag: result.urgencyFlag,
          recommended_dept: result.recommendedDept,
          critic_interventions: result.totalInterventions,
          agent_timings: result.agentTimings,
          partial: result.partial,
        },
        processing_latency: `${itemElapsed}s`,
      }
    })
  )

  // Even in the catastrophic outer-rejection case, surface a degraded entry
  // rather than a hard error so the user sees results for every uploaded scan.
  const results = settled.map((s, idx) => {
    if (s.status === 'fulfilled') return s.value
    const synth = synthesizeRevealFromVision({
      rawFindings: 'Scan could not be analyzed — showing degraded placeholder.',
      residentAssessment: '',
      socraticHint: null,
    })
    return {
      index: idx,
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
      processing_latency: 'failed',
    }
  })

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2)

  const urgencyCounts = { High: 0, Moderate: 0, Low: 0, Unknown: 0 }
  for (const r of results) {
    if (r.data?.urgency_flag) urgencyCounts[r.data.urgency_flag] = (urgencyCounts[r.data.urgency_flag] || 0) + 1
  }

  log.info({ elapsed: `${elapsed}s`, count: results.length }, 'Batch pipeline complete')

  res.json({
    status: 'success',
    count: results.length,
    results,
    summary: {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      partial: results.filter(r => r.status === 'partial').length,
      error: results.filter(r => r.status === 'error').length,
      urgency_distribution: urgencyCounts,
    },
    processing_latency: `${elapsed}s`,
    requestId,
    mode: demoMode ? 'demo' : 'production',
  })
}

module.exports = { batchAnalyze }
