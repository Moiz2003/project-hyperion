'use strict'

const multer = require('multer')
const { CONFIG } = require('../config')

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'])

const _multer = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CONFIG.maxFileSizeMB * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true)
    cb(Object.assign(new Error(`Unsupported file type: ${file.mimetype}`), { status: 415 }))
  },
})

function singleUpload(fieldName) {
  const handler = _multer.single(fieldName)
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (!err) return next()
      console.warn('[upload] multer error:', err.code, err.message, { field: err.field, status: err.status })
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ status: 'error', message: `File exceeds ${CONFIG.maxFileSizeMB}MB limit` })
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ status: 'error', message: `Unexpected field: ${err.field || 'unknown'}. Use "xray_image"` })
      }
      err.status = err.status || 400
      next(err)
    })
  }
}

function arrayUpload(fieldName, maxCount = 5) {
  const handler = _multer.array(fieldName, maxCount)
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (!err) return next()
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ status: 'error', message: `A file exceeds ${CONFIG.maxFileSizeMB}MB limit` })
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ status: 'error', message: `Too many files. Maximum is ${maxCount}` })
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ status: 'error', message: `Unexpected field: ${err.field || 'unknown'}. Use "${fieldName}"` })
      }
      err.status = err.status || 400
      next(err)
    })
  }
}

const upload = { single: singleUpload, array: arrayUpload }

module.exports = { upload }
