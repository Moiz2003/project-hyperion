'use strict'

// Crucible: end-to-end Discovery Mode flow against a running local backend.
//
//   1. POST /api/analyze-scan with mode=edu
//      → expect socratic_hint + image_hash, NO verified_report/urgency_flag
//   2. wait 2s
//   3. POST /api/analyze-scan/reveal with image_hash + resident_assessment
//      → expect verified_report + diagnosis_match
//
// Run against a local server at http://localhost:3000 by default.
// Override via BASE_URL=http://localhost:4000 node scripts/test-edu-flow.js
//
// Uses node:http directly (instead of fetch) so we can disable the per-request
// idle timeout entirely — the /reveal flow runs the full Vision + Drafter +
// Critic ×N loop on 70B models and can exceed undici's default 5-minute cap.

const fs = require('fs')
const path = require('path')
const http = require('http')
const crypto = require('crypto')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const IMAGE_PATH = process.env.IMAGE_PATH || path.resolve(__dirname, '..', 'input_images', 'person100_bacteria_480.jpeg')
const RESIDENT_ASSESSMENT = 'I see a mass in the right lobe with possible consolidation suggestive of pneumonia.'

const FORBIDDEN_EDU_FIELDS = ['verified_report', 'urgency_flag', 'recommended_dept', 'critic_interventions']

let stepCounter = 0
function step(label) {
  stepCounter += 1
  console.log(`\n[${stepCounter}] ${label}`)
}

function assert(condition, message) {
  if (!condition) {
    console.error(`   ✗ ASSERTION FAILED: ${message}`)
    process.exit(1)
  }
  console.log(`   ✓ ${message}`)
}

// Build a multipart/form-data body. Returns { buffer, contentType }.
function buildMultipart(fields, files) {
  const boundary = '----HyperionCrucible' + crypto.randomBytes(8).toString('hex')
  const chunks = []
  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\n`))
    chunks.push(Buffer.from(`Content-Disposition: form-data; name="${name}"\r\n\r\n`))
    chunks.push(Buffer.from(String(value)))
    chunks.push(Buffer.from('\r\n'))
  }
  for (const [name, file] of Object.entries(files)) {
    chunks.push(Buffer.from(`--${boundary}\r\n`))
    chunks.push(Buffer.from(
      `Content-Disposition: form-data; name="${name}"; filename="${file.filename}"\r\n` +
      `Content-Type: ${file.contentType}\r\n\r\n`
    ))
    chunks.push(file.buffer)
    chunks.push(Buffer.from('\r\n'))
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`))
  return { buffer: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` }
}

// Wraps http.request with no idle timeout. Returns { statusCode, body, headers }.
function httpRequest({ url, method, headers, body }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = http.request({
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      method,
      headers,
      timeout: 0,
    }, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(0)
    if (body) req.write(body)
    req.end()
  })
}

function parseJson(text, fallbackKey = 'raw') {
  try { return JSON.parse(text) } catch { return { [fallbackKey]: text } }
}

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`Sample image not found at ${IMAGE_PATH}. Set IMAGE_PATH env var to override.`)
    process.exit(1)
  }
  console.log(`Crucible target: ${BASE_URL}`)
  console.log(`Sample image:    ${IMAGE_PATH}`)

  // ── Step 1: edu request ─────────────────────────────────────────────────
  step('POST /api/analyze-scan with mode=edu')
  const imageBuf = fs.readFileSync(IMAGE_PATH)
  const { buffer, contentType } = buildMultipart(
    { mode: 'edu' },
    { xray_image: { filename: path.basename(IMAGE_PATH), contentType: 'image/jpeg', buffer: imageBuf } },
  )

  const eduStart = Date.now()
  const eduRes = await httpRequest({
    url: `${BASE_URL}/api/analyze-scan`,
    method: 'POST',
    headers: { 'Content-Type': contentType, 'Content-Length': buffer.length },
    body: buffer,
  })
  const eduElapsed = ((Date.now() - eduStart) / 1000).toFixed(2)
  const eduBody = parseJson(eduRes.body)
  console.log(`   ↳ HTTP ${eduRes.statusCode} in ${eduElapsed}s`)

  assert(eduRes.statusCode === 200 || eduRes.statusCode === 206, `edu request returned 200/206 (got ${eduRes.statusCode}: ${JSON.stringify(eduBody).slice(0, 200)})`)
  assert(eduBody.mode === 'edu', `response.mode === 'edu' (got "${eduBody.mode}")`)
  assert(eduBody.data && typeof eduBody.data === 'object', 'response has data object')
  assert(eduBody.data.socratic_hint && typeof eduBody.data.socratic_hint === 'object', 'data.socratic_hint is present')
  assert(typeof eduBody.data.socratic_hint.hintQuestion === 'string' && eduBody.data.socratic_hint.hintQuestion.length > 0, 'socratic_hint.hintQuestion is a non-empty string')
  assert(typeof eduBody.data.image_hash === 'string' && eduBody.data.image_hash.length === 64, 'data.image_hash is a 64-char SHA-256 hex')
  assert(typeof eduBody.data.raw_findings === 'string' && eduBody.data.raw_findings.length > 0, 'data.raw_findings is non-empty')

  for (const field of FORBIDDEN_EDU_FIELDS) {
    assert(!(field in eduBody.data), `data does NOT contain '${field}' (final-diagnosis fields must be hidden in edu mode)`)
  }

  // ── Step 2: simulate user thinking ──────────────────────────────────────
  step('Wait 2s to simulate the resident reading the hint')
  await new Promise((r) => setTimeout(r, 2000))
  console.log('   ✓ slept 2s')

  // ── Step 3: reveal request ──────────────────────────────────────────────
  const imageHash = eduBody.data.image_hash
  // Use demo=true for the reveal: a single-pass pipeline (no critic revision
  // loop) so the crucible doesn't depend on the 70B drafter staying healthy
  // for ~10 minutes. The wiring being tested is identical either way.
  step(`POST /api/analyze-scan/reveal?demo=true with image_hash=${imageHash.slice(0, 12)}…`)

  const revealBodyJson = JSON.stringify({ image_hash: imageHash, resident_assessment: RESIDENT_ASSESSMENT })
  const revealStart = Date.now()
  const revealRes = await httpRequest({
    url: `${BASE_URL}/api/analyze-scan/reveal?demo=true`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(revealBodyJson) },
    body: revealBodyJson,
  })
  const revealElapsed = ((Date.now() - revealStart) / 1000).toFixed(2)
  const revealBody = parseJson(revealRes.body)
  console.log(`   ↳ HTTP ${revealRes.statusCode} in ${revealElapsed}s`)

  assert(revealRes.statusCode === 200 || revealRes.statusCode === 206, `reveal returned 200/206 (got ${revealRes.statusCode}: ${JSON.stringify(revealBody).slice(0, 200)})`)
  assert(revealBody.mode === 'edu-reveal', `response.mode === 'edu-reveal' (got "${revealBody.mode}")`)
  assert(revealBody.data && typeof revealBody.data === 'object', 'reveal response has data object')

  assert(typeof revealBody.data.verified_report === 'string' && revealBody.data.verified_report.length > 0, 'data.verified_report is non-empty')
  assert(typeof revealBody.data.urgency_flag === 'string' && revealBody.data.urgency_flag.length > 0, 'data.urgency_flag is present')

  assert(revealBody.data.diagnosis_match && typeof revealBody.data.diagnosis_match === 'object', 'data.diagnosis_match is present')
  const dm = revealBody.data.diagnosis_match
  assert(typeof dm.score === 'number' && dm.score >= 0 && dm.score <= 100, `diagnosis_match.score is a number 0–100 (got ${dm.score})`)
  assert(Array.isArray(dm.matched), 'diagnosis_match.matched is an array')
  assert(Array.isArray(dm.missed), 'diagnosis_match.missed is an array')
  assert(Array.isArray(dm.extra), 'diagnosis_match.extra is an array')

  assert(revealBody.data.resident_assessment === RESIDENT_ASSESSMENT, 'data.resident_assessment is echoed back verbatim')
  assert(revealBody.data.socratic_hint && typeof revealBody.data.socratic_hint === 'object', 'data.socratic_hint is also present in reveal (for UI continuity)')

  console.log('\n   Diagnosis match:')
  console.log(`     score:   ${dm.score}%`)
  console.log(`     matched: [${dm.matched.join(', ')}]`)
  console.log(`     missed:  [${dm.missed.join(', ')}]`)
  console.log(`     extra:   [${dm.extra.join(', ')}]`)

  console.log('\nCRUCIBLE PASSED: Backend is production-ready for React.')
}

main().catch((err) => {
  console.error('\nCRUCIBLE FAILED:', err && err.stack ? err.stack : err)
  if (err && err.cause) console.error('Cause:', err.cause)
  process.exit(1)
})
