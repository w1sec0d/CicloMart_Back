const { MercadoPagoConfig, Preference } = require('mercadopago')
const db = require('../database/connection')
const calculateFee = require('../utils/calculateFee')

const getProducto = async (req, res) => {
  try {
    db.query('SELECT * FROM vista_completa_producto', (error, results) => {
      if (error) {
        console.error('Error obteniendo productos:', error)
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo productos',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Productos obtenidos exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: error.message,
    })
  }
}

const getBicicletas = async (req, res) => {
  try {
    db.query(
      'SELECT * FROM vista_completa_producto WHERE tipo = "bicicleta"',
      (error, results) => {
        if (error) {
          console.error('Error obteniendo bicicletas:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo bicicletas',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Bicicletas obtenidas exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo bicicletas:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo bicicletas',
      error: error.message,
    })
  }
}

const getComponentes = async (req, res) => {
  try {
    db.query(
      'SELECT * FROM vista_completa_producto WHERE tipo = "componente"',
      (error, results) => {
        if (error) {
          console.error('Error obteniendo bicicletas:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo bicicletas',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Bicicletas obtenidas exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo bicicletas:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo bicicletas',
      error: error.message,
    })
  }
}

const getProductosOferta = async (req, res) => {
  try {
    db.query(
      'SELECT * FROM vista_completa_producto WHERE  precioCompleto IS NOT NULL',
      (error, results) => {
        if (error) {
          console.error('Error obteniendo componentes:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo componentes',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Componentes obtenidos exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo componentes:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo componentes',
      error: error.message,
    })
  }
}

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
      })
    }

    db.query(
      'SELECT * FROM vista_completa_producto WHERE idProducto = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Error obteniendo producto:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo producto',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Producto obtenido exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto',
      error: error.message,
    })
  }
}

const createPreference = async (req, res) => {
  try {
    const { producto, cantidad, idComprador } = req.body
    // OBTENCION DE DATOS DE VENDEDOR Y COMPRADOR

    // Obtener información del vendedor
    const vendedorQuery = 'SELECT * FROM usuario WHERE idUsuario = ?'
    const [vendedor] = await new Promise((resolve, reject) => {
      db.query(vendedorQuery, [producto.idVendedor], (error, results) => {
        if (error) {
          console.error('Error obteniendo vendedor:', error)
          return reject({
            success: false,
            message: 'Error obteniendo vendedor',
            error: error.message,
          })
        }
        resolve(results)
      })
    })
    if (!vendedor || vendedor.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      })
    }

    // Obtener información del comprador
    const compradorQuery = 'SELECT * FROM usuario WHERE idUsuario = ?'
    const [comprador] = await new Promise((resolve, reject) => {
      db.query(compradorQuery, [idComprador], (error, results) => {
        if (error) {
          console.error('Error obteniendo comprador:', error)
          return reject({
            success: false,
            message: 'Error obteniendo comprador',
            error: error.message,
          })
        }
        resolve(results)
      })
    })
    if (!comprador || comprador.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comprador no encontrado',
      })
    }

    // REGISTRO DE PREFERENCIA DE MERCADOPAGO EN LA BASE DE DATOS

    // Crear carrito
    const carritoQuery = `
      INSERT INTO carrito (idPreferencia, idPago, idVendedor, idComprador, estado, metodoPago, precioTotal, fecha, direccionEnvio)
      VALUES (?, ?, ?, ?, 'pendiente_pago', ?, ?, NOW(), ?)
    `
    const carritoValues = [
      null, // idPreferencia
      null, // idPago
      producto.idVendedor,
      idComprador,
      'MercadoPago',
      producto.precio * cantidad,
      'Direccion de envio',
    ]

    const carritoResults = await new Promise((resolve, reject) => {
      db.query(carritoQuery, carritoValues, (error, results) => {
        if (error) {
          console.error('Error creando carrito:', error)
          return reject({
            success: false,
            message: 'Error creando carrito',
            error: error.message,
          })
        }
        resolve(results)
      })
    })

    const carritoId = carritoResults.insertId

    // CREACION DE PREFERENCIA DE MERCADOPAGO

    // Configurar el cliente de MercadoPago con el access_token del vendedor
    const mercadoPagoClient = new MercadoPagoConfig({
      accessToken: vendedor.mp_access_token,
      options: {
        idempotencyKey:
          Math.random().toString(36).substring(2) + Date.now().toString(36),
      },
    })
    const preference = new Preference(mercadoPagoClient)

    const freeShippingBody =
      Number(producto.costoEnvio) === 0 ? [{ id: 73328 }] : []

    const preferenceBody = {
      items: [
        {
          id: producto.idProducto,
          title: producto.nombre,
          description: producto.descripcionModelo,
          picture_url: producto.imagenURL,
          category_id: producto.tipo,
          quantity: Number(cantidad),
          currency_id: 'COP',
          unit_price: Number(producto.precio),
        },
      ],
      payer: {
        name: comprador.nombre,
        surname: comprador.apellido,
        email: comprador.correo,
        phone: {
          area_code: '57',
          number: comprador.telefono,
        },
        address: {
          zip_code: comprador.codigoPostal,
          street_name: comprador.direccionNombre,
          street_number: comprador.direccionNumero,
        },
      },
      payment_methods: {
        default_installments: 1,
      },
      back_urls: {
        success: process.env.FRONTEND_URL + '/requestResult/purchaseComplete',
        failure: process.env.FRONTEND_URL + '/requestResult/purchaseFailed',
        pending: process.env.FRONTEND_URL + '/requestResult/purchasePending',
      },
      notification_url: process.env.BACKEND_URL + '/webhookMercadoLibre',
      statement_descriptor: 'Compra CicloMart',
      auto_return: 'approved',
      external_reference: carritoId,
      marketplace_fee: calculateFee(producto.tipo, producto.precio),
    }

    console.log('preferenceBody', preferenceBody)

    const preferenceResult = await preference.create({ body: preferenceBody })
    const idPreferenciaPago = preferenceResult.id

    // Actualizar carrito con el id de la preferencia
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE carrito SET idPreferencia = ? WHERE idCarrito = ?',
        [idPreferenciaPago, carritoId],
        (error, results) => {
          if (error) {
            console.error('Error actualizando carrito:', error)
            return reject({
              success: false,
              message: 'Error actualizando carrito',
              error: error.message,
            })
          }
          resolve(results)
        }
      )
    })

    // Crear carritoProducto
    const carritoProductoQuery = `
      INSERT INTO carritoProducto (idCarrito, idProducto, cantidad)
      VALUES (?, ?, ?)
    `
    const carritoProductoValues = [
      carritoId,
      producto.idProducto,
      cantidad,
    ]

    await new Promise((resolve, reject) => {
      db.query(
        carritoProductoQuery,
        carritoProductoValues,
        (error, results) => {
          if (error) {
            console.error('Error creando carritoProducto:', error)
            return reject({
              success: false,
              message: 'Error creando carritoProducto',
              error: error.message,
            })
          }
          resolve(results)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'Preferencia de MercadoPago creada exitosamente',
      preferenceId: preferenceResult.id,
      paymentURL: preferenceResult.init_point,
      preferenceResult,
    })
  } catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error)
    res.status(500).json({
      success: false,
      message: 'Error creando preferencia de MercadoPago',
      error: error.message,
    })
  }
}

const publishProducto = async (req, res) => {
  const {
    // Datos para la tabla producto
    idModelo,
    idVendedor,
    idTienda,
    exposicion,
    precio,
    precioCompleto,
    cantidad,
    estado,
    disponibilidad,
    costoEnvio,
    retiro,
    nombre,
    tipo,
    descripcion,
    categoria,
    compatibilidad,
    idMarca,
  } = req.body

  // Convertir valores booleanos a 0 o 1
  const retiroInt = retiro ? 1 : 0
  // Datos para la tabla del tipo correspondiente
  let tipoData = {}
  if (tipo === 'bicicleta') {
    tipoData = {
      idBicicleta: 0,
      tipoBicicleta: req.body.tipoBicicleta,
      color: req.body.color,
      genero: req.body.genero,
      edad: req.body.edad,
      tamañoMarco: req.body.tamañoMarco,
      materialMarco: req.body.materialMarco,
      tamañoRueda: req.body.tamañoRueda,
      tipoFrenos: req.body.tipoFrenos,
      velocidades: req.body.velocidades,
      suspension: req.body.tipoSuspension,
      transmision: req.body.transmision,
      tipoPedales: req.body.tipoPedales,
      manubrio: req.body.tipoManubrio,
      pesoBicicleta:
        req.body.pesoBicicleta != '' ? req.body.pesoBicicleta : null,
      pesoMaximo: req.body.pesoMaximo != '' ? req.body.pesoBicicleta : null,
      extras: req.body.extras,
    }
  }

  try {
    // Insertar en la tabla producto
    const modelColumns = [
      'nombre',
      'tipo',
      'descripcion',
      'categoria',
      'compatibilidad',
      'idMarca',
    ]
    const modelValues = [
      nombre,
      tipo,
      descripcion,
      categoria,
      compatibilidad,
      idMarca,
    ]
    const modelPlaceholders = modelColumns.map(() => '?').join(', ')

    const modelQuery = `INSERT INTO modelo (${modelColumns.join(', ')}) VALUES (${modelPlaceholders})`
    db.query(modelQuery, modelValues, (error, results) => {
      if (error) {
        console.error('Error publicando producto:', error)
        return res.status(500).json({
          success: false,
          message: 'Error al publicar el producto',
        })
      }
      console.log('results', results)
      const modeloId = results.insertId

      if (!modeloId) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener el id del producto',
        })
      }

      const productoColumns = [
        'idModelo',
        'idVendedor',
        'idTienda',
        'exposicion',
        'precio',
        'precioCompleto',
        'cantidad',
        'estado',
        'disponibilidad',
        'costoEnvio',
        'retiroEnTienda',
      ]
      const productoValues = [
        modeloId,
        idVendedor,
        idTienda,
        exposicion,
        precio,
        precioCompleto,
        cantidad,
        estado,
        disponibilidad,
        costoEnvio,
        retiroInt,
      ]
      const productoPlaceholders = productoColumns.map(() => '?').join(', ')

      const productoQuery = `INSERT INTO producto (${productoColumns.join(', ')}) VALUES (${productoPlaceholders})`
      // const [resultProduct] = await db.query(productoQuery, productoValues)
      db.query(productoQuery, productoValues, (error, results) => {
        try {
          // Insertar en la tabla correspondiente
          if (tipo === 'bicicleta') {
            tipoData['idBicicleta'] = modeloId
            const bicicletaColumns = Object.keys(tipoData).filter(
              (key) => tipoData[key] !== undefined
            )
            const bicicletaValues = bicicletaColumns.map((key) => tipoData[key])
            const bicicletaPlaceholders = bicicletaColumns
              .map(() => '?')
              .join(', ')

            const bicicletaQuery = `INSERT INTO bicicleta (${bicicletaColumns.join(', ')}) VALUES (${bicicletaPlaceholders})`

            console.log('bicicletaQuery', bicicletaQuery)
            console.log('values', bicicletaValues)
            db.query(bicicletaQuery, [...bicicletaValues], (error, results) => {
              if (error) {
                console.error('Error publicando producto:', error)
                return res.status(500).json({
                  success: false,
                  message: 'Error al publicar el producto',
                })
              }
            })
          }
          const idProducto = results.insertId
          res.status(200).json({
            success: true,
            message: 'Producto publicado exitosamente',
            idProducto: idProducto,
          })
        } catch (error) {
          console.error('Error publicando producto:', error)
          return res.status(500).json({
            success: false,
            message: 'Error al publicar el producto',
          })
        }
      })
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error al publicar el producto',
    })
  }
}

const getModels = async (req, res) => {
  tipo = req.params.tipo
  id = req.params.id
  try {
    const [models] = await db.query(
      'SELECT nombre FROM modelo WHERE tipo = ? AND idMarca = ?',
      [tipo, id]
    )
    res.status(200).json({
      success: true,
      models,
    })
  } catch (error) {
    console.error('Error obteniendo modelos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo modelos',
    })
  }
}

const getBrands = async (req, res) => {
  try {
    db.query('SELECT * FROM marca', (error, results) => {
      if (error) {
        console.error('Error obteniendo marcas:', error)
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo marcas',
        })
      }

      res.status(200).json({
        success: true,
        results,
      })
    })
  } catch (error) {
    console.error('Error obteniendo marcas:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo marcas',
    })
  }
}

const uploadImage = async (req, res) => {
  try {
    const { idProducto, file } = req.body
    console.log(idProducto, file)

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó una imagen',
      })
    }

    const imageQuery = `
      INSERT INTO imagen (idModelo, url)
      VALUES (?, ?)
    `
    const imageValues = [idProducto, file]

    db.query(imageQuery, imageValues, (error, results) => {
      if (error) {
        console.error('Error subiendo imagen:', error)
        return res.status(500).json({
          success: false,
          message: 'Error subiendo imagen',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    res.status(500).json({
      success: false,
      message: 'Error subiendo imagen',
      error: error.message,
    })
  }
}

const getImages = async (req, res) => {
  try {
    const { idProducto } = req.params
    db.query(
      'SELECT * FROM imagen WHERE idModelo = ?',
      [idProducto],
      (error, results) => {
        if (error) {
          console.error('Error obteniendo imagenes:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo imagenes',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Imagenes obtenidas exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo imagenes:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo imagenes',
      error: error.message,
    })
  }
}

module.exports = {
  getProducto,
  getBicicletas,
  getComponentes,
  getProductosOferta,
  getProductById,
  createPreference,
  publishProducto,
  getModels,
  getBrands,
  uploadImage,
  getImages,
}
