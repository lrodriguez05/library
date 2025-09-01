const express = require("express");
const cors = require("cors");
const db = require("./db"); // <-- Importa la base de datos
const authRoutes = require("./routes/auth"); // <-- Importa las rutas
const librosRoutes = require("./routes/libros");
const sedesRoutes = require("./routes/sedes");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", authRoutes(db)); // <-- Inyecta la base de datos en las rutas
app.use("/", librosRoutes);
app.use("/", sedesRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
