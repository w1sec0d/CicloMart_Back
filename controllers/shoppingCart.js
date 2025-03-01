const db = require('../database/connection')

// Helper function to execute a query and return a promise
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

// Obtiene el carrito de un usuario
const getShoppingCart = async (request, response) => {
  const { id } = request.params
  const idUsuario = parseInt(id)

  if (isNaN(idUsuario)) {
    return response.status(400).json({
      success: false,
      message: 'ID usuario inválido',
    })
  }

  try {
    const results = await executeQuery(
      'SELECT * FROM vista_productos_carrito_usuario WHERE idUsuario = ?',
      [idUsuario]
    )
    return response.status(200).json({
      success: true,
      message: 'Carrito obtenido con exito',
      results,
    })
  } catch (error) {
    console.error('Error realizando la consulta ', error)
    return response.status(500).json({
      success: false,
      message: 'Error obteniendo carrito',
      error: error.message,
    })
  }
}

const addToShoppingCart = async (request, response) => {
  const { idUsuario, idProducto, cantidad } = request.body

  if (isNaN(idUsuario) || isNaN(idProducto) || isNaN(cantidad)) {
    return response.status(400).json({
      success: false,
      message: 'Datos inválidos',
    })
  }

  try {
    const carritoResults = await executeQuery(
      'SELECT idCarrito FROM carrito WHERE idUsuario = ?',
      [idUsuario]
    )

    if (carritoResults.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Carrito no encontrado',
      })
    }

    const idCarrito = carritoResults[0].idCarrito

    const productoResults = await executeQuery(
      'SELECT * FROM producto WHERE idProducto = ?',
      [idProducto]
    )

    if (productoResults.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      })
    }

    const producto = productoResults[0]

    const carritoProductoResults = await executeQuery(
      'SELECT * FROM carritoProducto WHERE idCarrito = ? AND idProducto = ?',
      [idCarrito, idProducto]
    )

    if (carritoProductoResults.length > 0) {
      const nuevaCantidad = carritoProductoResults[0].cantidad + cantidad
      const results = await executeQuery(
        'UPDATE carritoProducto SET cantidad = ? WHERE idCarrito = ? AND idProducto = ?',
        [nuevaCantidad, idCarrito, idProducto]
      )
      return response.status(200).json({
        success: true,
        message: 'Cantidad del producto actualizada en el carrito',
        results,
      })
    } else {
      const results = await executeQuery(
        'INSERT INTO carritoProducto (idCarrito, idProducto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [idCarrito, idProducto, cantidad, producto.precio]
      )
      return response.status(201).json({
        success: true,
        message: 'Producto agregado al carritoProducto',
        results,
      })
    }
  } catch (error) {
    console.error('Error realizando la consulta ', error)
    return response.status(500).json({
      success: false,
      message: 'Error procesando la solicitud',
      error: error.message,
    })
  }
}

const removeFromShoppingCart = async (request, response) => {
  const { idUsuario, idProducto } = request.params

  if (isNaN(idUsuario) || isNaN(idProducto)) {
    return response.status(400).json({
      success: false,
      message: 'Datos inválidos',
    })
  }

  try {
    const carritoResults = await executeQuery(
      'SELECT idCarrito FROM carrito WHERE idUsuario = ?',
      [idUsuario]
    )

    if (carritoResults.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Carrito no encontrado',
      })
    }

    const idCarrito = carritoResults[0].idCarrito

    const results = await executeQuery(
      'DELETE FROM carritoProducto WHERE idCarrito = ? AND idProducto = ?',
      [idCarrito, idProducto]
    )

    if (results.affectedRows === 0) {
      return response.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Producto eliminado del carrito',
    })
  } catch (error) {
    console.error('Error realizando la consulta ', error)
    return response.status(500).json({
      success: false,
      message: 'Error eliminando producto del carrito',
      error: error.message,
    })
  }
}

module.exports = { getShoppingCart, addToShoppingCart, removeFromShoppingCart }
