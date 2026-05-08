'use strict'

const mongoose = require('mongoose')
const { CONFIG } = require('./config')
const { logger } = require('./utils/logger')

let mongoConnected = false

/**
 * Connect to MongoDB with DNS resilience.
 *
 * Strategy:
 *   1. Primary: full SRV URI with Google DNS override (set in server.js)
 *   2. Fallback: strip +srv → direct replica set connection
 *   3. Final fallback: continue without persistence (no crash)
 *
 * The dns.setServers(['8.8.8.8', '8.8.4.4']) call in server.js
 * prevents querySrv ENOTFOUND on Render's restricted network.
 */
async function connectMongo() {
  if (!CONFIG.mongoUri) {
    logger.warn('MONGO_URI not set — running without persistence')
    return
  }

  const attempt = async (uri, label = 'primary') => {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,    // 10s to find a server
      heartbeatFrequencyMS: 30_000,        // check every 30s
      socketTimeoutMS: 60_000,             // close idle sockets after 60s
      connectTimeoutMS: 15_000,            // 15s for initial TCP connection
      retryWrites: true,
      w: 'majority',
    })
    mongoConnected = true
    logger.info({ label }, 'MongoDB connected')
    logger.info(`[DATABASE] ✅ MongoDB Connection Verified (${label})`)
  }

  // Phase 1: Primary SRV connection
  try {
    await attempt(CONFIG.mongoUri, 'srv')
    return
  } catch (err) {
    logger.warn({ err: err.message }, 'MongoDB SRV connection failed')
  }

  // Phase 2: Non-SRV fallback (bypasses DNS SRV lookup entirely)
  if (CONFIG.mongoUri.includes('+srv')) {
    const nonSrvUri = CONFIG.mongoUri.replace('mongodb+srv://', 'mongodb://')
    try {
      await attempt(nonSrvUri, 'non-srv-fallback')
      return
    } catch (err) {
      logger.warn({ err: err.message }, 'MongoDB non-SRV fallback failed')
    }
  }

  // Phase 3: Direct IP resolution via SRV lookup result (if available)
  // If the SRV lookup succeeded but the connection failed, try with
  // a longer timeout
  try {
    await mongoose.connect(CONFIG.mongoUri, {
      serverSelectionTimeoutMS: 30_000,
      socketTimeoutMS: 120_000,
      connectTimeoutMS: 30_000,
      retryWrites: true,
      w: 'majority',
    })
    mongoConnected = true
    logger.info('MongoDB connected (extended timeout)')
    logger.info('[DATABASE] ✅ MongoDB Connection Verified (extended-timeout)')
    return
  } catch (err) {
    logger.warn({ err: err.message }, 'MongoDB extended-timeout attempt failed')
  }

  // All attempts exhausted — graceful degradation
  logger.warn('All MongoDB connection attempts failed — continuing without persistence')
}

const isMongoConnected = () => mongoConnected

module.exports = { connectMongo, isMongoConnected }
