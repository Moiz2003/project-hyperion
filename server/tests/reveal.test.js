'use strict'

const request = require('supertest')
const nock = require('nock')
const app = require('../src/app')
const eduSessionCache = require('../src/utils/eduSessionCache')
const {
  VISION_RESPONSE,
  DRAFTER_RESPONSE,
  CRITIC_RESPONSE_CLEAN,
  SOCRATIC_RESPONSE_JSON,
  MINIMAL_JPEG,
  makeChatResponse,
} = require('./fixtures/agentResponses')

nock.disableNetConnect()
nock.enableNetConnect('127.0.0.1')

const VISION_URL = 'http://localhost:8001'
const DRAFTER_URL = 'http://localhost:8000'
const CRITIC_URL = 'http://localhost:8002'

afterEach(() => {
  nock.cleanAll()
  eduSessionCache._clear()
})
afterAll(() => nock.enableNetConnect())

async function seedEduSession() {
  nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
  nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))

  const res = await request(app)
    .post('/api/analyze-scan')
    .field('mode', 'edu')
    .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

  expect(res.status).toBe(200)
  return res.body.data.image_hash
}

describe('POST /api/analyze-scan/reveal — validation', () => {
  test('missing image_hash → 400', async () => {
    const res = await request(app).post('/api/analyze-scan/reveal').send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/image_hash/i)
  })

  test('non-existent session → 404', async () => {
    const res = await request(app)
      .post('/api/analyze-scan/reveal')
      .send({ image_hash: 'never-saw-this-hash', resident_assessment: 'x' })
    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/expired|not found/i)
  })
})

describe('POST /api/analyze-scan/reveal — happy path', () => {
  test('runs full clinical pipeline and returns match score', async () => {
    const imageHash = await seedEduSession()

    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan/reveal')
      .send({
        image_hash: imageHash,
        resident_assessment: 'I think this is pneumonia with consolidation.',
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.mode).toBe('edu-reveal')

    const { data } = res.body
    expect(data).toHaveProperty('verified_report')
    expect(data).toHaveProperty('urgency_flag')
    expect(data).toHaveProperty('socratic_hint')
    expect(data).toHaveProperty('resident_assessment', 'I think this is pneumonia with consolidation.')
    expect(data).toHaveProperty('diagnosis_match')
    expect(data.diagnosis_match.score).toBeGreaterThanOrEqual(0)
    expect(data.diagnosis_match.score).toBeLessThanOrEqual(100)
    expect(data.diagnosis_match.matched).toEqual(expect.arrayContaining(['pneumonia', 'consolidation']))
  })

  test('reveal without resident_assessment returns null match score', async () => {
    const imageHash = await seedEduSession()

    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan/reveal')
      .send({ image_hash: imageHash })

    expect(res.status).toBe(200)
    expect(res.body.data.diagnosis_match).toBeNull()
    expect(res.body.data.resident_assessment).toBe('')
  })

  test('reveal returns the cached socratic_hint alongside the verified report', async () => {
    const imageHash = await seedEduSession()

    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan/reveal')
      .send({ image_hash: imageHash, resident_assessment: 'pneumonia' })

    expect(res.body.data.socratic_hint.hintQuestion).toMatch(/silhouette/i)
    expect(res.body.data.socratic_hint.focusAnatomy).toBe('Right upper lobe')
  })
})
