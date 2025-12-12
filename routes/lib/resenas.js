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

router.get("/resenas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const resena = await biblioteca.obtenerResena(id);
    res.status(200).json({ message: `Resena del libro`, resena });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener la resena" });
  }
});

router.get("/resenas/usuario/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const resenas = await biblioteca.listarResenasUsuario(userId);
    res.status(200).json({ message: `Resenas del usuario`, resenas });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el listado de resenas" });
  }
});

router.put("/resenas/editar/:id", async (req, res) => {
  const { id } = req.params;
  const { calificacion, comentario } = req.body;

  if (!calificacion || !comentario) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const updatedResena = await biblioteca.editarResena(
      id,
      calificacion,
      comentario
    );
    res
      .status(201)
      .json({ message: "Resena actualizada exitosamente", updatedResena });
  } catch (err) {
    if (err.message === "Resena no encontrada") {
      return res.status(400).json({ message: "Resena no encontrada" });
    }
    res.status(500).json({
      message: "Ocurrio un error al actualizar la resena",
      error: err.message,
    });
  }
});

router.get("/resenas/libro/:id_libro", async (req, res) => {
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

router.delete("/resenas/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Faltan campos por rellenar" });
  }
  try {
    const deleteId = await biblioteca.eliminarResena(id);
    res.status(201).json({ message: "La resena ha sido eliminada", deleteId });
  } catch (err) {
    if (err.message === "Resena no encontrada") {
      return res.status(400).json({ message: "Resena no encontrada" });
    } else {
      res.status(500).json({
        message: "Ocurrio un error al eliminar la resena",
        error: err.message,
      });
    }
  }
});

module.exports = router;
