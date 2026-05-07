'use strict'

const { OpenAI } = require('openai')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { withRetry } = require('../utils/retry')
const { getPrompts, PROMPT_VERSION } = require('../prompts')

const client = new OpenAI({ baseURL: CONFIG.visionUrl, apiKey: 'local' })

async function runVisionAgent(imageBuffer, requestId) {
  const log = logger.child({ requestId, agent: 'vision', promptVersion: PROMPT_VERSION })
  const base64 = imageBuffer.toString('base64')
  const { vision: visionPrompt } = getPrompts()

  return withRetry(async () => {
    const t0 = Date.now()
    const completion = await client.chat.completions.create({
      model: CONFIG.visionModel,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
          { type: 'text', text: visionPrompt },
        ],
      }],
      max_tokens: 1024,
      temperature: 0.1,
    })
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    const text = completion.choices[0].message.content.trim()
    log.info({ elapsed: `${elapsed}s`, chars: text.length }, 'Vision agent completed')
    return text
  }, { maxRetries: 2, baseDelayMs: 3000, log, label: 'VisionAgent' })
}

module.exports = { runVisionAgent }
