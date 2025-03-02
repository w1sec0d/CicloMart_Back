// Objetos de configuración de MercadoPago
const {
  MercadoPagoConfig,
  Preference,
  PaymentRefund,
  OAuth,
} = require('mercadopago')

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    idempotencyKey:
      Math.random().toString(36).substring(2) + Date.now().toString(36),
  },
})

const preference = new Preference(mercadoPagoClient)
const refund = new PaymentRefund(mercadoPagoClient)
const oauth = new OAuth(mercadoPagoClient)

module.exports = { mercadoPagoClient, preference, refund, oauth }
