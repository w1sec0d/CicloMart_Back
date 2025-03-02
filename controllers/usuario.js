const bcrypt = require('bcrypt')
const db = require('../database/connection')

// Helper function to execute a query and return a promise
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

// Obtiene todos los usuarios
const getUsuarios = async (request, response) => {
  try {
    const results = await executeQuery('SELECT * FROM usuario', [])
    return response.status(200).json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      results,
    })
  } catch (error) {
    console.error('Error en el servidor', error)
    return response.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

// Obtiene un usuario por su ID
const getUsuarioById = async (request, response) => {
  try {
    const id = parseInt(request.params.id)

    if (isNaN(id)) {
      return response.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
      })
    }

    const results = await executeQuery('SELECT * FROM usuario WHERE idUsuario = ?', [id])
    return response.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      results,
    })
  } catch (error) {
    console.error('Error en el servidor', error)
    return response.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

const getUsuarioPhoto = async (request, response) => {
  try {
    const idUser = parseInt(request.params.id)

    if (isNaN(idUser)) {
      return response.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
      })
    }

    const query = 'SELECT url FROM imagen WHERE idUsuario = ?'
    const results = await executeQuery(query, [idUser])

    if (results.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Foto no encontrada para el usuario especificado',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Foto del usuario obtenida exitosamente',
      photoUrl: results[0].url,
    })
  } catch (error) {
    console.error('Error en el servidor', error)
    return response.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

// Registra un nuevo usuario
const registerUsuario = async (request, response) => {
  try {
    const { nombre, apellido, email, password } = request.body

    if (!nombre || !apellido || !email || !password) {
      return response.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const insertUsuarioQuery = 'INSERT INTO usuario (nombre, apellido, correo, password, fechaRegistro) VALUES (?, ?, ?, ?, ?)'
    const usuarioResults = await executeQuery(insertUsuarioQuery, [nombre, apellido, email, passwordHash, new Date()])

    const idUsuario = usuarioResults.insertId

    return response.status(201).json({
      success: true,
      message: 'Usuario añadido satisfactoriamente',
      data: {
        idUsuario,
      },
    })
  } catch (error) {
    console.error('Error en el servidor', error)
    return response.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

// Actualiza la foto de un usuario
const updateUsuarioFoto = async (request, response) => {
  try {
    const photoUrl = request.body.photoUrl
    const idUser = parseInt(request.params.idUsuario)

    if (!photoUrl) {
      return response.status(400).json({
        success: false,
        message: 'No se proporcionó una URL de la foto',
      })
    }

    if (isNaN(idUser)) {
      return response.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
      })
    }

    const query = `
      INSERT INTO imagen (idUsuario, url) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE url = VALUES(url)
    `
    await executeQuery(query, [idUser, photoUrl])

    return response.status(200).json({
      success: true,
      message: 'Foto del usuario actualizada correctamente',
    })
  } catch (error) {
    console.error('Error en el servidor', error)
    return response.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

// Actualiza los datos de un usuario
const updateUsuario = async (request, response) => {
  try {
    const id = parseInt(request.params.id)
    const fields = request.body

    if (isNaN(id)) {
      return response.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
      })
    }

    const validFields = [
      'nombre',
      'apellido',
      'edad',
      'rol',
      'correo',
      'direccion',
      'telefono',
      'username',
      'password',
      'foto',
    ]
    const updates = []
    const values = []

    // Construir la lista de campos a actualizar y sus valores correspondientes
    for (const field of validFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = ?`)
        values.push(fields[field])
      }
    }

    if (updates.length === 0) {
      return response.status(400).json({
        success: false,
        message: 'No se proporcionaron campos a actualizar',
      })
    }

    values.push(id)

    // Construir la consulta SQL dinámica
    const query = `UPDATE usuario SET ${updates.join(', ')} WHERE idUsuario = ?`
    await executeQuery(query, values)

    return response.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
    })
  } catch (error) {
    console.error('Error en el servidor', error)
    return response.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

const updateUsuarioDireccion = async (req, res) => {
  const {
    direccionNombre,
    direccionNumero,
    codigoPostal,
    direccionCiudad,
    direccionApartamento,
    direccionPiso,
  } = req.body
  const idUsuario = req.params.idUsuario

  try {
    const query = `
      UPDATE usuario
      SET direccionNombre = ?, direccionNumero = ?, codigoPostal = ?, direccionCiudad = ?, direccionApartamento = ?, direccionPiso = ?
      WHERE idUsuario = ?
    `
    const values = [
      direccionNombre,
      direccionNumero,
      codigoPostal,
      direccionCiudad,
      direccionApartamento,
      direccionPiso,
      idUsuario,
    ]

    const results = await executeQuery(query, values)

    res.status(200).json({
      success: true,
      message: 'Dirección actualizada exitosamente',
      data: {
        direccionNombre,
        direccionNumero,
        codigoPostal,
        direccionCiudad,
        direccionApartamento,
        direccionPiso,
      },
      results,
    })
  } catch (error) {
    console.error('Error actualizando dirección:', error)
    res.status(500).json({
      success: false,
      message: 'Error actualizando dirección',
      error: error.message,
    })
  }
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  getUsuarioPhoto,
  registerUsuario,
  updateUsuarioFoto,
  updateUsuario,
  updateUsuarioDireccion,
}
