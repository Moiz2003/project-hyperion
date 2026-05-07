'use strict'

const { Router } = require('express')
const { analyzeLimiter } = require('../middleware/rateLimiter')
const { upload } = require('../middleware/upload')
const { validateAnalyzeScan } = require('../middleware/validate')
const { analyzeScan } = require('../controllers/analyzeController')

const router = Router()

router.post(
  '/',
  analyzeLimiter,
  upload.single('xray_image'),
  validateAnalyzeScan,
  analyzeScan,
)

module.exports = router
