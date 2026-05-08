'use strict'

const { Router } = require('express')
const { analyzeLimiter } = require('../middleware/rateLimiter')
const { upload } = require('../middleware/upload')
const { validateAnalyzeScan } = require('../middleware/validate')
const { analyzeScan } = require('../controllers/analyzeController')
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

module.exports = router
