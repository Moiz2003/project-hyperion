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

describe('POST /api/analyze-scan — mode=edu', () => {
  test('runs Vision → Socratic only and returns hint shape', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))
    // Drafter must NOT be called in edu mode — leave it un-mocked so any call would fail.

    const res = await request(app)
      .post('/api/analyze-scan')
      .field('mode', 'edu')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.mode).toBe('edu')

    const { data } = res.body
    expect(data).toHaveProperty('raw_findings')
    expect(data).toHaveProperty('image_hash')
    expect(data).toHaveProperty('socratic_hint')
    expect(data.socratic_hint.hintQuestion).toMatch(/silhouette/i)
    expect(data.socratic_hint.focusAnatomy).toBe('Right upper lobe')
    expect(data.socratic_hint.difficulty).toBe('intermediate')

    // Edu mode must not produce a verified report or urgency flag.
    expect(data).not.toHaveProperty('verified_report')
    expect(data).not.toHaveProperty('urgency_flag')
    expect(data).not.toHaveProperty('critic_interventions')
  })

  test('caches the session keyed by image_hash for the eventual /reveal flow', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))

    const res = await request(app)
      .post('/api/analyze-scan')
      .field('mode', 'edu')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    const { image_hash } = res.body.data
    const session = eduSessionCache.get(image_hash)
    expect(session).not.toBeNull()
    expect(Buffer.isBuffer(session.imageBuffer)).toBe(true)
    expect(session.rawFindings).toContain('Modality')
    expect(session.socraticHint.hintQuestion).toMatch(/silhouette/i)
  })

  test('mode defaults to clinical and runs the full adversarial pipeline', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('verified_report')
    expect(res.body.data).toHaveProperty('urgency_flag', 'High')
    expect(res.body.data).not.toHaveProperty('socratic_hint')
  })

  test('explicit mode=clinical also runs the full pipeline', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan')
      .field('mode', 'clinical')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    expect(res.body.mode).toBe('production')
    expect(res.body.data).toHaveProperty('verified_report')
  })

  test('unknown mode value is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/analyze-scan')
      .field('mode', 'mystery-mode')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toMatch(/Invalid mode/i)
  })

  test('mode=edu via query param also works', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))

    const res = await request(app)
      .post('/api/analyze-scan?mode=edu')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    expect(res.body.mode).toBe('edu')
    expect(res.body.data).toHaveProperty('socratic_hint')
  })
})
