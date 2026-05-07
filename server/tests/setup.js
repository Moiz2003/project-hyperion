'use strict'

// Suppress pino-pretty output during tests
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'silent'

// Prevent real DB connections in unit tests
process.env.MONGO_URI = ''
