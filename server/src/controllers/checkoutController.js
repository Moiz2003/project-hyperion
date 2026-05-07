'use strict'

const Stripe = require('stripe')
const { logger } = require('../utils/logger')

const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = (typeof stripeKey === 'string' && (stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_')))
  ? new Stripe(stripeKey)
  : null

async function createCheckoutSession(req, res) {
  if (!stripe) {
    return res.status(500).json({
      status: 'error',
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
    res.status(200).json({ url: session.url })
  } catch (err) {
    logger.error({ err: err.message }, 'Stripe checkout error')
    res.status(500).json({ status: 'error', message: 'Unable to start checkout right now.' })
  }
}

module.exports = { createCheckoutSession }
