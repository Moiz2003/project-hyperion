const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const Stripe = require('stripe')

const app = express()
const PORT = process.env.PORT || 3000
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const hasValidStripeKey = typeof stripeSecretKey === 'string'
  && (stripeSecretKey.startsWith('sk_') || stripeSecretKey.startsWith('rk_'))
const stripe = hasValidStripeKey ? new Stripe(stripeSecretKey) : null

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/api', (_req, res) => {
  res.status(200).json({ message: 'Hyperion API is running' })
})

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        message: 'Stripe is not configured. Set a valid STRIPE_SECRET_KEY (sk_... or rk_...) on the server.',
      })
    }

    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
              name: 'Hyperion Clinician Pro Trial',
              description: 'Clinician Pro plan billed monthly',
            },
            unit_amount: 19900,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
      metadata: {
        plan: 'clinician-pro',
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return res.status(500).json({ message: 'Unable to start checkout right now.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
