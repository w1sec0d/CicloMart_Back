const bcrypt = require('bcrypt')
const db = require('../database/connection')

// Obtiene todos los usuarios
const getUsuarios = (request, response) => {
  try {
    db.query('SELECT * FROM usuario', (error, results) => {
      if (error) {
        console.error('Error ejecutando la consulta', error)
        return response.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message,
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        results,
      })
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
const getUsuarioById = (request, response) => {
  try {
    const id = parseInt(request.params.id)

    if (isNaN(id)) {
      return response.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
      })
    }

    db.query(
      'SELECT * FROM usuario WHERE idUsuario = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Error ejecutando la consulta', error)
          return response.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Usuario obtenido exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error en el servidor', error)
    return response.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

const getUsuarioPhoto = (request, response) => {
  try {
    const idUser = parseInt(request.params.id)

    if (isNaN(idUser)) {
      return response.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
      })
    }

    const query = 'SELECT url FROM imagen WHERE idUsuario = ?'

    db.query(query, [idUser], (error, results) => {
      if (error) {
        console.error('Error ejecutando la consulta', error)
        return response.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message,
        })
      }

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

    db.query(
      'INSERT INTO usuario (nombre, apellido, correo, password, fechaRegistro) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, passwordHash, new Date()],
      (error, results) => {
        if (error) {
          console.error('Error ejecutando la consulta', error)
          return response.status(500).json({
            success: false,
            message: 'Error en el servidor, intentalo más tarde',
            error: error.message,
          })
        }

        const idUsuario = results.insertId

        db.query(
          'INSERT INTO carrito (idUsuario) VALUES (?)',
          [idUsuario],
          (error, results) => {
            if (error) {
              console.error('Error ejecutando la consulta', error)
              return response.status(500).json({
                success: false,
                message: 'Error en el servidor, intentalo más tarde',
                error: error.message,
              })
            }
            return response.status(201).json({
              success: true,
              message: 'Usuario añadido satisfactoriamente',
            })
          }
        )
      }
    )
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
const updateUsuarioFoto = (request, response) => {
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

    // Usar INSERT ... ON DUPLICATE KEY UPDATE para insertar o actualizar la URL de la foto
    const query = `
      INSERT INTO imagen (idUsuario, url) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE url = VALUES(url)
    `

    db.query(query, [idUser, photoUrl], (error, results) => {
      if (error) {
        console.error('Error ejecutando la consulta', error)
        return response.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Foto del usuario actualizada correctamente',
      })
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
const updateUsuario = (request, response) => {
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

    db.query(query, values, (error, results) => {
      if (error) {
        console.error('Error ejecutando la consulta', error)
        return response.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente',
      })
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

    db.query(query, values, (error, results) => {
      if (error) {
        console.error('Error actualizando dirección:', error)
        return res.status(500).json({
          success: false,
          message: 'Error actualizando dirección',
          error: error.message,
        })
      }
      console.log('results', results)
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
