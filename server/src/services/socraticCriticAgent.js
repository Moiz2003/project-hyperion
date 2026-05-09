'use strict'

const { OpenAI } = require('openai')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { withRetry } = require('../utils/retry')
const { getPrompts, PROMPT_VERSION } = require('../prompts')

const client = new OpenAI({ baseURL: CONFIG.criticUrl, apiKey: 'local' })

const ALLOWED_DIFFICULTY = new Set(['basic', 'intermediate', 'advanced'])

// Returns { hintQuestion, clinicalContext, focusAnatomy, difficulty, keyFinding }
async function runSocraticCritic(rawFindings, requestId) {
  const log = logger.child({ requestId, agent: 'socratic-critic', promptVersion: PROMPT_VERSION })
  const prompts = getPrompts()
  const socratic = prompts.socratic
  if (typeof socratic !== 'function') {
    throw new Error(`Socratic prompt not defined for prompt version ${PROMPT_VERSION}`)
  }
  const { system, user } = socratic(rawFindings)

  const raw = await withRetry(async () => {
    const t0 = Date.now()
    const completion = await client.chat.completions.create({
      model: CONFIG.criticModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 512,
      temperature: 0.3,
      timeout: 45000,
    })
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    const text = completion.choices[0].message.content.trim()
    log.info({ elapsed: `${elapsed}s`, chars: text.length }, 'Socratic critic completed')
    return text
  }, { maxRetries: 2, baseDelayMs: 2000, log, label: 'SocraticCritic' })

  return parseSocraticOutput(raw, log)
}

function parseSocraticOutput(text, log) {
  // Tolerate fenced markdown wrappers around the JSON.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonCandidate = fenced ? fenced[1].trim() : text

  try {
    const parsed = JSON.parse(jsonCandidate)
    const difficulty = ALLOWED_DIFFICULTY.has(parsed.difficulty) ? parsed.difficulty : 'intermediate'
    return {
      hintQuestion: typeof parsed.hint_question === 'string' && parsed.hint_question.trim()
        ? parsed.hint_question.trim()
        : text.slice(0, 240),
      clinicalContext: typeof parsed.clinical_context === 'string'
        ? parsed.clinical_context.trim()
        : '',
      focusAnatomy: typeof parsed.focus_anatomy === 'string'
        ? parsed.focus_anatomy.trim()
        : '',
      difficulty,
      keyFinding: typeof parsed.key_finding === 'string'
        ? parsed.key_finding.trim()
        : '',
    }
  } catch (e) {
    if (log) log.warn({ parseError: e.message }, 'Socratic critic JSON parse failed — falling back to raw text as the hint')
    return {
      hintQuestion: text.slice(0, 240),
      clinicalContext: '',
      focusAnatomy: '',
      difficulty: 'intermediate',
      keyFinding: '',
    }
  }
}

module.exports = { runSocraticCritic, parseSocraticOutput }
