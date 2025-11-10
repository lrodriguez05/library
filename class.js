const db = require("./db");

class Biblioteca {
  constructor(nombre) {
    this.nombre = nombre;
  }

  async agregarLibro(
    titulo,
    autor,
    id_sede,
    cantidad,
    detalles,
    edicion,
    anio_publicacion,
    imagen
  ) {
    const query = `INSERT INTO libros (titulo, autor, prestado, id_sede, cantidad, detalles, edicion, anio_publicacion, imagen) VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?)`;

    return new Promise((resolve, reject) => {
      db.run(
        query,
        [
          titulo,
          autor,
          id_sede,
          cantidad,
          detalles,
          edicion,
          anio_publicacion,
          imagen,
        ],
        function (err) {
          if (err) {
            console.error(
              "Ocurrio un error al agregar el libro: ",
              err.message
            );
            return reject(err);
          }
          console.log(`Libro agregado con el ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      );
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
     SELECT libros.*, sedes.nombre AS sede,COUNT(prestamos.id) AS veces_prestado
     FROM libros
     LEFT JOIN sedes ON libros.id_sede = sedes.id
     LEFT JOIN prestamos 
     ON libros.id = prestamos.id_libro AND prestamos.devuelto = 0
     GROUP BY libros.id, libros.titulo
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
              } Cantidad: ${libro.cantidad} Veces prestado: ${
                libro.veces_prestado
              }`
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

  async editarLibro(id, nuevosDatos) {
    const {
      titulo,
      autor,
      id_sede,
      cantidad,
      detalles,
      edicion,
      anio_publicacion,
      imagen,
    } = nuevosDatos;

    const queryCheck = `SELECT * FROM libros WHERE id = ?`;
    const queryUpdate = `
    UPDATE libros 
    SET titulo = ?, autor = ?, id_sede = ?, cantidad = ?, detalles = ?, edicion = ?, anio_publicacion = ?, imagen = ?
    WHERE id = ?
  `;

    return new Promise((resolve, reject) => {
      db.get(queryCheck, [id], (err, libro) => {
        if (err) {
          console.log("Error al buscar el libro:", err.message);
          return reject(err);
        }

        if (!libro) {
          console.log("Libro no encontrado");
          return reject(new Error("Libro no encontrado"));
        }

        // Puedes decidir si permites editar un libro prestado o no
        if (libro.prestado) {
          console.log("No se puede editar un libro prestado");
          return resolve(false);
        }

        // Si el usuario no envía algún dato, se mantiene el valor anterior
        const nuevoTitulo = titulo || libro.titulo;
        const nuevoAutor = autor || libro.autor;
        const nuevaSede = id_sede || libro.id_sede;
        const nuevaCantidad =
          cantidad !== undefined ? cantidad : libro.cantidad;
        const nuevosDetalles = detalles || libro.detalles;
        const nuevaEdicion = edicion || libro.edicion;
        const nuevoAnioPublicacion = anio_publicacion || libro.anio_publicacion;
        const nuevaImagen = imagen || libro.imagen;

        db.run(
          queryUpdate,
          [
            nuevoTitulo,
            nuevoAutor,
            nuevaSede,
            nuevaCantidad,
            nuevosDetalles,
            nuevaEdicion,
            nuevoAnioPublicacion,
            nuevaImagen,
            id,
          ],
          (err) => {
            if (err) {
              console.log("Error al actualizar el libro:", err.message);
              return reject(err);
            }

            console.log("Libro actualizado correctamente");
            resolve(true);
          }
        );
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

  async listaPrestamos() {
    const query = `SELECT * FROM prestamos`;
    return new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) {
          console.log("Ocurrio un error al obtener prestamos:", err.message);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  async listaPrestamosUsuario(id) {
    const query = `SELECT * FROM prestamos WHERE usuario = ?`;
    return new Promise((resolve, reject) => {
      db.all(query, [id], (err, rows) => {
        if (err) {
          console.log("Ocurrio un error al obtener prestamos:", err.message);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  async registrarPrestamo(id, usuario, fecha_devolucion) {
    const queryLibro = `SELECT * FROM libros WHERE id = ?`;
    const queryPrestamosActivos = `
    SELECT COUNT(*) AS total 
    FROM prestamos 
    WHERE id_libro = ? AND devuelto = 0
  `;
    const queryInsert = `
    INSERT INTO prestamos (id_libro, usuario, fecha_prestamo, fecha_devolucion)
    VALUES (?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {
      // 1️⃣ Buscar el libro
      db.get(queryLibro, [id], (err, libro) => {
        if (err) {
          console.error("Error al obtener libro:", err.message);
          return reject(err);
        }

        if (!libro) {
          console.warn("Libro no encontrado");
          return reject(new Error("Libro no encontrado"));
        }

        // 2️⃣ Contar préstamos activos de ese libro
        db.get(queryPrestamosActivos, [id], (err, row) => {
          if (err) {
            console.error("Error al contar préstamos:", err.message);
            return reject(err);
          }

          const prestamosActivos = row.total;

          // 3️⃣ Si ya no hay copias disponibles
          if (prestamosActivos >= libro.cantidad) {
            console.warn("No hay ejemplares disponibles para préstamo.");
            return reject(
              new Error("No hay ejemplares disponibles para préstamo.")
            );
          }

          // 4️⃣ Registrar el nuevo préstamo
          const fechaPrestamo = new Date().toISOString(); // ahora mismo
          const fechaDevolucion = new Date(fecha_devolucion).toISOString();

          db.run(
            queryInsert,
            [id, usuario, fechaPrestamo, fechaDevolucion],
            function (err) {
              if (err) {
                console.error("Error al registrar el préstamo:", err.message);
                return reject(err);
              }

              console.log("Préstamo registrado con ID:", this.lastID);
              resolve(this.lastID);
            }
          );
        });
      });
    });
  }

  async devolverPrestamo(id) {
    const queryCheck = `SELECT * FROM prestamos WHERE id = ?`;
    const queryUpdate = `UPDATE prestamos SET devuelto = 1 WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.get(queryCheck, [id], (err, prestamo) => {
        if (err) {
          console.log("Ocurrio un error al obtener el prestamo", err.message);
          return reject(err);
        }
        if (!prestamo) {
          console.log("No se ha encontrado el prestamo");
          return reject(new Error("No se ha encontrado el prestamo"));
        }
        db.run(queryUpdate, [id], (err) => {
          if (err) {
            console.log(
              "Ocurrio un error al devolver el prestamo",
              err.message
            );
            return reject(err);
          }
          console.log("Prestamo devuelto correctamente");
          resolve(prestamo);
        });
      });
    });
  }

  async listarResenas() {
    const query = `SELECT * FROM resenas`;
    return new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) {
          console.log("Ocurrio un error al obtener reseñas:", err.message);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  async listarResenasLibro(id) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT resenas.*, users.username AS username FROM resenas
        LEFT JOIN users ON resenas.usuario = users.id
        WHERE id_libro = ?`,
        [id],
        (err, resena) => {
          if (err) {
            console.log("Ocurrio un error al obtener la reseña", err.message);
            return reject(err);
          }
          if (!resena) {
            console.log("Reseña no encontrada");
            return reject(new Error("Reseña no encontrada"));
          }
          resolve(resena);
        }
      );
    });
  }

  async crearResena(id_libro, usuario, calificacion, comentario) {
    const queryInsert = `
    INSERT INTO resenas (id_libro, usuario, calificacion, comentario, fecha)
    VALUES (?, ?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {
      const fechaActual = new Date().toISOString();
      db.run(
        queryInsert,
        [id_libro, usuario, calificacion, comentario, fechaActual],
        function (err) {
          if (err) {
            console.log("Ocurrio un error al crear la reseña:", err.message);
            return reject(err);
          }
          console.log(`Reseña creada con el ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      );
    });
  }
}

module.exports = Biblioteca;
