// Configura las rutas de la API
const express = require('express')
const router = express.Router()

// Controladores usuarios
const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
  getUsuarioPhoto,
  updateUsuarioFoto,
  updateUsuario,
  updateUsuarioDireccion,
} = require('../controllers/usuario.js')

const { userInfo } = require('../controllers/userInfo.js')

// Controladores autenticación
const {
  login,
  sendRecover,
  verifyToken,
  updatePassword,
  sendRegisterCode,
  validateCode,
} = require('../controllers/login.js')

// Controladores transaccion
const {
  getTransacciones,
  getCompras,
  getVentas,
} = require('../controllers/transaccion.js')

// Controladores tienda
const { getTiendas } = require('../controllers/tienda.js')

// Controlador de busqueda
const { search } = require('../controllers/search.js')

const {
  getProducto,
  getProductById,
  createPreference,
  publishProducto,
  getModels,
  getBrands,
  uploadImage,
  getImages,
  getBicicletas,
  getComponentes,
  getProductosOferta,
} = require('../controllers/producto.js')

const { createExposurePreference } = require('../controllers/exposicion.js')

// Controladores de calificaciones de productos
const {
  ratingProduct,
  averageProductRatings,
  addRatingProduct,
  checkUserPurchase,
} = require('../controllers/ratingProduct.js')

const { getRatingSeller } = require('../controllers/vistaVendedor.js')
const webhookMercadoLibre = require('../controllers/webhookMercadoLibre.js')

const {
  getShoppingCart,
  addToShoppingCart,
  removeFromShoppingCart,
} = require('../controllers/shoppingCart.js')

const {
  getPurchasesById,
  confirmShipment,
  cancelPurchase,
} = require('../controllers/purchases.js')

const { getQuestions, addQuestion } = require('../controllers/questions.js')

const { oauthCallback } = require('../controllers/oauth.js')

// Rutas usuarios
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.get('/getUsuarioPhoto/:id', getUsuarioPhoto)
router.post('/usuarios', registerUsuario)
router.put('/updateUsuarioFoto/:idUsuario', updateUsuarioFoto)
router.put('/updateUsuario/:id', updateUsuario)
router.put('/updateUsuarioDireccion/:idUsuario', updateUsuarioDireccion)

// Rutas de autenticación
router.post('/login', login)
router.get('/userInfo', userInfo)
router.post('/sendRecover', sendRecover)
router.get('/verifyToken/:token', verifyToken)
router.post('/updatePassword', updatePassword)
router.post('/sendRegisterCode', sendRegisterCode)
router.post('/validateCode', validateCode)

// Rutas de transacciones
router.get('/transacciones', getTransacciones)
router.get('/compras/:id', getCompras)
router.get('/ventas/:id', getVentas)

// Rutas de tienda
router.get('/tiendas', getTiendas)

// Rutas de productos
router.get('/search', search)
router.get('/productos', getProducto)
router.get('/bicicletas', getBicicletas)
router.get('/componentes', getComponentes)
router.get('/ofertas', getProductosOferta)
router.post('/addProduct', publishProducto)
router.get('/models/:tipo/:id', getModels)
router.get('/brands', getBrands)
router.get('/productos/:id', getProductById)
router.post('/uploadImage', uploadImage)
router.get('/images/:id', getImages)
// Mercado Pago
router.post('/createPreference', createPreference)
router.post('/createExposurePreference', createExposurePreference)

//Rutas calificaciones productos
router.get('/ratingProduct/:id', ratingProduct)
router.get('/averageProductRatings/:id', averageProductRatings)
router.post('/addRatingProduct', addRatingProduct)
router.post('/checkUserPurchase/', checkUserPurchase)

//Rutas de vista vendedor
router.get('/ratingSeller/:id', getRatingSeller)

// Ruta de prueba webhook

router.post('/webhookMercadoLibre', webhookMercadoLibre)

router.get('/shoppingCart/:id', getShoppingCart)
router.post('/addToShoppingCart', addToShoppingCart)
router.delete(
  '/removeFromShoppingCart/:idUsuario/:idProducto',
  removeFromShoppingCart
)

// compras
router.get('/purchases/:idComprador', getPurchasesById)
router.post('/confirmShipment/:idCarrito', confirmShipment)
router.post('/cancelPurchase/:idCarrito', cancelPurchase)

router.get('/questions/:idProducto', getQuestions)
router.post('/addQuestion', addQuestion)

// Autenticación oauth
router.get('/oauth/callback', oauthCallback)

module.exports = router
