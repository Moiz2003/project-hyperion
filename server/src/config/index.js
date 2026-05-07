'use strict'

const CONFIG = {
  port:           parseInt(process.env.PORT || '3000', 10),
  mongoUri:       process.env.MONGO_URI || '',
  maxFileSizeMB:  parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),

  // Local vLLM swarm
  drafterUrl:     process.env.LOCAL_DRAFTER_URL  || 'http://localhost:8000/v1',
  visionUrl:      process.env.LOCAL_VISION_URL   || 'http://localhost:8001/v1',
  criticUrl:      process.env.LOCAL_CRITIC_URL   || 'http://localhost:8002/v1',
  drafterModel:   process.env.DRAFTER_MODEL      || 'TheBloke/Meditron-70B-AWQ',
  visionModel:    process.env.VISION_MODEL       || 'OpenGVLab/InternVL-Chat-V1-5-AWQ',
  criticModel:    process.env.CRITIC_MODEL       || 'casperhansen/llama-3-70b-instruct-awq',

  // Pipeline
  maxConsensusIterations: parseInt(process.env.MAX_CONSENSUS_ITERATIONS || '3', 10),
  pipelineTimeoutMs:      parseInt(process.env.PIPELINE_TIMEOUT_MS || '240000', 10),

  // Rate limiting (set to 0 to disable)
  rateLimitWindowMs:      parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxAnalyze:    parseInt(process.env.RATE_LIMIT_MAX_ANALYZE || '10', 10),
  rateLimitMaxScans:      parseInt(process.env.RATE_LIMIT_MAX_SCANS   || '60', 10),
}

function validateConfig() {
  const required = [
    'LOCAL_DRAFTER_URL',
    'LOCAL_VISION_URL',
    'LOCAL_CRITIC_URL',
    'DRAFTER_MODEL',
    'VISION_MODEL',
    'CRITIC_MODEL',
  ]
  const missing = required.filter(k => !process.env[k])
  if (missing.length > 0) {
    // Warn but don't exit — defaults are set above
    console.warn(`[config] Missing env vars (using defaults): ${missing.join(', ')}`)
  }
}

module.exports = { CONFIG, validateConfig }
