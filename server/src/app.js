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

// CORS: dynamic origin list from CORS_ORIGIN env var (comma-separated)
// Falls back to localhost + Vercel production for safety
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'https://project-hyperion-nine.vercel.app',
]
const allowedOrigins = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : DEFAULT_ORIGINS

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      logger.warn({ origin }, 'CORS blocked origin')
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
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
