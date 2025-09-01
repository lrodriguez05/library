const express = require("express");
const Biblioteca = require("../../class");
const router = express.Router();

const biblioteca = new Biblioteca("Jose Marti");

router.post("/sedes/crearSede", async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const sedeId = await biblioteca.crearSede(nombre);

    res.status(201).json({ message: "Sede agregada exitosamente", id: sedeId });
  } catch (error) {
    if (error.message === "La sede ya existe") {
      return res.status(400).json({ message: "La sede ya existe" });
    }
    res
      .status(500)
      .json({ message: "Error al agregar la sede", error: error.message });
  }
});

module.exports = router;
