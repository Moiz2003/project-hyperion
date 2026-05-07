'use strict'

const { OpenAI } = require('openai')
const { CONFIG } = require('../config')
const { logger } = require('../utils/logger')
const { withRetry } = require('../utils/retry')
const { getPrompts, PROMPT_VERSION } = require('../prompts')

const client = new OpenAI({ baseURL: CONFIG.criticUrl, apiKey: 'local' })

// Returns { verifiedReport, issuesFound, urgencyFlag, recommendedDept, interventionsMade, rejected }
async function runCriticAgent(draftAssessment, rawFindings, requestId) {
  const log = logger.child({ requestId, agent: 'critic', promptVersion: PROMPT_VERSION })
  const { critic: criticPrompt } = getPrompts()
  const { system, user } = criticPrompt(draftAssessment, rawFindings)

  const raw = await withRetry(async () => {
    const t0 = Date.now()
    const completion = await client.chat.completions.create({
      model: CONFIG.criticModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2048,
      temperature: 0.1,
    })
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    const text = completion.choices[0].message.content.trim()
    log.info({ elapsed: `${elapsed}s`, chars: text.length }, 'Critic agent completed')
    return text
  }, { maxRetries: 3, baseDelayMs: 2000, log, label: 'CriticAgent' })

  return parseCriticOutput(raw, log)
}

function parseCriticOutput(text, log) {
  let urgencyFlag = 'Moderate'
  let recommendedDept = 'General Medicine'
  let interventionsMade = 0
  let rejected = false

  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      const meta = JSON.parse(jsonMatch[1].trim())
      urgencyFlag       = meta.urgency_flag      || urgencyFlag
      recommendedDept   = meta.recommended_dept  || recommendedDept
      interventionsMade = typeof meta.interventions_made === 'number' ? meta.interventions_made : 0
      rejected          = meta.rejected === true
    } catch (e) {
      if (log) log.warn({ parseError: e.message }, 'Could not parse critic JSON metadata')
    }
  }

  // Fallback rejection detection from Issues Found section
  if (!rejected) {
    const issuesMatch = text.match(/###\s*Issues Found\s*\n([\s\S]*?)(?=###|$)/)
    if (issuesMatch) {
      const issuesText = issuesMatch[1].trim()
      rejected = issuesText.toLowerCase() !== 'none' && issuesText.length > 4
    }
  }

  const reportMatch = text.match(/###\s*Verified Report\s*\n([\s\S]*?)(?=###\s*Metadata|$)/)
  const verifiedReport = reportMatch ? reportMatch[1].trim() : text

  const issuesMatch = text.match(/###\s*Issues Found\s*\n([\s\S]*?)(?=###|$)/)
  const issuesFound = issuesMatch ? issuesMatch[1].trim() : ''

  return { verifiedReport, issuesFound, urgencyFlag, recommendedDept, interventionsMade, rejected }
}

function criticRejected(criticResult) {
  return criticResult.rejected === true
}

module.exports = { runCriticAgent, criticRejected }
