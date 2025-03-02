const axios = require('axios')
const db = require('../database/connection')
require('dotenv').config()

const oauthCallback = async (req, res) => {
  const { code, state } = req.query
  try {
    // Descomponer el state para obtener el randomId y el idUsuario
    const [randomId, idUsuario] = decodeURIComponent(state).split(',')

    const oauthBody = {
      client_secret: process.env.MP_CLIENT_SECRET,
      client_id: process.env.MP_CLIENT_ID,
      code: code,
      redirect_uri: process.env.MP_REDIRECT_URL,
      test_token: true,
      grant_type: 'authorization_code',
    }
    // Enviar la solicitud a la API de MercadoPago usando axios
    const oauthResponse = await axios.post(
      'https://api.mercadopago.com/oauth/token',
      oauthBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('oauthResponse', oauthResponse.data)

    // Guardar los tokens y el user_id en la base de datos
    const { access_token, public_key, refresh_token, user_id } =
      oauthResponse.data

    await db.query(
      'UPDATE usuario SET mp_access_token = ?, mp_refresh_token = ?, mp_user_id = ?, mp_public_key = ?, rol = "vendedor" WHERE idUsuario = ?',
      [access_token, refresh_token, user_id, public_key, idUsuario],
      (error, results) => {
        if (error) {
          console.error('Error actualizando el usuario', error)
          return res
            .status(500)
            .json({
              success: false,
              message: 'Error interno del servidor',
              error: error.message,
            })
        }
      }
    )
    const frontendURL = process.env.FRONTEND_URL
    // Redirigir a la página de notificación
    return res.redirect(
      frontendURL + '/requestResult/sellerRegistrationSuccess'
    )
  } catch (error) {
    console.error('Error obteniendo el access_token', error)
    res
      .status(500)
      .json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      })
  }
}

module.exports = {
  oauthCallback,
}
