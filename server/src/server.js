'use strict'

const { CONFIG, validateConfig } = require('./config')
const { connectMongo } = require('./db')
const { logger } = require('./utils/logger')
const app = require('./app')

validateConfig()

async function boot() {
  await connectMongo()

  const server = app.listen(CONFIG.port, () => {
    logger.info(
      {
        port: CONFIG.port,
        drafter: `${CONFIG.drafterUrl} (${CONFIG.drafterModel})`,
        vision: `${CONFIG.visionUrl} (${CONFIG.visionModel})`,
        critic: `${CONFIG.criticUrl} (${CONFIG.criticModel})`,
      },
      'Hyperion server started'
    )
  })

  function shutdown(signal) {
    logger.info({ signal }, 'Shutdown signal received — closing server')
    server.close(() => {
      logger.info('HTTP server closed')
      process.exit(0)
    })
    setTimeout(() => {
      logger.warn('Force-exiting after graceful shutdown timeout')
      process.exit(1)
    }, 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

boot().catch(err => {
  logger.error({ err: err.message }, 'Boot failure')
  process.exit(1)
})
