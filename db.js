const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("biblioteca.db");

// Crear tablas
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
    id_sede INTEGER,
    FOREIGN KEY (id_sede) REFERENCES sedes(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS prestamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_libro INTEGER,
    usuario TEXT,
    fecha_prestamo TEXT,
    fecha_devolucion TEXT,
    devuelto INTEGER DEFAULT 0,
    FOREIGN KEY (id_libro) REFERENCES libros(id),
    FOREIGN KEY (usuario) REFERENCES users(id)
)`);

db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  )`
);
const ensureAdmin = async () => {
  const hashedPassword = await bcrypt.hash("123", 10);

  db.run(
    `INSERT OR IGNORE INTO users (name, last_name, username, password, role) 
     VALUES (?, ?, ?, ?, ?)`,
    ["Admin", "System", "admin", hashedPassword, "admin"],
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
