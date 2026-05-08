'use strict'

const request = require('supertest')
const nock = require('nock')
const app = require('../src/app')
const {
  VISION_RESPONSE, DRAFTER_RESPONSE, CRITIC_RESPONSE_CLEAN, CRITIC_RESPONSE_WITH_ISSUES,
  MINIMAL_JPEG, makeChatResponse,
} = require('./fixtures/agentResponses')

// Prevent real HTTP calls to vLLM
nock.disableNetConnect()
nock.enableNetConnect('127.0.0.1')

const VISION_URL = 'http://localhost:8001'
const DRAFTER_URL = 'http://localhost:8000'
const CRITIC_URL = 'http://localhost:8002'

afterEach(() => nock.cleanAll())
afterAll(() => nock.enableNetConnect())

// ── File validation ───────────────────────────────────────────────────────────

describe('POST /api/analyze-scan — input validation', () => {
  test('missing file → 400', async () => {
    const res = await request(app).post('/api/analyze-scan')
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toMatch(/required/i)
  })

  test('invalid MIME type → 415', async () => {
    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', Buffer.from('not an image'), { filename: 'test.pdf', contentType: 'application/pdf' })
    expect(res.status).toBe(415)
  })

  test('oversized file → 413', async () => {
    const oversized = Buffer.alloc(21 * 1024 * 1024) // 21 MB, limit is 20 MB
    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', oversized, { filename: 'big.jpg', contentType: 'image/jpeg' })
    expect(res.status).toBe(413)
  })

  test('wrong field name → 400', async () => {
    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('wrong_field', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })
    expect(res.status).toBe(400)
  })
})

// ── Happy path — consensus reached on first iteration ────────────────────────

describe('POST /api/analyze-scan — successful pipeline', () => {
  test('vision → drafter → critic (clean) → 200 with full result shape', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')

    const { data } = res.body
    expect(data).toHaveProperty('raw_findings')
    expect(data).toHaveProperty('verified_report')
    expect(data).toHaveProperty('urgency_flag', 'High')
    expect(data).toHaveProperty('recommended_dept', 'Pulmonology')
    expect(data).toHaveProperty('critic_interventions', 0)
    expect(res.body).toHaveProperty('processing_latency')
    expect(res.body).toHaveProperty('requestId')
  })
})

// ── Adversarial loop — critic rejects, then accepts ──────────────────────────

describe('POST /api/analyze-scan — adversarial consensus loop', () => {
  test('critic rejects once, then accepts on revision → 200', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    // Initial drafter call
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    // Critic rejects
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_WITH_ISSUES))
    // Drafter revision
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE + '\n\nRevised.'))
    // Critic accepts on second pass
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(CRITIC_RESPONSE_CLEAN))

    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    expect(res.body.data.critic_interventions).toBe(2) // 2 interventions from CRITIC_RESPONSE_WITH_ISSUES
  })
})

// ── Error scenarios ───────────────────────────────────────────────────────────

describe('POST /api/analyze-scan — error scenarios', () => {
  test('vision agent down (503) → 206 partial with fallback text', async () => {
    nock(VISION_URL).post('/v1/chat/completions').times(3).reply(503, { error: 'Service Unavailable' })

    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })
      .timeout(30000)

    expect(res.status).toBe(206)
    expect(res.body.status).toBe('partial')
    expect(res.body.data).toHaveProperty('raw_findings')
    expect(res.body.data).toHaveProperty('verified_report')
  }, 35000)

  test('vision agent returns 429 (rate limited) → 206 partial after retries', async () => {
    nock(VISION_URL).post('/v1/chat/completions').times(3).reply(429, { error: 'Too Many Requests' })

    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })
      .timeout(30000)

    expect(res.status).toBe(206)
    expect(res.body.status).toBe('partial')
  }, 35000)

  test('drafter agent unreachable → 206 partial with fallback draft', async () => {
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').times(3).replyWithError('ECONNREFUSED')

    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })
      .timeout(30000)

    expect(res.status).toBe(206)
    expect(res.body.status).toBe('partial')
    // Vision succeeded so raw_findings should contain real data
    expect(res.body.data.raw_findings).toMatch(/consolidation|lung|chest/i)
  }, 35000)

  test('critic agent returns malformed JSON metadata → uses fallback values', async () => {
    const malformedCritic = `### Issues Found\nNone\n\n### Verified Report\nGood report.\n\n### Metadata\n\`\`\`json\n{ invalid json }\n\`\`\``
    nock(VISION_URL).post('/v1/chat/completions').reply(200, makeChatResponse(VISION_RESPONSE))
    nock(DRAFTER_URL).post('/v1/chat/completions').reply(200, makeChatResponse(DRAFTER_RESPONSE))
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(malformedCritic))

    const res = await request(app)
      .post('/api/analyze-scan')
      .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(200)
    // Falls back to defaults
    expect(res.body.data.urgency_flag).toBe('Moderate')
    expect(res.body.data.recommended_dept).toBe('General Medicine')
  })
})

// ── Rate limiting ─────────────────────────────────────────────────────────────

describe('POST /api/analyze-scan — rate limiting', () => {
  test('exceeds 10 req/min limit → 429', async () => {
    // Fire 11 requests without waiting for them to complete
    const requests = Array.from({ length: 11 }, () =>
      request(app)
        .post('/api/analyze-scan')
        .attach('xray_image', MINIMAL_JPEG, { filename: 'scan.jpg', contentType: 'image/jpeg' })
    )
    const responses = await Promise.all(requests)
    const statuses = responses.map(r => r.status)
    expect(statuses).toContain(429)
  })
})
