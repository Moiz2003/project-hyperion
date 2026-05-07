'use strict'

const express = require('express')
const cors = require('cors')
const { randomUUID } = require('crypto')
const { logger } = require('./utils/logger')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const healthRoutes = require('./routes/health')
const scansRoutes = require('./routes/scans')
const analyzeRoutes = require('./routes/analyze')
const checkoutRoutes = require('./routes/checkout')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Attach request ID
app.use((req, _res, next) => {
  req.id = randomUUID()
  next()
})

// Request logging
app.use((req, _res, next) => {
  logger.info({ requestId: req.id, method: req.method, path: req.path }, 'Incoming request')
  next()
})

app.use('/health', healthRoutes)
app.use('/api/scans', scansRoutes)
app.use('/api/analyze-scan', analyzeRoutes)
app.use('/api', checkoutRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
