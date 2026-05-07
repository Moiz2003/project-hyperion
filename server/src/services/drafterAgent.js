'use strict'

const { OpenAI } = require('openai')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { withRetry } = require('../utils/retry')
const { getPrompts, PROMPT_VERSION } = require('../prompts')

// Uses /v1/completions + explicit LLaMA-2 instruct format.
// Meditron (LLaMA-2 based) has no chat_template in transformers ≥ v4.44.
const client = new OpenAI({ baseURL: CONFIG.drafterUrl, apiKey: 'local' })

async function runDrafterAgent(rawFindings, criticFeedback = null, requestId) {
  const log = logger.child({ requestId, agent: 'drafter', promptVersion: PROMPT_VERSION, revision: criticFeedback != null })
  const { drafter: drafterPrompt } = getPrompts()
  const instruction = drafterPrompt(rawFindings, criticFeedback)

  return withRetry(async () => {
    const t0 = Date.now()
    const completion = await client.completions.create({
      model: CONFIG.drafterModel,
      prompt: `<s>[INST] ${instruction} [/INST]`,
      max_tokens: 2048,
      temperature: 0.2,
      stop: ['</s>', '[INST]'],
    })
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    const text = completion.choices[0].text.trim()
    log.info({ elapsed: `${elapsed}s`, chars: text.length }, 'Drafter agent completed')
    return text
  }, { maxRetries: 3, baseDelayMs: 2000, log, label: 'DrafterAgent' })
}

module.exports = { runDrafterAgent }
