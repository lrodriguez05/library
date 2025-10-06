const db = require("./db");

class UserGestor {
  constructor() {
    this.db = db;
  }

  async deleteUser(id) {
    const queryCheck = `SELECT * FROM users WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.get(queryCheck, [id], (err, user) => {
        if (err) {
          console.log("Error en obtener usuarios", err.message);
          return reject(err);
        }
        if (!user) {
          console.log("Usuario no encontrado");
          return reject(new Error("Usuario no encontrado"));
        }

        db.run(`DELETE FROM users WHERE id = ?`, [id], (err) => {
          if (err) {
            console.log("Error al eliminar usuario", err.message);
            return reject(err);
          }
          console.log("Usuario eliminado");
          resolve(true);
        });
      });
    });
  }
  async getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}

module.exports = UserGestor;
