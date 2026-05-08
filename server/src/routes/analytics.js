'use strict'

const { Router } = require('express')
const { scansLimiter } = require('../middleware/rateLimiter')
const { getAnalytics } = require('../controllers/analyticsController')

const router = Router()

router.get('/', scansLimiter, getAnalytics)

module.exports = router
