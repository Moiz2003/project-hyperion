require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/api', (_req, res) => {
  res.status(200).json({ message: 'Hyperion API is running' })
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
