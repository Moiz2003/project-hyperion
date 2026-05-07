'use strict'

const mongoose = require('mongoose')
const { CONFIG } = require('./config')
const { logger } = require('./utils/logger')

let mongoConnected = false

async function connectMongo() {
  if (!CONFIG.mongoUri) {
    logger.warn('MONGO_URI not set — running without persistence')
    return
  }
  const attempt = async (uri) => {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    mongoConnected = true
    logger.info('MongoDB connected')
  }
  try {
    await attempt(CONFIG.mongoUri)
  } catch (err) {
    logger.warn({ err: err.message }, 'MongoDB primary connection failed')
    if (CONFIG.mongoUri.includes('+srv')) {
      try {
        await attempt(CONFIG.mongoUri.replace('+srv', ''))
        logger.info('MongoDB connected via non-srv fallback')
      } catch (e2) {
        logger.warn({ err: e2.message }, 'MongoDB fallback failed — continuing without persistence')
      }
    }
  }
}

const isMongoConnected = () => mongoConnected

module.exports = { connectMongo, isMongoConnected }
