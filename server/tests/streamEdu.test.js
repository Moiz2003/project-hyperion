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

function parseSseFrames(text) {
  const frames = text.split('\n\n').filter(Boolean)
  return frames.map(frame => {
    const eventLine = frame.match(/^event:\s*(.+)$/m)
    const dataLine = frame.match(/^data:\s*(.+)$/m)
    return {
      event: eventLine ? eventLine[1].trim() : null,
      data: dataLine ? JSON.parse(dataLine[1]) : null,
    }
  })
}

describe('POST /api/analyze-scan/stream — mode=edu', () => {
  test('emits agent_start, socratic_hint, and edu-shaped pipeline_complete', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))

    const res = await request(app)
      .post('/api/analyze-scan/stream')
      .field('mode', 'edu')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/text\/event-stream/)

    const frames = parseSseFrames(res.text)
    const types = frames.map(f => f.event)

    expect(types).toContain('pipeline_start')
    expect(types).toContain('socratic_hint')
    expect(types).toContain('pipeline_complete')

    const start = frames.find(f => f.event === 'pipeline_start')
    expect(start.data.mode).toBe('edu')

    const hint = frames.find(f => f.event === 'socratic_hint')
    expect(hint.data).toHaveProperty('hint_question')
    expect(hint.data).toHaveProperty('focus_anatomy', 'Right upper lobe')
    expect(hint.data).toHaveProperty('difficulty', 'intermediate')

    const complete = frames.find(f => f.event === 'pipeline_complete')
    expect(complete.data.mode).toBe('edu')
    expect(complete.data.data).toHaveProperty('socratic_hint')
    expect(complete.data.data).toHaveProperty('image_hash')
    expect(complete.data.data).not.toHaveProperty('verified_report')
  })

  test('stream edu run also writes to eduSessionCache for /reveal', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))

    const res = await request(app)
      .post('/api/analyze-scan/stream')
      .field('mode', 'edu')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    const frames = parseSseFrames(res.text)
    const complete = frames.find(f => f.event === 'pipeline_complete')
    const imageHash = complete.data.data.image_hash

    const session = eduSessionCache.get(imageHash)
    expect(session).not.toBeNull()
    expect(Buffer.isBuffer(session.imageBuffer)).toBe(true)
    expect(session.socraticHint.hintQuestion).toMatch(/silhouette/i)
  })

  test('stream without mode runs the full clinical pipeline (regression check)', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan/stream')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    const frames = parseSseFrames(res.text)
    const complete = frames.find(f => f.event === 'pipeline_complete')
    expect(complete.data.data).toHaveProperty('verified_report')
    expect(complete.data.data).not.toHaveProperty('socratic_hint')
    expect(complete.data.mode).toBe('production')
  })

  test('stream rejects invalid mode with 400 (validation runs before stream starts)', async () => {
    const res = await request(app)
      .post('/api/analyze-scan/stream')
      .field('mode', 'wat')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Invalid mode/i)
  })
})
