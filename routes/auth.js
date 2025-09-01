const express = require("express");
const bcrypt = require("bcrypt");

module.exports = (db) => {
  const router = express.Router();

  // Registro
  router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashedPassword],
        function (err) {
          if (err) {
            return res.status(400).json({ message: "Usuario ya existe" });
          }
          res.json({ message: "Usuario creado con éxito" });
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  });

  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    db.get(
      `SELECT * FROM users WHERE username = ?`,
      [username],
      async (err, user) => {
        if (err)
          return res.status(500).json({ message: "Error en la base de datos" });
        if (!user)
          return res.status(404).json({ message: "Usuario no encontrado" });

        const match = await bcrypt.compare(password, user.password);
        if (match) {
          res.json({ message: "Login exitoso", username: user.username });
        } else {
          res.status(401).json({ message: "Contraseña incorrecta" });
        }
      }
    );
  });

  return router;
};
