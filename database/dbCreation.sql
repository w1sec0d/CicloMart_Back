-- Script generado por dbdiagram.io
-- Inicializa la base de datos ciclomart en mysql workbench 8.0

-- Recomiendo crear un esquema aparte para probar
DROP DATABASE IF EXISTS ciclomart2;
CREATE DATABASE ciclomart2;
USE ciclomart2;

CREATE TABLE `usuario` (
  `idUsuario` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellido` varchar(45) NOT NULL,
  `fechaNacimiento` date,
  `rol` ENUM ('comprador', 'vendedor', 'administrador') DEFAULT 'comprador',
  `correo` varchar(255) NOT NULL,
  `codigoPostal` varchar(30),
  `direccionNombre` varchar(255),
  `direccionNumero` varchar(255),
  `direccionPiso` varchar(30),
  `direccionApartamento` varchar(30),
  `direccionCiudad` varchar(255) DEFAULT 'Bogotá',
  `telefono` varchar(60),
  `username` varchar(45),
  `password` varchar(64) NOT NULL,
  `reporte` boolean DEFAULT (false),
  `fechaRegistro` datetime DEFAULT (current_timestamp),
  `mp_user_id` varchar(100),
  `mp_access_token` varchar(100),
  `mp_refresh_token` varchar(100),
  `mp_public_key` varchar(100)
);

CREATE TABLE `bicicleta` (
  `idBicicleta` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tipoBicicleta` varchar(45),
  `color` varchar(45),
  `genero` varchar(45),
  `edad` varchar(45),
  `tamañoMarco` varchar(45),
  `materialMarco` varchar(45),
  `tamañoRueda` varchar(45),
  `tipoFrenos` varchar(45),
  `velocidades` varchar(45),
  `suspension` varchar(45),
  `transmision` varchar(45),
  `tipoPedales` varchar(45),
  `manubrio` varchar(45),
  `pesoBicicleta` float,
  `pesoMaximo` float,
  `extras` text
);

CREATE TABLE `marca` (
  `idMarca` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  INDEX `nombre` (`nombre`)
);

CREATE TABLE `modelo` (
  `idModelo` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `tipo` ENUM ('bicicleta', 'componente', 'accesorio', 'otro') NOT NULL DEFAULT 'bicicleta',
  `descripcion` text NOT NULL,
  `categoria` varchar(100),
  `compatibilidad` text,
  `idBicicleta` int,
  `idMarca` int,
  FOREIGN KEY (`idBicicleta`) REFERENCES `bicicleta` (`idBicicleta`),
  FOREIGN KEY (`idMarca`) REFERENCES `marca` (`idMarca`),
  INDEX `idMarca` (`idMarca`),
  INDEX `nombre` (`nombre`)
);

CREATE TABLE `tienda` (
  `idTienda` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioAdministrador` int NOT NULL,
  `nombre` varchar(255),
  `descripcion` text,
  `telefono` varchar(60),
  FOREIGN KEY (`idUsuarioAdministrador`) REFERENCES `usuario` (`idUsuario`),
  INDEX `nombre` (`nombre`)
);

CREATE TABLE `documento` (
  `idDocumento` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` int NOT NULL,
  `idUsuario` int,
  `tipo` varchar(60),
  `descripcion` text,
  `estado` varchar(60),
  `fechaCompra` date,
  FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  INDEX `idUsuario` (`idUsuario`)
);

CREATE TABLE `producto` (
  `idProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idModelo` int NOT NULL,
  `idVendedor` int,
  `idTienda` int,
  `exposicion` int DEFAULT 0,
  `precio` float,
  `precioCompleto` float,
  `cantidad` int DEFAULT 0,
  `ventas` int DEFAULT 0,
  `estado` ENUM ('nuevo', 'usado') DEFAULT 'nuevo',
  `dimensiones` varchar(255),
  `disponibilidad` ENUM ('disponible', 'vendido', 'reservado') DEFAULT 'disponible',
  `costoEnvio` float NOT NULL DEFAULT 0,
  `retiroEnTienda` bool NOT NULL DEFAULT false,
  `fechaPublicacion` datetime DEFAULT (current_timestamp),
  FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`),
  FOREIGN KEY (`idVendedor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`)
);  

CREATE TABLE `imagen` (
  `idImagen` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuario` int UNIQUE,
  `idDocumento` int,
  `idModelo` int,
  `url` varchar(255),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idDocumento`) REFERENCES `documento` (`idDocumento`),
  FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`idModelo`),
  INDEX `imagen_modelo` (`idModelo`),
  INDEX `imagen_documento` (`idDocumento`),
  INDEX `imagen_usuario` (`idUsuario`)
);

CREATE TABLE `carrito` (
  `idCarrito` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idPreferencia` varchar(255) UNIQUE,
  `idPago` varchar(255) UNIQUE,
  `idVendedor` int NOT NULL,
  `idComprador` int NOT NULL,
  `estado` ENUM('pendiente_pago', 'pendiente_envio', 'enviado', 'recibido', 'fallido', 'reembolsado') DEFAULT 'pendiente_pago',
  `metodoPago` varchar(45),
  `precioTotal` float,
  `fecha` datetime DEFAULT (current_timestamp),
  `direccionEnvio` varchar(255),
  FOREIGN KEY (`idVendedor`) REFERENCES `usuario`(`idUsuario`),
  FOREIGN KEY (`idComprador`) REFERENCES `usuario`(`idUsuario`),
  INDEX (`idPreferencia`)
);

CREATE TABLE `carritoProducto` (
  `idCarritoProducto` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idCarrito` int NOT NULL,
  `idPago` varchar(255),
  `idPreferencia` varchar(255),
  `idProducto` int NOT NULL,
  `cantidad` int DEFAULT 1,
  `fecha` datetime DEFAULT (current_timestamp),
  FOREIGN KEY (`idCarrito`) REFERENCES `carrito` (`idCarrito`),
  FOREIGN KEY (`idPago`) REFERENCES `carrito` (`idPago`),
  FOREIGN KEY (`idPreferencia`) REFERENCES `carrito` (`idPreferencia`),
  FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`)
);

CREATE TABLE `pregunta` (
  `idPregunta` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idProducto` int NOT NULL,
  `idUsuario` int NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `respuesta` varchar(255),
  FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  INDEX `idProducto` (`idProducto`),
  INDEX `idUsuario` (`idUsuario`)
);

CREATE TABLE `calificacion` (
  `idCalificacion` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioComprador` int NOT NULL,
  `idUsuarioVendedor` int,
  `idProducto` int NOT NULL,
  `idTienda` int,
  `foto` varchar(255),
  `comentario` text,
  `nota` int,
  `fecha` datetime DEFAULT (current_timestamp),
  FOREIGN KEY (`idUsuarioComprador`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idUsuarioVendedor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  FOREIGN KEY (`idTienda`) REFERENCES `tienda` (`idTienda`),
  INDEX `idUsuarioComprador` (`idUsuarioComprador`),
  INDEX `fk_calificacion_usuario1_idx` (`idUsuarioVendedor`)
);

CREATE TABLE `mensaje` (
  `idMensaje` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` int NOT NULL,
  `idUsuarioReceptor` int NOT NULL,
  `idCarritoProducto` int NOT NULL,
  `contenido` text,
  `fecha` datetime,
  FOREIGN KEY (`idUsuarioEmisor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idUsuarioReceptor`) REFERENCES `usuario` (`idUsuario`),
  FOREIGN KEY (`idCarritoProducto`) REFERENCES `carritoProducto` (`idCarritoProducto`),
  INDEX `idUsuarioEmisor` (`idUsuarioEmisor`),
  INDEX `fk_mensaje_usuario1_idx` (`idUsuarioReceptor`)
);

------------------------------------------------------------
-- Inserts
------------------------------------------------------------
-- Insertar usuarios de muestra
INSERT INTO `usuario` (`nombre`, `apellido`, `fechaNacimiento`, `rol`, `correo`, `direccionNombre`,`telefono`, `username`, `password`)
VALUES 
('Juan', 'Perez', '1985-05-15', 'comprador', 'juan.perez@ejemplo.com', 'Calle 123, Bogotá', '3001234567', 'juanp', '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.'),
('Maria', 'Gomez', '1990-08-22', 'vendedor', 'maria.gomez@ejemplo.com', 'Carrera 45, Medellín', '3107654321', 'mariag', '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.'),
('Carlos', 'Lopez', '1978-11-30', 'administrador', 'carlos.lopez@ejemplo.com', 'Avenida 10, Cali', '3209876543', 'carlosl', '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.');

INSERT INTO `usuario` VALUES
('4', 'Ronald', 'Ramírez', '2003-07-15', 'vendedor', 'vendedor@gmail.com', '110881', 'Calle 324', '48-50 Sur', '', '', 'Bogota', NULL, NULL, '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.', '0', '2025-03-01 14:51:26', '1025146485', 'TEST-7255018865819969-030116-23eb1d70ba61f02f9cee879c5752771d-1025146485', 'TG-67c367cb78aa6200011e1699-1025146485', 'TEST-46820db6-ac0c-42bd-9eac-b09db1a04d81'),
('5', 'Johan', 'Madrid', NULL, 'comprador', 'comprador@gmail.com', '110881', 'Calle 324', '48-50 Sur', '', '', 'Bogota', NULL, NULL, '$2b$10$TbLwUaHLc9Pw6hEa8ZqojOgfzzEVjNuGOGLBezxVWTdU7W0r4weE.', '0', '2025-03-01 15:13:31', NULL, NULL, NULL, NULL);

-- Insertar marcas de muestra
INSERT INTO `marca` (`nombre`)
VALUES 
('Trek'),
('Specialized'),
('Giant'),
('Shimano'),
('Bontrager');

-- Insertar modelos de muestra
INSERT INTO `modelo` (`nombre`, `tipo`, `descripcion`, `categoria`, `compatibilidad`, `idMarca`)
VALUES 
('Trek Marlin 7', 'bicicleta', 'Bicicleta de montaña para senderos', 'MTB', 'Compatible con componentes Shimano', 1),
('Specialized Allez', 'bicicleta', 'Bicicleta de carretera para carreras', 'Carretera', 'Compatible con componentes Shimano', 2),
('Giant Defy Advanced', 'bicicleta', 'Bicicleta de carretera de resistencia', 'Carretera', 'Compatible con componentes Shimano', 3),
('Plato Shimano Deore XT', 'componente', 'Monoplato mtb', 'Transmisión', 'Compatible con bicicletas de montaña', 4),
('Pacha Shimano Altus', 'componente', 'Pacha altus de 8 velocidades', 'Transmisión', 'Compatible con bicicletas de carretera', 4),
('Shimano 105', 'componente', 'Grupo de transmisión de 10 velocidades', 'Transmisión', 'Compatible con bicicletas de carretera', 4),
('Casco Bontrager Starvos', 'accesorio', 'Casco de ciclismo de carretera', 'Casco', 'Talla única', 1),
('Casco Specialized Propero', 'accesorio', 'Casco de ciclismo de carretera', 'Casco', 'Talla única', 2),
('Casco Giant Rev', 'accesorio', 'Casco de ciclismo de carretera', 'Casco', 'Talla única', 3),
('Neumático MTB rin 26"', 'componente', 'Neumatico rin 26"', 'Neumáticos', 'Compatible con bicicletas de montaña', null),
('Zapatas de freno Genéricas', 'componente', 'Zapatas para cualquier bicicleta de frenos en herradura', 'Frenos', 'Compatible con cualquier bicicleta', null);

-- Insertar imágenes de muestra
INSERT INTO `imagen` (`idUsuario`, `idModelo`, `url`)
VALUES 
(null, 1, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739199906/ukc7nxqc5hm79o4utb39.png'),
(null, 2, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739200194/qhvxoj4ggjp1qrdn1fpd.png'),
(null, 3, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739200646/iyqe0j8piameldruninf.png'),
(null, 4, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739201523/td7nvl10zjctewo5jgld.png'),
(null, 5, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739201377/d10mnzoi5xp8ibs1apvm.png'),
(null, 6, ''),
(null, 7, ''),
(null, 8, ''),
(null, 9, ''),
(null, 10, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1739203206/dgeumsxzyrlqv3kzqdw6.png'),
(null, 11, 'https://res.cloudinary.com/drfmpnhaz/image/upload/v1740430801/pxjassqtrzvnbrpovqur.png');

-- Insertar bicicletas de muestra
INSERT INTO `bicicleta` (`tipoBicicleta`, `color`, `genero`, `edad`, `tamañoMarco`, `materialMarco`, `tamañoRueda`, `tipoFrenos`, `velocidades`, `suspension`, `transmision`, `tipoPedales`, `manubrio`, `pesoBicicleta`, `pesoMaximo`, `extras`)
VALUES 
('MTB', 'Negra', 'Unisex', 'Adulto', 'M', 'Aluminio', '29"', 'Disco', '21', 'Delantera', 'Shimano', 'Plataforma', 'Plano', 14.5, 120, 'Portabotellas'),
('Carretera', 'Azul', 'Unisex', 'Adulto', 'L', 'Carbono', '28"', 'Caliper', '22', 'Ninguna', 'Shimano', 'Sin clip', 'Caída', 8.5, 100, 'Ninguno'),
('Carretera','Azul','Unisex','Adulto','M','Carbono','28"','Caliper','22','Ninguna','Shimano','Sin clip','Caída',8.5,100,'Ninguno');

-- Insertar tiendas de muestra
INSERT INTO `tienda` (`idUsuarioAdministrador`, `nombre`, `descripcion`, `telefono`)
VALUES 
(3, 'Tienda de Bicis Bogotá', 'La mejor tienda de bicicletas en Bogotá', '3001234567');

-- Insertar productos de muestra
INSERT INTO `producto` (`idModelo`, `idVendedor`, `idTienda`, `precio`, `precioCompleto`, `cantidad`,`ventas`, `estado`, `disponibilidad`, `costoEnvio`, `retiroEnTienda`)
VALUES 
(1, 4, null, 3000000, 3300000, 10,0, 'nuevo', 'disponible', 50.00, false),
(2, 4, null, 2400000, 3000000, 5,2, 'nuevo', 'disponible', 0, false),
(3, 4, null, 11000000, null, 3,10, 'nuevo', 'disponible', 50.00, false),
(4, 4, null, 290000, 300000, 20,4, 'nuevo', 'disponible', 0, false),
(5, 4, null, 120000, null, 15,0, 'nuevo', 'disponible', 0, false),
(6, 4, null, 1500000, null, 5,0, 'nuevo', 'disponible', 0, false),
(7, 4, null, 300000, null, 10,0, 'nuevo', 'disponible', 0, false),
(8, 4, null, 460000, 500000, 5,0, 'nuevo', 'disponible', 0, false),
(9, 4, null, 60000, null, 3,0, 'nuevo', 'disponible', 0, false),
(10, 4, null, 5000, null, 15,9, 'nuevo', 'disponible', 0, false),
(11, 4, null, 10000, 20000, 10,6, 'nuevo', 'disponible', 0, false);

-- Insertar pagos de muestra
INSERT INTO `carrito` (`idPreferencia`, `idPago`, `idVendedor`, `idComprador`, `estado`, `metodoPago`, `precioTotal`, `fecha`, `direccionEnvio`)
VALUES 
(1, 1, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(2, 2, 2, 2, 'pendiente_pago', 'PayPal', 800.00, NOW(), 'Carrera 45, Medellín'),
(3, 3, 2, 3, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(4, 4, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(5, 5, 2, 2, 'pendiente_pago', 'PayPal', 800.00, NOW(), 'Carrera 45, Medellín'),
(6, 6, 2, 3, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(7, 7, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(8, 8, 2, 2, 'pendiente_pago', 'PayPal', 800.00, NOW(), 'Carrera 45, Medellín'),
(9, 9, 2, 3, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá'),
(10, 10, 2, 1, 'pendiente_pago', 'Tarjeta de Crédito', 1500.00, NOW(), 'Calle 123, Bogotá');

-- Insertar productos del carrito de muestra
INSERT INTO `carritoProducto` (`idCarrito`,`idPago`, `idProducto`, `idPreferencia`, `cantidad`, `fecha`)
VALUES 
(1, 1, 1, 1, 2, NOW()),
(1, 2, 2, 2, 1, NOW()),
(1, 3, 3, 3, 1, NOW()),
(1, 4, 4, 4, 3, NOW()),
(1, 5, 5, 5, 2, NOW()),
(1, 6, 6, 6, 1, NOW()),
(1, 7, 7, 7, 2, NOW()),
(1, 8, 8, 8, 1, NOW()),
(1, 9, 9, 9, 1, NOW()),
(1, 10, 10, 10, 3, NOW());

-- Insertar calificaciones de muestra
INSERT INTO `calificacion` (`idUsuarioComprador`, `idUsuarioVendedor`, `idProducto`, `idTienda`, `foto`, `comentario`, `nota`)
VALUES 
(2, 1, 1, 1, '', '¡Excelente bicicleta!', 5),
(3, 2, 2, 1, '', 'Muy satisfecho', 4),
(1, 2, 2, 1, '', 'La bici es buena pero es muy pesada', 3),
(2,1,10,null, null, 'Muy buen producto, voy tres meses y no me he pinchado', 5),
(3,1,10,null, null, 'Muy malo, me pinche a la primera salida', 1);

-- Insertar calificaciones de muestra
INSERT INTO `calificacion` (`idUsuarioComprador`, `idUsuarioVendedor`, `idProducto`, `idTienda`, `foto`, `comentario`, `nota`)
VALUES 
(1, 2, 1, 1, '', '¡Excelente bicicleta!', 5),
(2, 3, 2, 1, '', 'Muy satisfecho', 4),
(3, 2, 2, 1, '', 'La bici es buena pero es muy pesada', 3),
(2,1,10,null, null, 'Muy buen producto, voy tres meses y no me he pinchado', 5),
(3,1,10,null, null, 'Muy malo, me pinche a la primera salida', 1);

-- Insertar mensajes de muestra
INSERT INTO `mensaje` (`idUsuarioEmisor`, `idUsuarioReceptor`, `idCarritoProducto`, `contenido`, `fecha`)
VALUES 
(1, 2, 1, '¿La bicicleta sigue disponible?', NOW()),
(2, 1, 2, 'Sí, todavía está disponible.', NOW());

------------------------------------------------------------
-- Vistas
------------------------------------------------------------
-- Vista de productos en carrito completa
DROP VIEW IF EXISTS vista_productos_carrito_usuario;
CREATE VIEW vista_productos_carrito_usuario AS
SELECT 
    usuario.idUsuario,
    usuario.nombre as usuario,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    carritoProducto.idPago,
    carritoProducto.idPreferencia,
    producto.idModelo,
    producto.costoEnvio,
    modelo.nombre
FROM 
    carrito
JOIN 
    usuario ON carrito.idComprador = usuario.idUsuario
JOIN 
    carritoProducto ON carritoProducto.idPago = carrito.idPago
JOIN 
    producto ON producto.idProducto = carritoProducto.idProducto
JOIN 
    modelo ON modelo.idModelo = producto.idModelo
WHERE  
    carrito.estado = 'pendiente_pago'
ORDER BY 
    carrito.fecha DESC;


-- Crear la vista consolidada
DROP VIEW IF EXISTS vista_completa_producto;
CREATE VIEW vista_completa_producto AS
SELECT 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre,
    modelo.tipo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria,
    modelo.compatibilidad,
    bicicleta.idBicicleta,
    bicicleta.tipoBicicleta,
    bicicleta.color,
    bicicleta.genero,
    bicicleta.edad,
    bicicleta.tamañoMarco,
    bicicleta.materialMarco,
    bicicleta.tamañoRueda,
    bicicleta.tipoFrenos,
    bicicleta.velocidades,
    bicicleta.suspension,
    bicicleta.transmision,
    bicicleta.tipoPedales,
    bicicleta.manubrio,
    bicicleta.pesoBicicleta,
    bicicleta.pesoMaximo,
    bicicleta.extras,
    marca.idMarca,
    marca.nombre AS nombreMarca,
    imagen.idImagen,
    imagen.url AS imagenURL,
    usuario.idUsuario AS idVendedor,
    usuario.nombre AS nombreVendedor,
    usuario.apellido AS apellidoVendedor,
    usuario.correo AS correoVendedor,
    imagen_vendedor.url AS fotoVendedor
FROM 
    producto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    bicicleta ON modelo.idModelo = bicicleta.idBicicleta
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    imagen ON modelo.idModelo = imagen.idModelo
LEFT JOIN 
    usuario ON producto.idVendedor = usuario.idUsuario
LEFT JOIN 
    imagen AS imagen_vendedor ON usuario.idUsuario = imagen_vendedor.idUsuario
ORDER BY 
    producto.ventas DESC;

DROP VIEW IF EXISTS vista_producto_calificacion;
CREATE VIEW vista_producto_calificacion AS
SELECT 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre AS nombreModelo,
    modelo.tipo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria,
    modelo.compatibilidad,
    marca.idMarca,
    marca.nombre AS nombreMarca,
    calificacion.idCalificacion,
    calificacion.nota AS puntuacion,
    calificacion.comentario,
    calificacion.foto,
    calificacion.fecha AS fechaCalificacion
FROM 
    producto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
RIGHT JOIN 
    calificacion ON producto.idProducto = calificacion.idProducto
ORDER BY 
    producto.ventas DESC;

DROP VIEW IF EXISTS vista_producto_calificacion_promedio;
CREATE VIEW vista_producto_calificacion_promedio AS
SELECT 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre AS nombreModelo,
    modelo.tipo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria,
    modelo.compatibilidad,
    marca.idMarca,
    marca.nombre AS nombreMarca,
    ROUND(AVG(calificacion.nota), 1) AS avg_calificacion
FROM 
    producto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    calificacion ON producto.idProducto = calificacion.idProducto
GROUP BY 
    producto.idProducto,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad,
    producto.ventas,
    producto.estado,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.idModelo,
    modelo.nombre,
    modelo.tipo,
    modelo.descripcion,
    modelo.categoria,
    modelo.compatibilidad,
    marca.idMarca,
    marca.nombre
ORDER BY 
    producto.ventas DESC;

DROP VIEW IF EXISTS vista_compras_pendientes;
CREATE VIEW vista_compras_pendientes AS
SELECT 
    usuario.idUsuario,
    usuario.nombre,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    carritoProducto.idPago,
    carritoProducto.idPreferencia,
    carrito.estado AS estadoCarrito,
    carrito.metodoPago,
    carrito.precioTotal AS precioCarrito,
    carrito.direccionEnvio
FROM 
    usuario
JOIN 
    carrito ON usuario.idUsuario = carrito.idVendedor
JOIN 
    carritoProducto ON carrito.idPago = carritoProducto.idPago
WHERE 
    carrito.estado = 'pendiente_pago'
ORDER BY 
    carrito.fecha DESC;

DROP VIEW IF EXISTS vista_compras_usuario;
CREATE VIEW vista_compras_usuario AS
SELECT 
    usuario.idUsuario,
    usuario.nombre,
    usuario.apellido,
    usuario.correo,
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    producto.precio AS precioProducto,
    producto.estado AS estadoProducto,
    producto.disponibilidad AS disponibilidadProducto,
    modelo.nombre AS nombreModelo,
    modelo.tipo AS tipoModelo,
    modelo.descripcion AS descripcionModelo,
    marca.nombre AS nombreMarca,
    imagen.url AS imagenModelo,
    carrito.estado AS estadoCarrito,
    carrito.metodoPago,
    carrito.precioTotal AS precioCarrito,
    carrito.direccionEnvio
FROM 
    usuario
JOIN 
    carrito ON usuario.idUsuario = carrito.idComprador
JOIN 
    carritoProducto ON carrito.idCarrito = carritoProducto.idCarrito
JOIN 
    producto ON carritoProducto.idProducto = producto.idProducto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    imagen ON modelo.idModelo = imagen.idModelo
ORDER BY 
    carrito.fecha DESC;

DROP VIEW IF EXISTS vista_ventas_usuario;
CREATE VIEW vista_ventas_usuario AS
SELECT 
    carrito.idCarrito,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idProducto,
    carritoProducto.idPago,
    carritoProducto.idPreferencia,
    producto.idVendedor,
    usuario.nombre AS nombreVendedor,
    usuario.apellido AS apellidoVendedor,
    usuario.correo AS correoVendedor
FROM 
    carrito
JOIN 
    carritoProducto ON carrito.idPago = carritoProducto.idPago
JOIN 
    producto ON carritoProducto.idProducto = producto.idProducto
JOIN 
    usuario ON producto.idVendedor = usuario.idUsuario
ORDER BY 
    carrito.fecha DESC;

DROP VIEW IF EXISTS vista_calificaciones_productos_vendedor;
CREATE VIEW vista_calificaciones_productos_vendedor AS
SELECT 
    u.idUsuario,
    u.nombre,
    u.apellido,
    u.correo,
    u.fechaRegistro,
    u.reporte,
    c.idCalificacion,
    c.idUsuarioComprador,
    c.idUsuarioVendedor,
    c.idProducto,
    c.idTienda,
    c.foto,
    c.comentario,
    c.nota,
    c.fecha,
    iv.url AS imagenVendedor,
    ic.url AS imagenComprador,
    cu.nombre AS nombreComprador,
    cu.apellido AS apellidoComprador
FROM 
    usuario u
LEFT JOIN 
    calificacion c ON u.idUsuario = c.idUsuarioVendedor 
LEFT JOIN 
    usuario cu ON cu.idUsuario = c.idUsuarioComprador
LEFT JOIN 
    imagen iv ON iv.idUsuario = u.idUsuario
LEFT JOIN 
    imagen ic ON ic.idUsuario = c.idUsuarioComprador;

-- Vista de productos asociados a un carrito
DROP VIEW IF EXISTS vista_productos_carrito;
CREATE VIEW vista_productos_carrito AS
SELECT 
    carrito.idCarrito,
    carrito.idComprador,
    producto.idVendedor,
    carrito.estado,
    carrito.fecha,
    carrito.precioTotal,
    carritoProducto.idCarritoProducto,
    carritoProducto.idProducto,
    carritoProducto.cantidad,
    producto.idModelo,
    producto.precio,
    producto.precioCompleto,
    producto.cantidad AS cantidadProducto,
    producto.ventas,
    producto.estado AS estadoProducto,
    producto.disponibilidad,
    producto.costoEnvio,
    producto.retiroEnTienda,
    producto.fechaPublicacion,
    modelo.nombre AS nombreModelo,
    modelo.tipo AS tipoModelo,
    modelo.descripcion AS descripcionModelo,
    modelo.categoria AS categoriaModelo,
    modelo.compatibilidad AS compatibilidadModelo,
    marca.nombre AS nombreMarca,
    imagen.url AS imagenModelo
FROM 
    carrito
JOIN 
    carritoProducto ON carrito.idCarrito = carritoProducto.idCarrito
JOIN 
    producto ON carritoProducto.idProducto = producto.idProducto
JOIN 
    modelo ON producto.idModelo = modelo.idModelo
LEFT JOIN 
    marca ON modelo.idMarca = marca.idMarca
LEFT JOIN 
    imagen ON modelo.idModelo = imagen.idModelo
WHERE
    carrito.estado = 'pendiente_pago'
ORDER BY 
    carrito.fecha DESC;


------------------------------------------------
-- Procedimientos almacenados
------------------------------------------------

DELIMITER //

CREATE PROCEDURE cambiarEstadoCarrito(
    IN p_idCarrito INT,
    IN p_nuevoEstado ENUM('pendiente', 'exitosa', 'fallida')
)
BEGIN
    -- Actualizar el estado del carrito
    UPDATE carrito
    SET estado = p_nuevoEstado
    WHERE idCarrito = p_idCarrito;

    -- Verificar si la actualización fue exitosa
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se encontró el carrito o no se pudo actualizar el estado';
    END IF;
END //

DELIMITER ;
