'use strict'

const ScanResult = require('../models/ScanResult')
const { isMongoConnected } = require('../db')
const { logger } = require('../utils/logger')

async function listScans(req, res) {
  if (!isMongoConnected()) {
    return res.status(200).json({ status: 'success', data: [] })
  }
  try {
    const scans = await ScanResult.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v')
      .lean()
    res.json({ status: 'success', data: scans })
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to list scans')
    res.status(500).json({ status: 'error', message: 'Failed to retrieve scans' })
  }
}

module.exports = { listScans }
