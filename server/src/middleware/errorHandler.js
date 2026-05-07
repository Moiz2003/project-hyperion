'use strict'

const { logger } = require('../utils/logger')

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  const requestId = req.id || 'unknown'

  logger.error({ requestId, status, err: err.message, stack: err.stack }, 'Unhandled error')

  if (res.headersSent) return next(err)

  res.status(status).json({
    status: 'error',
    message: status < 500 ? err.message : 'Internal server error',
    requestId,
  })
}

function notFound(req, res) {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} not found` })
}

module.exports = { errorHandler, notFound }
