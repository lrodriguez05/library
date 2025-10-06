const db = require("./db");

class Biblioteca {
  constructor(nombre) {
    this.nombre = nombre;
  }

  async agregarLibro(titulo, autor, id_sede) {
    const query = `INSERT INTO libros (titulo, autor, prestado, id_sede) VALUES (?, ?, 0, ?)`;

    return new Promise((resolve, reject) => {
      db.run(query, [titulo, autor, id_sede], function (err) {
        if (err) {
          console.error("Ocurrio un error al agregar el libro: ", err.message);
          return reject(err);
        }
        console.log(`Libro agregado con el ID: ${this.lastID}`);
        resolve(this.lastID);
      });
    });
  }

  async prestarLibro(id) {
    const queryCheck = `SELECT * FROM libros WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.all(queryCheck, [id], (err, libro) => {
        if (err) {
          console.log(`Error al obtener libros: `, err.message);
          return reject(err);
        }
        if (libro.length === 0) {
          console.log(`No se ha encontrado un libro con el ID: ${id}`);
          return reject(new Error("No se ha encontrado el libro solicitado"));
        }
        db.run(`UPDATE libros SET prestado = 1 WHERE id = ?`, [id], (err) => {
          if (err) {
            console.log(`Ocurrio un error: `, err.message);
            return reject(err);
          }
          console.log("Libro prestado correctamente");
        });
        resolve(libro);
      });
    });
  }

  async devolverLibro(id) {
    const queryCheck = `SELECT * FROM libros WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.all(queryCheck, [id], (err, libro) => {
        if (err) {
          console.log(`Error al obtener libros: `, err.message);
          return reject(err);
        }
        if (libro.length === 0) {
          console.log(`No se ha encontrado un libro con el ID: ${id}`);
          return reject(new Error("No se ha encontrado el libro solicitado"));
        }
        db.run(`UPDATE libros SET prestado = 0 WHERE id = ?`, [id], (err) => {
          if (err) {
            console.log(`Ocurrio un error: `, err.message);
            return reject(err);
          }
          console.log("Libro devuelto correctamente");
        });
        resolve(libro);
      });
    });
  }

  async verLibros() {
    const query = `
     SELECT libros.id, libros.titulo, libros.autor, libros.prestado, sedes.nombre AS sede
     FROM libros
     LEFT JOIN sedes ON libros.id_sede = sedes.id
    `;

    return new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) {
          console.log("Error al obtener libros: ", err.message);
          return reject(err);
        }
        if (rows.length === 0) {
          console.log("No hay libros en la biblioteca");
        } else {
          console.log("Listado de libros");
          rows.forEach((libro) => {
            console.log(
              `ID: ${libro.id} | Titulo: ${libro.titulo} | Autor: ${
                libro.autor
              } | Sede: ${libro.sede || "Ninguna"} | Estado: ${
                libro.prestado ? "Prestado" : "Disponible"
              } `
            );
          });
        }
        resolve(rows);
      });
    });
  }

  async porId(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM libros WHERE id = ?`, [id], (err, libro) => {
        if (err) {
          console.log("Ocurrio un error al obtener el libro", err.message);
          return reject(err);
        }
        if (!libro) {
          console.log("Libro no encontrado");
          return reject(new Error("Libro no encontrado"));
        }
        resolve(libro);
      });
    });
  }

  async porSede(id) {
    const query = `
     SELECT libros.id, libros.titulo, libros.autor, libros.prestado, sedes.nombre AS sede
     FROM libros
     LEFT JOIN sedes ON libros.id_sede = sedes.id
     WHERE libros.id_sede = ?
    `;
    return new Promise((resolve, reject) => {
      db.all(query, [id], (err, rows) => {
        if (err) {
          console.log("Error al obtener libros: ", err.message);
          return reject(err);
        }
        if (rows.length === 0) {
          console.log("No hay libros en esta sede");
        } else {
          console.log(`Listado de libros en la sede ${id}`);
          rows.forEach((libro) => {
            console.log(
              `ID: ${libro.id} | Titulo: ${libro.titulo} | Autor: ${
                libro.autor
              } | Sede: ${libro.sede || "Ninguna"} | Estado: ${
                libro.prestado ? "Prestado" : "Disponible"
              } `
            );
          });
        }
        resolve(rows);
      });
    });
  }

  async eliminarLibro(id) {
    const queryCheck = `SELECT * FROM libros WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.get(queryCheck, [id], (err, libro) => {
        if (err) {
          console.log("Error en obtener libros", err.message);
          return reject(err);
        }
        if (!libro) {
          console.log("Libro no encontrado");
          return reject(new Error("Libro no encontrado"));
        }
        if (libro.prestado) {
          console.log("No se puede eliminar un libro prestado");
          return resolve(false);
        }
        db.run(`DELETE FROM libros WHERE id = ?`, [id], (err) => {
          if (err) {
            console.log("Error al eliminar libro", err.message);
            return reject(err);
          }
          console.log("Libro eliminado");
          resolve(true);
        });
      });
    });
  }

  async crearSede(nombre) {
    const queryCheck = `SELECT * FROM sedes WHERE nombre = ?`;
    return new Promise((resolve, reject) => {
      db.get(queryCheck, [nombre], (err, row) => {
        if (err) {
          console.log("Ocurrio un error al verificar la sede:", err.message);
          return reject(err);
        }
        if (row) {
          return reject(new Error("La sede ya existe"));
        }
        const queryInsert = `INSERT INTO sedes (nombre) VALUES (?)`;
        db.run(queryInsert, [nombre], function (err) {
          if (err) {
            console.log("Ocurrio un error al crear la sede:", err.message);
            return reject(err);
          }
          console.log(`Sede creada exitosamente con el ID: ${this.lastID}`);
          resolve(this.lastID);
        });
      });
    });
  }

  async listarSedes() {
    const query = `SELECT * FROM sedes`;
    return new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) {
          console.log("Ocurrio un error al obtener sedes:", err.message);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}
module.exports = Biblioteca;
