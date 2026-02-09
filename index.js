const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const libRoutes = require("./routes/lib/lib");
const userRoutes = require("./routes/user/user");
const aiRoutes = require("./routes/ai/ai");
const {
  authenticateToken,
  authorizeRole,
} = require("./routes/middleware/token");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", authRoutes);
app.use("/lib", authenticateToken, libRoutes);
app.use("/users", authenticateToken, userRoutes);
app.use("/ai", authenticateToken, aiRoutes);

// Ruta de prueba
app.get("/", (_, res) => {
  res.send("Servidor funcionando correctamente");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
