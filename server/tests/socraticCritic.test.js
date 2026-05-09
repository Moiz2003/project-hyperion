'use strict'

const nock = require('nock')
const { runSocraticCritic, parseSocraticOutput } = require('../src/services/socraticCriticAgent')
const {
  VISION_RESPONSE,
  SOCRATIC_RESPONSE_JSON,
  SOCRATIC_RESPONSE_FENCED,
  SOCRATIC_RESPONSE_RAW_TEXT,
  makeChatResponse,
} = require('./fixtures/agentResponses')

nock.disableNetConnect()
nock.enableNetConnect('127.0.0.1')

const CRITIC_URL = 'http://localhost:8002'

afterEach(() => nock.cleanAll())
afterAll(() => nock.enableNetConnect())

describe('parseSocraticOutput', () => {
  test('parses raw JSON response into camelCase shape', () => {
    const out = parseSocraticOutput(SOCRATIC_RESPONSE_JSON)
    expect(out.hintQuestion).toMatch(/silhouette/i)
    expect(out.clinicalContext).toMatch(/fever/i)
    expect(out.focusAnatomy).toBe('Right upper lobe')
    expect(out.difficulty).toBe('intermediate')
    expect(out.keyFinding).toMatch(/air bronchograms/i)
  })

  test('strips ```json fence wrappers', () => {
    const out = parseSocraticOutput(SOCRATIC_RESPONSE_FENCED)
    expect(out.hintQuestion).toMatch(/silhouette/i)
    expect(out.focusAnatomy).toBe('Right upper lobe')
  })

  test('falls back to raw text as hint when JSON is malformed', () => {
    const out = parseSocraticOutput(SOCRATIC_RESPONSE_RAW_TEXT)
    expect(out.hintQuestion).toBe(SOCRATIC_RESPONSE_RAW_TEXT)
    expect(out.clinicalContext).toBe('')
    expect(out.focusAnatomy).toBe('')
    expect(out.difficulty).toBe('intermediate')
    expect(out.keyFinding).toBe('')
  })

  test('clamps unknown difficulty to "intermediate"', () => {
    const wonky = JSON.stringify({
      hint_question: 'Q?',
      difficulty: 'expert-level',
    })
    const out = parseSocraticOutput(wonky)
    expect(out.difficulty).toBe('intermediate')
  })

  test('truncates very long fallback text to 240 chars', () => {
    const long = 'A'.repeat(500)
    const out = parseSocraticOutput(long)
    expect(out.hintQuestion.length).toBe(240)
  })
})

describe('runSocraticCritic', () => {
  test('calls the critic vLLM with the socratic system prompt and parses JSON', async () => {
    let capturedBody
    nock(CRITIC_URL)
      .post('/v1/chat/completions', (body) => {
        capturedBody = body
        return true
      })
      .reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))

    const result = await runSocraticCritic(VISION_RESPONSE, 'req-test-1')

    expect(result.hintQuestion).toMatch(/silhouette/i)
    expect(result.focusAnatomy).toBe('Right upper lobe')
    expect(result.difficulty).toBe('intermediate')

    // The system prompt must instruct against revealing the diagnosis.
    const systemMsg = capturedBody.messages.find(m => m.role === 'system')
    expect(systemMsg).toBeDefined()
    expect(systemMsg.content).toMatch(/never name the diagnosis/i)
    expect(systemMsg.content).toMatch(/socratic/i)

    // The user message should contain the raw vision findings.
    const userMsg = capturedBody.messages.find(m => m.role === 'user')
    expect(userMsg.content).toContain(VISION_RESPONSE)
  })

  test('retries on transient failure then succeeds', async () => {
    nock(CRITIC_URL).post('/v1/chat/completions').reply(503, { error: 'unavailable' })
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_JSON))

    const result = await runSocraticCritic(VISION_RESPONSE, 'req-test-2')
    expect(result.hintQuestion).toMatch(/silhouette/i)
  })

  test('returns fallback hint object when vLLM returns non-JSON text', async () => {
    nock(CRITIC_URL).post('/v1/chat/completions').reply(200, makeChatResponse(SOCRATIC_RESPONSE_RAW_TEXT))

    const result = await runSocraticCritic(VISION_RESPONSE, 'req-test-3')
    expect(result.hintQuestion).toBe(SOCRATIC_RESPONSE_RAW_TEXT)
    expect(result.focusAnatomy).toBe('')
    expect(result.difficulty).toBe('intermediate')
  })
})
