'use strict'

const mongoose = require('mongoose')

const scanResultSchema = new mongoose.Schema(
  {
    imageBase64:         { type: String, maxLength: 5 * 1024 * 1024 },
    rawFindings:         { type: String, required: true },
    verifiedReport:      { type: String, required: true },
    urgencyFlag:         { type: String, enum: ['High', 'Moderate', 'Low'], default: 'Moderate' },
    recommendedDept:     { type: String, default: 'General Medicine' },
    criticInterventions: { type: Number, default: 0, min: 0 },
    processingLatency:   { type: String },
    promptVersion:       { type: String, default: 'v1' },
    imageHash:           { type: String, index: true },
  },
  { timestamps: true }
)

// TTL index: automatically expire cached results after 24 h
scanResultSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

module.exports = mongoose.model('ScanResult', scanResultSchema)
