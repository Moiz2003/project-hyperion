'use strict'

const { z } = require('zod')

const ALLOWED_MODES = ['clinical', 'edu']

const analyzeScanSchema = z.object({
  file: z.object({
    buffer: z.instanceof(Buffer),
    mimetype: z.string(),
    size: z.number().positive(),
  }, { required_error: 'xray_image file is required' }),
  mode: z.enum(ALLOWED_MODES).optional(),
})

function validateAnalyzeScan(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'xray_image file is required' })
  }
  const rawMode = (req.body && req.body.mode) || (req.query && req.query.mode)
  if (rawMode !== undefined && rawMode !== '' && !ALLOWED_MODES.includes(rawMode)) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid mode "${rawMode}". Allowed: ${ALLOWED_MODES.join(', ')}.`,
    })
  }
  const result = analyzeScanSchema.safeParse({
    file: req.file,
    mode: rawMode || undefined,
  })
  if (!result.success) {
    const message = result.error.issues.map(e => e.message).join('; ')
    return res.status(400).json({ status: 'error', message })
  }
  next()
}

const revealSchema = z.object({
  image_hash: z.string({ message: 'image_hash is required' }).min(1, 'image_hash must not be empty'),
  resident_assessment: z.string().optional(),
})

function validateReveal(req, res, next) {
  const body = req.body || {}
  const result = revealSchema.safeParse({
    image_hash: body.image_hash,
    resident_assessment: body.resident_assessment,
  })
  if (!result.success) {
    const message = result.error.issues.map(e => e.message).join('; ')
    return res.status(400).json({ status: 'error', message })
  }
  next()
}

module.exports = { validateAnalyzeScan, validateReveal, ALLOWED_MODES }
