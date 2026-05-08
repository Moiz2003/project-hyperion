'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { randomUUID } = require('crypto')
const { logger } = require('./utils/logger')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const healthRoutes = require('./routes/health')
const scansRoutes = require('./routes/scans')
const analyzeRoutes = require('./routes/analyze')
const checkoutRoutes = require('./routes/checkout')
const analyticsRoutes = require('./routes/analytics')

const app = express()

// Security headers — must be before CORS
app.use(helmet())

// CORS: restrict origin in production via CORS_ORIGIN env var
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

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
app.use('/api/analytics', analyticsRoutes)
app.use('/api', checkoutRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
