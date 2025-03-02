const db = require('../database/connection')
const { refund } = require('../utils/mercadoPago')

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

const handleError = (res, error, message) => {
  console.error(message, error)
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: error.message,
  })
}

const getPurchasesById = async (req, res) => {
  const { idComprador } = req.params
  if (!idComprador)
    return res
      .status(400)
      .json({ success: false, message: 'Falta el id del comprador' })

  try {
    db.query(
      'SELECT * FROM vista_compras_usuario WHERE idUsuario = ?',
      [idComprador],
      (error, results) => {
        if (error) {
          console.error('Error ejecutando la consulta', error)
          return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
          })
        }
        return res.status(200).json({
          success: true,
          message: 'Compras obtenidas exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las compras' })
  }
}

const confirmShipment = async (req, res) => {
  const { idCarrito } = req.params
  if (!idCarrito)
    return res
      .status(400)
      .json({ success: false, message: 'Falta el id del carrito' })

  try {
    db.query(
      'UPDATE carrito SET estado = "Enviado" WHERE idCarrito = ?',
      [idCarrito],
      (error, results) => {
        if (error) {
          console.error('Error ejecutando la consulta', error)
          return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
          })
        }
        return res.status(200).json({
          success: true,
          message: 'Compra confirmada exitosamente',
        })
      }
    )
  } catch (error) {
    res.status(500).json({ message: 'Error al confirmar la compra' })
  }
}

const cancelPurchase = async (req, res) => {
  const { idCarrito } = req.params
  if (!idCarrito) {
    return res
      .status(400)
      .json({ success: false, message: 'Falta el id del carrito' })
  }

  try {
    // Obtiene el id del pago para cancelarlo
    const results = await query(
      'SELECT idPago FROM carrito WHERE idCarrito = ?',
      [idCarrito]
    )
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Compra no encontrada' })
    }

    const idPago = results[0].idPago
    console.log('idPago', idPago)
    if (idPago) {
      try {
        const refundResponse = await refund.create({ payment_id: idPago })
        console.log('refundResponse', refundResponse)
      } catch (error) {
        return handleError(res, error, 'Error al cancelar el pago')
      }
    }

    // Actualiza el estado del carrito a fallido
    await query('UPDATE carrito SET estado = "reembolsado" WHERE idCarrito = ?', [
      idCarrito,
    ])
    res.status(200).json({
      success: true,
      message: 'Compra cancelada exitosamente',
    })
  } catch (error) {
    handleError(res, error, 'Error ejecutando la consulta')
  }
}

module.exports = {
  getPurchasesById,
  cancelPurchase,
  confirmShipment,
}
