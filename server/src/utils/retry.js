'use strict'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const isRetryable = (err) => {
  const msg = err?.message || ''
  const code = err?.status || err?.statusCode || 0
  return (
    msg.includes('429') || msg.includes('500') || msg.includes('503') ||
    code === 429 || code === 500 || code === 503 ||
    msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT') ||
    msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') ||
    msg.includes('socket hang up') || msg.includes('network') ||
    msg.includes('timeout') || err?.name === 'AbortError'
  )
}

async function withRetry(fn, { maxRetries = 3, baseDelayMs = 2000, log = null, label = 'operation' } = {}) {
  let lastErr
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const retryable = isRetryable(err)

      if (!retryable || attempt > maxRetries) {
        if (log) log.error({ err, attempt, label }, `${label} failed — not retrying`)
        throw err
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), 16_000)
      if (log) log.warn({ attempt, delay, label, error: err.message }, `${label} retrying in ${delay}ms`)
      await sleep(delay)
    }
  }
  throw lastErr
}

module.exports = { withRetry, sleep, isRetryable }
