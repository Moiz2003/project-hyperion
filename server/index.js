'use strict'

const path = require('path')
const http = require('http')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const Stripe = require('stripe')
const multer = require('multer')
const mongoose = require('mongoose')
const { OpenAI } = require('openai')

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || '',
  maxFileSizeMB: 20,
  drafterUrl: process.env.LOCAL_DRAFTER_URL || 'http://localhost:8000/v1',
  visionUrl: process.env.LOCAL_VISION_URL || 'http://localhost:8001/v1',
  criticUrl: process.env.LOCAL_CRITIC_URL || 'http://localhost:8002/v1',
  drafterModel: process.env.DRAFTER_MODEL || 'TheBloke/Meditron-70B-AWQ',
  visionModel: process.env.VISION_MODEL || 'OpenGVLab/InternVL-Chat-V1-5-AWQ',
  criticModel: process.env.CRITIC_MODEL || 'casperhansen/llama-3-70b-instruct-awq',
}

// ── MongoDB ───────────────────────────────────────────────────────────────────
let mongoConnected = false

const connectMongo = async () => {
  if (!CONFIG.mongoUri) return
  try {
    await mongoose.connect(CONFIG.mongoUri, { serverSelectionTimeoutMS: 5000 })
    mongoConnected = true
    console.log('MongoDB connected')
  } catch (err) {
    console.warn('MongoDB unavailable — running without persistence:', err.message)
    if (CONFIG.mongoUri.includes('+srv')) {
      try {
        await mongoose.connect(CONFIG.mongoUri.replace('+srv', ''), { serverSelectionTimeoutMS: 5000 })
        mongoConnected = true
        console.log('MongoDB connected via fallback (non-srv)')
      } catch { /* give up */ }
    }
  }
}

const scanResultSchema = new mongoose.Schema({
  imageBase64: { type: String, maxLength: 5 * 1024 * 1024 },
  rawFindings: String,
  verifiedReport: String,
  urgencyFlag: String,
  recommendedDept: String,
  criticInterventions: { type: Number, default: 1 },
  processingLatency: String,
  createdAt: { type: Date, default: Date.now },
})

const ScanResult = mongoose.model('ScanResult', scanResultSchema)

// ── vLLM swarm clients (OpenAI-compatible) ────────────────────────────────────
// 'local' satisfies the SDK's required-key check without sending to any external service.
const drafterClient = new OpenAI({ baseURL: CONFIG.drafterUrl, apiKey: 'local' })
const visionClient = new OpenAI({ baseURL: CONFIG.visionUrl, apiKey: 'local' })
const criticClient = new OpenAI({ baseURL: CONFIG.criticUrl, apiKey: 'local' })

// ── Stripe ────────────────────────────────────────────────────────────────────
const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = (typeof stripeKey === 'string' && (stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_')))
  ? new Stripe(stripeKey)
  : null

// ── Express + Multer ──────────────────────────────────────────────────────────
const app = express()
const startTime = Date.now()

app.use(helmet())
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }))
app.use(express.json({ limit: '50mb' }))

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CONFIG.maxFileSizeMB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Invalid file type ${file.mimetype}. Allowed: JPEG, PNG, WebP, TIFF`))
  },
})

// ── Agent: Vision (InternVL-Chat-V1-5-AWQ, port 8001) ────────────────────────
// Receives a raw image Buffer, returns structured imaging findings as text.
const runVisionAgent = async (imageBuffer) => {
  const base64 = imageBuffer.toString('base64')

  const completion = await visionClient.chat.completions.create({
    model: CONFIG.visionModel,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64}` },
        },
        {
          type: 'text',
          text: [
            'You are a professional medical radiologist.',
            'Analyse this medical scan image and provide a detailed structured report.',
            'Include: Modality & Anatomy | Key Observations | Abnormalities / Pathology |',
            'Incidental Findings | Image Quality Notes.',
            'Flag anything requiring urgent clinical attention.',
          ].join(' '),
        },
      ],
    }],
    max_tokens: 1024,
    temperature: 0.1,
  })

  return completion.choices[0].message.content.trim()
}

// ── Agent: Drafter (Meditron-70B-AWQ, port 8000) ─────────────────────────────
// Uses /v1/completions + explicit LLaMA-2 instruct format because Meditron has
// no tokenizer chat_template in transformers ≥ v4.44.
const runDrafterAgent = async (rawFindings) => {
  const instruction = [
    'You are Meditron, a clinical AI trained on medical literature and evidence-based guidelines.',
    'A radiologist has provided imaging findings. Write a complete structured clinical assessment.',
    'Use these sections and fill each with substantive content:',
    '(1) Summary of Findings',
    '(2) Differential Diagnosis — ranked by probability, one-sentence rationale each',
    '(3) Recommended Workup — specific investigations, imaging, and referrals',
    '(4) Red Flags / Urgent Actions',
    '(5) Patient-Facing Summary — plain language, under 80 words',
    'Cite relevant clinical guidelines. State uncertainty explicitly.',
    '',
    `Imaging Findings:\n${rawFindings}`,
  ].join('\n')

  const completion = await drafterClient.completions.create({
    model: CONFIG.drafterModel,
    prompt: `<s>[INST] ${instruction} [/INST]`,
    max_tokens: 2048,
    temperature: 0.2,
    stop: ['</s>', '[INST]'],
  })

  return completion.choices[0].text.trim()
}

// ── Agent: Critic (Llama-3-70B-Instruct-AWQ, port 8002) ──────────────────────
// Adversarially audits the Drafter's output.
// Returns { verifiedReport, urgencyFlag, recommendedDept, criticInterventions }.
const runCriticAgent = async (draftAssessment, rawFindings) => {
  const completion = await criticClient.chat.completions.create({
    model: CONFIG.criticModel,
    messages: [
      {
        role: 'system',
        content: [
          'You are a senior radiologist and patient-safety officer.',
          'Audit the AI-generated clinical assessment below against the raw imaging findings.',
          'Identify: missed diagnoses, dangerous omissions, incorrect differentials,',
          'unsafe recommendations, outdated guidelines, or ambiguous language.',
          '',
          'Structure your response EXACTLY as follows:',
          '### Issues Found',
          '(list each issue as a numbered point; write "None" if the draft is clean)',
          '',
          '### Verified Report',
          '(corrected/improved final assessment, or repeat the original if no changes needed)',
          '',
          '### Metadata',
          '```json',
          '{',
          '  "urgency_flag": "High|Moderate|Low",',
          '  "recommended_dept": "<single department name>",',
          '  "interventions_made": <integer>',
          '}',
          '```',
        ].join('\n'),
      },
      {
        role: 'user',
        content: `Raw Imaging Findings:\n${rawFindings}\n\nDraft Assessment:\n${draftAssessment}`,
      },
    ],
    max_tokens: 2048,
    temperature: 0.1,
  })

  const text = completion.choices[0].message.content.trim()

  // Extract the JSON metadata block
  let urgencyFlag = 'Moderate'
  let recommendedDept = 'General Medicine'
  let criticInterventions = 1

  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      const meta = JSON.parse(jsonMatch[1].trim())
      urgencyFlag = meta.urgency_flag || urgencyFlag
      recommendedDept = meta.recommended_dept || recommendedDept
      criticInterventions = typeof meta.interventions_made === 'number'
        ? meta.interventions_made
        : criticInterventions
    } catch { /* malformed JSON — use defaults */ }
  }

  // Extract the verified report section
  const reportMatch = text.match(/###\s*Verified Report\s*\n([\s\S]*?)(?=###\s*Metadata|$)/)
  const verifiedReport = reportMatch ? reportMatch[1].trim() : text

  return { verifiedReport, urgencyFlag, recommendedDept, criticInterventions }
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * Probe a vLLM endpoint via raw HTTP with a 2-second timeout.
 * Returns 'ok' if the endpoint responds, 'unreachable' otherwise.
 */
function probeAgent(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      res.resume()
      resolve('ok')
    })
    req.on('timeout', () => { req.destroy(); resolve('unreachable') })
    req.on('error', () => resolve('unreachable'))
  })
}

app.get('/health', async (_req, res) => {
  const [drafter, vision, critic] = await Promise.all([
    probeAgent('http://localhost:8000/v1/models'),
    probeAgent('http://localhost:8001/v1/models'),
    probeAgent('http://localhost:8002/v1/models'),
  ])
  const agents = { drafter, vision, critic }
  const healthy = Object.values(agents).every(s => s === 'ok')
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    agents,
    uptime: `${((Date.now() - startTime) / 1000).toFixed(0)}s`,
    mongo: mongoConnected ? 'connected' : 'disconnected',
  })
})

app.get('/api', (_req, res) => {
  res.status(200).json({ message: 'Hyperion API is running' })
})

// GET /api/scans — scan history (MongoDB primary, empty array fallback)
app.get('/api/scans', async (_req, res) => {
  if (!mongoConnected) {
    return res.status(200).json({ status: 'success', data: [], source: 'unavailable' })
  }
  try {
    const scans = await ScanResult.find({}, '-imageBase64')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    res.status(200).json({ status: 'success', data: scans, source: 'mongodb' })
  } catch (err) {
    console.error('Scan history error:', err)
    res.status(500).json({ status: 'error', message: 'Could not retrieve scan history.' })
  }
})

// POST /api/analyze-scan — main swarm pipeline
app.post('/api/analyze-scan', upload.single('xray_image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No image uploaded. Field name must be xray_image.' })
  }

  const t0 = Date.now()

  try {
    // Step 1 — Vision agent
    const rawFindings = await runVisionAgent(req.file.buffer)

    // Step 2 — Drafter agent
    const draftAssessment = await runDrafterAgent(rawFindings)

    // Step 3 — Critic agent
    const { verifiedReport, urgencyFlag, recommendedDept, criticInterventions } =
      await runCriticAgent(draftAssessment, rawFindings)

    const processingLatency = `${((Date.now() - t0) / 1000).toFixed(1)}s`

    const payload = {
      raw_findings: rawFindings,
      verified_report: verifiedReport,
      urgency_flag: urgencyFlag,
      recommended_dept: recommendedDept,
      critic_interventions: criticInterventions,
    }

    // Persist to MongoDB (non-blocking — don't fail the request if it errors)
    if (mongoConnected) {
      ScanResult.create({
        imageBase64: req.file.buffer.toString('base64'),
        rawFindings,
        verifiedReport,
        urgencyFlag,
        recommendedDept,
        criticInterventions,
        processingLatency,
      }).catch(err => console.error('Mongo persist error:', err.message))
    }

    return res.status(200).json({
      status: 'success',
      data: payload,
      processing_latency: processingLatency,
    })
  } catch (err) {
    console.error('Swarm pipeline error:', err)
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Swarm inference failed.',
    })
  }
})

app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({
      message: 'Stripe is not configured. Set a valid STRIPE_SECRET_KEY on the server.',
    })
  }
  try {
    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173'
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: { name: 'Hyperion Clinician Pro Trial', description: 'Clinician Pro plan billed monthly' },
          unit_amount: 19900,
        },
        quantity: 1,
      }],
      success_url: `${origin}/pricing?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
      metadata: { plan: 'clinician-pro' },
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(500).json({ message: 'Unable to start checkout right now.' })
  }
})

// ── Boot ──────────────────────────────────────────────────────────────────────
connectMongo().then(() => {
  app.listen(CONFIG.port, () => {
    console.log(`Hyperion server listening on port ${CONFIG.port}`)
    console.log(`  Drafter → ${CONFIG.drafterUrl}  (${CONFIG.drafterModel})`)
    console.log(`  Vision  → ${CONFIG.visionUrl}  (${CONFIG.visionModel})`)
    console.log(`  Critic  → ${CONFIG.criticUrl}  (${CONFIG.criticModel})`)
  })
})
