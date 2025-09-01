const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("biblioteca.db");

db.run(`CREATE TABLE IF NOT EXISTS sedes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS libros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    prestado INTEGER DEFAULT 0,
    id_sede INTEGER,
    FOREIGN KEY (id_sede) REFERENCES sedes(id)
)`);

db.run(
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE,password TEXT)`
);

module.exports = db;
