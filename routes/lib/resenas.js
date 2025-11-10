const express = require("express");
const Biblioteca = require("../../class");
const router = express.Router();

const biblioteca = new Biblioteca("Jose Marti");

router.get("/resenas", async (req, res) => {
  try {
    const resenas = await biblioteca.listarResenas();
    res.status(200).json({ message: `Resenas de libros`, resenas });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el listado de resenas" });
  }
});

router.get("/resenas/:id_libro", async (req, res) => {
  const { id_libro } = req.params;
  try {
    const resenas = await biblioteca.listarResenasLibro(id_libro);
    res.status(200).json({ message: `Resenas del libro`, resenas });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el listado de resenas" });
  }
});

router.post("/resenas/crearResena", async (req, res) => {
  const { id_libro, usuario, calificacion, comentario } = req.body;

  if (!id_libro || !usuario || !calificacion || !comentario) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const resenaId = await biblioteca.crearResena(
      id_libro,
      usuario,
      calificacion,
      comentario
    );

    res
      .status(201)
      .json({ message: "Resena agregada exitosamente", id: resenaId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al agregar la resena", error: error.message });
  }
});

module.exports = router;
