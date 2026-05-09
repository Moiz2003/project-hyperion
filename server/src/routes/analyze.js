'use strict'

const { Router } = require('express')
const { analyzeLimiter } = require('../middleware/rateLimiter')
const { upload } = require('../middleware/upload')
const { validateAnalyzeScan, validateReveal } = require('../middleware/validate')
const { analyzeScan, revealAnalysis } = require('../controllers/analyzeController')
const { streamAnalysis } = require('../controllers/streamController')
const { batchAnalyze } = require('../controllers/batchController')

const router = Router()

router.post(
  '/',
  analyzeLimiter,
  upload.single('xray_image'),
  validateAnalyzeScan,
  analyzeScan,
)

// SSE streaming endpoint — emits per-agent events as the pipeline progresses
router.post(
  '/stream',
  analyzeLimiter,
  upload.single('xray_image'),
  validateAnalyzeScan,
  streamAnalysis,
)

// Batch endpoint — up to 5 images, parallel pipeline runs
router.post(
  '/batch',
  analyzeLimiter,
  upload.array('xray_images', 5),
  batchAnalyze,
)

// Reveal endpoint — Discovery Mode only. After the resident has submitted their
// assessment, this runs the full adversarial pipeline on the cached image and
// returns the verified report alongside a diagnosis match score.
router.post(
  '/reveal',
  analyzeLimiter,
  validateReveal,
  revealAnalysis,
)

module.exports = router
