'use strict'

const { OpenAI } = require('openai')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { withRetry } = require('../utils/retry')
const { getPrompts, PROMPT_VERSION } = require('../prompts')

const client = new OpenAI({ baseURL: CONFIG.visionUrl, apiKey: 'local' })

// Detect MIME type from buffer magic bytes — never trust the filename extension.
// Sending a wrong MIME type causes vision models to silently reject the image.
function detectMimeType(buf) {
  if (!buf || buf.length < 4) return 'image/jpeg'
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp'
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif'
  if ((buf[0] === 0x49 && buf[1] === 0x49) || (buf[0] === 0x4D && buf[1] === 0x4D)) return 'image/tiff'
  return 'image/jpeg'
}

async function runVisionAgent(imageBuffer, requestId) {
  const log = logger.child({ requestId, agent: 'vision', promptVersion: PROMPT_VERSION })
  const base64 = imageBuffer.toString('base64')
  const mimeType = detectMimeType(imageBuffer)
  const { vision: visionPrompt } = getPrompts()

  console.log(`[VISION] Starting. url=${CONFIG.visionUrl} model=${CONFIG.visionModel} mimeType=${mimeType} bufferBytes=${imageBuffer.length} base64Chars=${base64.length}`)

  return withRetry(async () => {
    const t0 = Date.now()
    const completion = await client.chat.completions.create({
      model: CONFIG.visionModel,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: visionPrompt },
        ],
      }],
      max_tokens: 1024,
      temperature: 0.1,
      timeout: 60000,
    })
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    const text = completion.choices[0].message.content.trim()
    console.log(`[VISION] Done in ${elapsed}s. chars=${text.length} preview="${text.slice(0, 100)}"`)
    log.info({ elapsed: `${elapsed}s`, chars: text.length }, 'Vision agent completed')
    return text
  }, { maxRetries: 2, baseDelayMs: 3000, log, label: 'VisionAgent' })
}

module.exports = { runVisionAgent }
