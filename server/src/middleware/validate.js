'use strict'

const { z } = require('zod')

const analyzeScanSchema = z.object({
  file: z.object({
    buffer: z.instanceof(Buffer),
    mimetype: z.string(),
    size: z.number().positive(),
  }, { required_error: 'xray_image file is required' }),
})

function validateAnalyzeScan(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'xray_image file is required' })
  }
  const result = analyzeScanSchema.safeParse({ file: req.file })
  if (!result.success) {
    const message = result.error.errors.map(e => e.message).join('; ')
    return res.status(400).json({ status: 'error', message })
  }
  next()
}

module.exports = { validateAnalyzeScan }
