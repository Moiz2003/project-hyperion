'use strict'

const { OpenAI } = require('openai')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { withRetry } = require('../utils/retry')
const { getPrompts, PROMPT_VERSION } = require('../prompts')

const client = new OpenAI({ baseURL: CONFIG.drafterUrl, apiKey: 'local' })

async function runDrafterAgent(rawFindings, criticFeedback = null, requestId, { simplified = false } = {}) {
  const isRevision = criticFeedback != null
  const log = logger.child({ requestId, agent: 'drafter', promptVersion: PROMPT_VERSION, revision: isRevision, simplified })

  let instruction
  if (simplified) {
    instruction = [
      'You are a clinical AI assistant.',
      'Write a brief structured clinical assessment for the imaging findings below.',
      'Include: Summary of Findings, Differential Diagnosis, and Recommendations.',
      '',
      `Imaging Findings:\n${rawFindings}`,
    ].join('\n')
  } else if (isRevision) {
    instruction = [
      'You are a Lead Radiologist and Clinical AI. You are revising a prior draft.',
      '',
      '[SECTION: ORIGINAL IMAGING FINDINGS]',
      rawFindings,
      '',
      '[SECTION: CRITIC FEEDBACK]',
      criticFeedback,
      '',
      '[SECTION: TASK]',
      'Revise the clinical assessment to fix every issue raised by the critic above.',
      'Keep all sections: Summary of Findings, Differential Diagnosis, Recommended Workup, Red Flags, Patient-Facing Summary.',
      'Do not restate the critic feedback. Only output the corrected report.',
    ].join('\n')
  } else {
    const { drafter: drafterPrompt } = getPrompts()
    instruction = drafterPrompt(rawFindings, null)
  }

  return withRetry(async () => {
    const t0 = Date.now()
    const completion = await client.chat.completions.create({
      model: CONFIG.drafterModel,
      messages: [{ role: 'user', content: instruction }],
      max_tokens: 1536,
      temperature: 0.1,
      timeout: 45000,
    })
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    const text = completion.choices[0].message.content.trim()
    log.info({ elapsed: `${elapsed}s`, chars: text.length }, 'Drafter agent completed')
    return text
  }, { maxRetries: simplified ? 0 : 3, baseDelayMs: 2000, log, label: 'DrafterAgent' })
}

module.exports = { runDrafterAgent }
