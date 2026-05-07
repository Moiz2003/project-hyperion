'use strict'

const { Router } = require('express')
const { liveness, readiness, detailed } = require('../controllers/healthController')

const router = Router()

router.get('/live', liveness)
router.get('/ready', readiness)
router.get('/detailed', detailed)

// Legacy /health alias
router.get('/', detailed)

module.exports = router
