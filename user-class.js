const db = require("./db");

class UserGestor {
  constructor() {
    this.db = db;
  }

  async changeUserPassword(userId, newPassword, oldPassword) {
    const bcrypt = require("bcrypt");
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return new Promise((resolve, reject) => {
      const confirmQuery = `SELECT * FROM users WHERE id = ?`;
      db.get(confirmQuery, [userId], async (err, user) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("Usuario no encontrado"));

        const isOldPasswordCorrect = await bcrypt.compare(
          oldPassword,
          user.password
        );
        if (!isOldPasswordCorrect) {
          return reject(new Error("La contraseña antigua es incorrecta"));
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
          return reject(
            new Error("La nueva contraseña no puede ser igual a la anterior")
          );
        }

        const updateQuery = `UPDATE users SET password = ? WHERE id = ?`;
        db.run(updateQuery, [hashedNewPassword, userId], function (err) {
          if (err) return reject(err);
          resolve(true);
        });
      });
    });
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
