'use strict'

const { Router } = require('express')
const { scansLimiter } = require('../middleware/rateLimiter')
const { listScans } = require('../controllers/scansController')

const router = Router()

router.get('/', scansLimiter, listScans)

module.exports = router
