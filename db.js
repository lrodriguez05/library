const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("biblioteca.db");

db.run(`PRAGMA foreign_keys = ON;`);

// Crear tablas

db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    picture TEXT DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
  )`
);

db.run(`CREATE TABLE IF NOT EXISTS sedes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS libros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    prestado INTEGER DEFAULT 0,
    cantidad INTEGER NOT NULL DEFAULT 1,
    detalles TEXT DEFAULT 'No hay detalles disponibles.',
    edicion TEXT DEFAULT 'Desconocida',
    anio_publicacion TEXT DEFAULT 'Desconocido',
    imagen TEXT DEFAULT 'https://www.klett-cotta.de/assets/default-image.jpg',
    id_sede INTEGER,
    FOREIGN KEY (id_sede) REFERENCES sedes(id)
)`);

// db.run(`DROP TABLE IF EXISTS prestamos`);
//db.run(`DROP TABLE IF EXISTS users`);
// db.run(`DROP TABLE IF EXISTS resenas`);

db.run(`CREATE TABLE IF NOT EXISTS prestamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_libro INTEGER,
    usuario INTEGER,
    fecha_prestamo TEXT,
    fecha_devolucion TEXT,
    devuelto INTEGER DEFAULT 0,
    FOREIGN KEY (id_libro) REFERENCES libros(id),
    FOREIGN KEY (usuario) REFERENCES users(id) ON DELETE CASCADE
)`);

db.run(`CREATE TABLE IF NOT EXISTS resenas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_libro INTEGER,
    usuario INTEGER,
    calificacion INTEGER DEFAULT 0,
    comentario TEXT,
    fecha TEXT,
    editado INTEGER DEFAULT 0,
    FOREIGN KEY (id_libro) REFERENCES libros(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario) REFERENCES users(id) ON DELETE CASCADE
)`);

const ensureAdmin = async () => {
  const hashedPassword = await bcrypt.hash("123", 10);

  db.run(
    `INSERT OR IGNORE INTO users (name, last_name, username, password, role,picture) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      "Admin",
      "System",
      "admin",
      hashedPassword,
      "admin",
      "https://www.shutterstock.com/image-vector/admin-stamp-watermark-scratched-style-600nw-1138728377.jpg",
    ],
    (err) => {
      if (err) {
        console.error("Error al crear admin:", err.message);
      } else {
        console.log("Usuario admin asegurado en DB");
      }
    }
  );
};

ensureAdmin();

module.exports = db;
