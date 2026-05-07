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

async function analyzeScan(req, res, next) {
  const requestId = req.id || crypto.randomUUID()
  const log = logger.child({ requestId })
  const t0 = Date.now()

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
      runPipeline(imageBuffer, imageHash, requestId, log),
      new Promise((_, reject) =>
        setTimeout(() => reject(Object.assign(new Error('Pipeline timeout'), { status: 504 })),
          CONFIG.pipelineTimeoutMs)
      ),
    ])
  } catch (err) {
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

  log.info({ elapsed: `${elapsed}s`, interventions: pipelineResult.totalInterventions }, 'Pipeline complete')

  res.json({
    status: 'success',
    data: {
      raw_findings: pipelineResult.rawFindings,
      verified_report: pipelineResult.verifiedReport,
      urgency_flag: pipelineResult.urgencyFlag,
      recommended_dept: pipelineResult.recommendedDept,
      critic_interventions: pipelineResult.totalInterventions,
    },
    processing_latency: `${elapsed}s`,
    requestId,
  })
}

async function runPipeline(imageBuffer, imageHash, requestId, log) {
  // Stage 1: Vision
  log.info('Stage 1: Vision agent')
  const rawFindings = await runVisionAgent(imageBuffer, requestId)

  // Stage 2: Adversarial consensus loop
  log.info('Stage 2: Adversarial consensus loop')
  let draftReport = await runDrafterAgent(rawFindings, null, requestId)
  let verifiedReport = draftReport
  let urgencyFlag = 'Moderate'
  let recommendedDept = 'General Medicine'
  let totalInterventions = 0

  for (let i = 0; i < CONFIG.maxConsensusIterations; i++) {
    const criticResult = await runCriticAgent(draftReport, rawFindings, requestId)
    urgencyFlag = criticResult.urgencyFlag
    recommendedDept = criticResult.recommendedDept
    totalInterventions += criticResult.interventionsMade

    if (!criticRejected(criticResult)) {
      log.info({ iteration: i + 1 }, 'Consensus reached')
      verifiedReport = criticResult.verifiedReport
      break
    }

    log.info({ iteration: i + 1, issues: criticResult.issuesFound }, 'Critic rejected — revising')

    if (i < CONFIG.maxConsensusIterations - 1) {
      draftReport = await runDrafterAgent(rawFindings, criticResult.issuesFound, requestId)
      verifiedReport = draftReport
    } else {
      // Final iteration: take the critic's corrected report regardless
      verifiedReport = criticResult.verifiedReport
      log.warn({ imageHash }, 'Max consensus iterations reached — using final critic output')
    }
  }

  return { rawFindings, verifiedReport, urgencyFlag, recommendedDept, totalInterventions }
}

module.exports = { analyzeScan }
