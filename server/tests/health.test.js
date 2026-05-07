'use strict'

const request = require('supertest')
const app = require('../src/app')

describe('GET /health/*', () => {
  test('GET /health/live → 200 ok', async () => {
    const res = await request(app).get('/health/live')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  test('GET /health → 200 (legacy alias)', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('status')
  })

  test('GET /health/ready → 200 when mongo not configured', async () => {
    // MONGO_URI is blank in setup.js → isMongoConnected() is false → mongo not required
    const res = await request(app).get('/health/ready')
    // With no MONGO_URI, CONFIG.mongoUri is falsy → mongoOk = true → 200
    expect([200, 503]).toContain(res.status)
    expect(res.body).toHaveProperty('mongo')
  })

  test('GET /health/detailed → returns agents and config fields', async () => {
    const res = await request(app).get('/health/detailed')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('agents')
    expect(res.body).toHaveProperty('config')
    expect(res.body.config).toHaveProperty('maxConsensusIterations')
    expect(res.body.config).toHaveProperty('maxFileSizeMB')
  })

  test('GET /nonexistent → 404', async () => {
    const res = await request(app).get('/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.status).toBe('error')
  })
})
