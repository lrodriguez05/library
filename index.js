const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const libRoutes = require("./routes/lib/lib");
const auth = require("./routes/middleware/token");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", authRoutes);
app.use("/lib", auth, libRoutes);

// Ruta de prueba
app.get("/", (_, res) => {
  res.send("Servidor funcionando correctamente");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
