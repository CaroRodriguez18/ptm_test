-- Crear base de datos
CREATE DATABASE IF NOT EXISTS crud_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crud_app;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS producto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  precio DECIMAL(10,2) NOT NULL,
  cantidad INT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1
);

-- Datos de ejemplo opcionales
INSERT INTO producto (nombre, descripcion, precio, cantidad, activo) VALUES
('A', 'Producto A', 2.00, 5, 1),
('B', 'Producto B', 4.00, 5, 1),
('C', 'Producto C', 6.00, 5, 1),
('D', 'Producto D', 8.00, 5, 1);