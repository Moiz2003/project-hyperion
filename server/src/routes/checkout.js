'use strict'

const { Router } = require('express')
const { createCheckoutSession } = require('../controllers/checkoutController')

const router = Router()

router.post('/create-checkout-session', createCheckoutSession)

module.exports = router
