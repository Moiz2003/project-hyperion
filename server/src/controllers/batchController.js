'use strict'

const crypto = require('crypto')
const { logger } = require('../utils/logger')
const { runPipeline } = require('./analyzeController')
const { CONFIG } = require('../config')
const { PROMPT_VERSION } = require('../prompts')
const { isMongoConnected } = require('../db')
const ScanResult = require('../models/ScanResult')

const BATCH_MAX = 5

async function batchAnalyze(req, res) {
  const requestId = req.id || crypto.randomUUID()
  const log = logger.child({ requestId, batch: true })
  const t0 = Date.now()
  const demoMode = req.query.demo !== 'false' && req.query.demo !== '0'

  const files = req.files
  if (!files || files.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No images uploaded' })
  }
  if (files.length > BATCH_MAX) {
    return res.status(400).json({ status: 'error', message: `Maximum ${BATCH_MAX} images per batch` })
  }

  log.info({ count: files.length, demoMode }, 'Batch pipeline starting')

  const ITEM_TIMEOUT = CONFIG.pipelineTimeoutMs

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

      const result = await Promise.race([
        runPipeline(file.buffer, imageHash, `${requestId}-${idx}`, itemLog, demoMode),
        new Promise((_, reject) =>
          setTimeout(() => reject(Object.assign(new Error('Item timeout'), { status: 504 })), ITEM_TIMEOUT)
        ),
      ])

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

  const results = settled.map((s, idx) => {
    if (s.status === 'fulfilled') return s.value
    return {
      index: idx,
      status: 'error',
      error: s.reason?.message || 'Unknown error',
      data: null,
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
