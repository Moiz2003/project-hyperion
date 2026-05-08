'use strict'

const { CONFIG } = require('../config')

/**
 * Determines if the current request should run in demo mode.
 * Priority: per-request query flag > global CONFIG.demoMode env var.
 *
 * Extracted to a shared utility to prevent desync between
 * streamController.js and analyzeController.js.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function isDemoMode(req) {
    if (req.query.demo === 'true' || req.query.demo === '1') return true
    if (req.query.demo === 'false' || req.query.demo === '0') return false
    return CONFIG.demoMode === true
}

module.exports = { isDemoMode }
