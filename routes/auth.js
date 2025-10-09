const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

// Registro
router.post("/register", async (req, res) => {
  const { name, last_name, username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (name, last_name, username, password) VALUES (?, ?, ?, ?)`,
      [name, last_name, username, hashedPassword],
      function (err) {
        if (err) {
          return res
            .status(400)
            .json({ message: "Ese nombre de usuario ya esta en uso" });
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
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.json({
          message: "Login exitoso",
          token,
        });
      } else {
        res.status(401).json({ message: "Usuario o contraseña incorrecta" });
      }
    }
  );
});

module.exports = router;
